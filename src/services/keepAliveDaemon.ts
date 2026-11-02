import { AntiSleepState } from '../types';

export class KeepAliveDaemon {
  private wakeLock: any = null;
  private audioCtx: AudioContext | null = null;
  private audioInterval: any = null;
  private worker: Worker | null = null;
  private heartbeatTimer: any = null;

  private state: AntiSleepState = {
    wakeLockActive: false,
    silentAudioActive: false,
    workerPulseActive: false,
    autoReconnect: true,
    batteryLevel: null,
    batteryCharging: null,
    reconnectAttempts: 0,
    uptimeSeconds: 0,
    lastPulseTime: Date.now(),
  };

  private listeners: ((state: AntiSleepState) => void)[] = [];
  private onReconnectNeeded: (() => void) | null = null;
  private onHeartbeatPulse: (() => void) | null = null;

  constructor() {
    this.initBatteryListener();
    this.initVisibilityListener();
  }

  public subscribe(cb: (state: AntiSleepState) => void): () => void {
    this.listeners.push(cb);
    cb({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb({ ...this.state }));
  }

  public setReconnectHandler(cb: () => void) {
    this.onReconnectNeeded = cb;
  }

  public setHeartbeatHandler(cb: () => void) {
    this.onHeartbeatPulse = cb;
  }

  public getState(): AntiSleepState {
    return { ...this.state };
  }

  // --- 1. Screen Wake Lock ---
  public async enableWakeLock(): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        this.state.wakeLockActive = true;

        this.wakeLock.addEventListener('release', () => {
          this.state.wakeLockActive = false;
          this.notify();
        });

        this.notify();
        return true;
      } catch (err: any) {
        console.warn('Wake Lock request failed:', err.message);
        this.state.wakeLockActive = false;
        this.notify();
        return false;
      }
    }
    return false;
  }

  public releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
    this.state.wakeLockActive = false;
    this.notify();
  }

  // --- 2. Silent Audio Loop (Background Keepalive for Mobile OS) ---
  public enableSilentAudio(): boolean {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return false;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Generate inaudible micro-pulse every 4 seconds to keep audio thread active
      if (this.audioInterval) clearInterval(this.audioInterval);

      const playSilentPulse = () => {
        if (!this.audioCtx || this.audioCtx.state !== 'running') return;
        try {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          gain.gain.setValueAtTime(0.00001, this.audioCtx.currentTime); // Inaudible
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start();
          osc.stop(this.audioCtx.currentTime + 0.1);
        } catch (e) {
          // ignore audio context exceptions
        }
      };

      playSilentPulse();
      this.audioInterval = setInterval(playSilentPulse, 4000);

      this.state.silentAudioActive = true;
      this.notify();
      return true;
    } catch (err) {
      console.warn('Silent audio init failed:', err);
      this.state.silentAudioActive = false;
      this.notify();
      return false;
    }
  }

  public disableSilentAudio() {
    if (this.audioInterval) {
      clearInterval(this.audioInterval);
      this.audioInterval = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
    this.state.silentAudioActive = false;
    this.notify();
  }

  // --- 3. Web Worker Pulse (Throttling immune background timer) ---
  public enableWorkerPulse(): boolean {
    if (typeof Worker === 'undefined') return false;

    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (timer) clearInterval(timer);
            timer = setInterval(function() {
              self.postMessage('pulse');
            }, 3000);
          } else if (e.data === 'stop') {
            if (timer) clearInterval(timer);
            timer = null;
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(workerUrl);

      this.worker.onmessage = (e) => {
        if (e.data === 'pulse') {
          this.state.lastPulseTime = Date.now();
          this.state.uptimeSeconds += 3;
          if (this.onHeartbeatPulse) {
            this.onHeartbeatPulse();
          }
          this.notify();
        }
      };

      this.worker.postMessage('start');
      this.state.workerPulseActive = true;
      this.notify();
      return true;
    } catch (err) {
      console.warn('Worker keep-alive pulse failed:', err);
      return false;
    }
  }

  public disableWorkerPulse() {
    if (this.worker) {
      this.worker.postMessage('stop');
      this.worker.terminate();
      this.worker = null;
    }
    this.state.workerPulseActive = false;
    this.notify();
  }

  // --- Auto Reconnect Toggle ---
  public setAutoReconnect(enabled: boolean) {
    this.state.autoReconnect = enabled;
    this.notify();
  }

  public incrementReconnectAttempt() {
    this.state.reconnectAttempts += 1;
    this.notify();
  }

  public resetReconnectAttempts() {
    this.state.reconnectAttempts = 0;
    this.notify();
  }

  // --- Start Full Anti-Sleep Daemon ---
  public async startAllDaemons(): Promise<void> {
    await this.enableWakeLock();
    this.enableSilentAudio();
    this.enableWorkerPulse();
  }

  public stopAllDaemons() {
    this.releaseWakeLock();
    this.disableSilentAudio();
    this.disableWorkerPulse();
  }

  // --- Internal Listeners ---
  private initVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && this.state.wakeLockActive && !this.wakeLock) {
          // Re-request wakeLock if dropped on minimize
          await this.enableWakeLock();
        }
      });
    }
  }

  private initBatteryListener() {
    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        this.updateBattery(battery);
        battery.addEventListener('levelchange', () => this.updateBattery(battery));
        battery.addEventListener('chargingchange', () => this.updateBattery(battery));
      }).catch(() => {});
    }
  }

  private updateBattery(battery: any) {
    this.state.batteryLevel = Math.round(battery.level * 100);
    this.state.batteryCharging = battery.charging;
    this.notify();
  }
}

export const keepAliveDaemon = new KeepAliveDaemon();
