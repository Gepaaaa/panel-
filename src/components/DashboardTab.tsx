import React from 'react';
import { ConnectionStatus, AntiSleepState, LocalStorageMetrics, SessionData } from '../types';
import { 
  ShieldCheck, 
  HardDrive, 
  Zap, 
  Activity, 
  RotateCcw, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Smartphone,
  Cpu,
  Volume2,
  Lock,
  Radio,
  FileCode2,
  Clock
} from 'lucide-react';

interface DashboardTabProps {
  status: ConnectionStatus;
  session: SessionData | null;
  antiSleep: AntiSleepState;
  storage: LocalStorageMetrics;
  stats: {
    messagesReceived: number;
    messagesSent: number;
    commandsExecuted: number;
    pingMs: number;
  };
  onToggleWakeLock: () => void;
  onToggleSilentAudio: () => void;
  onToggleWorkerPulse: () => void;
  onToggleAutoReconnect: () => void;
  onExportBackup: () => void;
  onClearCache: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  status,
  session,
  antiSleep,
  storage,
  stats,
  onToggleWakeLock,
  onToggleSilentAudio,
  onToggleWorkerPulse,
  onToggleAutoReconnect,
  onExportBackup,
  onClearCache,
  onNavigateTab,
}) => {
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const usedMb = (storage.usedBytes / (1024 * 1024)).toFixed(2);
  const quotaGb = (storage.quotaBytes / (1024 * 1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Disconnected */}
      {status === 'disconnected' && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Bot Belum Ditautkan ke WhatsApp
              </h3>
              <p className="text-xs text-zinc-400">
                Gunakan fitur Auto Pair Code untuk menghubungkan nomor WhatsApp kamu dalam hitungan detik.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('pairing')}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold whitespace-nowrap shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
          >
            Minta Kode Pairing Sekarang →
          </button>
        </div>
      )}

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Uptime */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">24/7 Uptime</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              {formatUptime(antiSleep.uptimeSeconds)}
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {status === 'connected' ? 'Stabil di memori HP' : 'Siap dijalankan'}
            </div>
          </div>
        </div>

        {/* Card 2: Ping & Latency */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">WebSocket Ping</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
              {status === 'connected' ? `${stats.pingMs} ms` : '-- ms'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {stats.pingMs < 40 ? 'Sangat Cepat (Optimal)' : 'Respon Normal'}
            </div>
          </div>
        </div>

        {/* Card 3: Pesan Diproses */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Pesan Masuk/Keluar</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
              {stats.messagesReceived} / {stats.messagesSent}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {stats.commandsExecuted} Perintah Berhasil
            </div>
          </div>
        </div>

        {/* Card 4: Memori HP Lokal */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Storage HP Terpakai</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-teal-300">
              {usedMb} MB
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              IndexedDB DB: {storage.indexedDbSizeKb} KB
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 24/7 Anti-Sleep Daemon (Left) + Phone Storage Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 24/7 Anti-Sleep Supervisor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    24/7 Anti-Sleep Supervisor
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Sistem 4-lapis pencegah bot mati saat HP standby / layar mati
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                ACTIVE GUARD
              </span>
            </div>

            {/* Explanatory callout for why phone bots die */}
            <div className="my-4 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
              <span className="font-semibold text-amber-300">💡 Mengapa Bot WA di HP Sering Mati Sendiri?</span>
              <p className="mt-1 text-zinc-400">
                Sistem Android (MIUI, Samsung OneUI, ColorOS) secara default membekukan browser jika layar mati atau tab berpindah ke background. Panel ini mengaktifkan <strong className="text-zinc-200">Screen WakeLock + Inaudible Audio Loop</strong> agar OS menganggap aplikasi sedang memutar audio aktif dan tidak akan pernah membunuh proses bot!
              </p>
            </div>

            {/* 4 Defense Switches */}
            <div className="space-y-3">
              {/* Defense 1: WakeLock */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${antiSleep.wakeLockActive ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">Screen Wake Lock API</span>
                      {antiSleep.wakeLockActive && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          Layar & CPU ON
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Mencegah CPU HP masuk ke mode deep sleep saat bot berjalan.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onToggleWakeLock}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    antiSleep.wakeLockActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {antiSleep.wakeLockActive ? 'AKTIF' : 'NONAKTIF'}
                </button>
              </div>

              {/* Defense 2: Silent Audio Loop */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${antiSleep.silentAudioActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">Silent Audio Keep-Alive Loop</span>
                      {antiSleep.silentAudioActive && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Priority High
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Mengirimkan sinyal audio 0dB agar browser tidak dibekukan di latar belakang.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onToggleSilentAudio}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    antiSleep.silentAudioActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {antiSleep.silentAudioActive ? 'AKTIF' : 'NONAKTIF'}
                </button>
              </div>

              {/* Defense 3: Web Worker Heartbeat */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${antiSleep.workerPulseActive ? 'bg-cyan-500/15 text-cyan-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">Web Worker Pulse (Heartbeat)</span>
                      {antiSleep.workerPulseActive && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          Setiap 3s
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Thread independen yang kebal terhadap pembatasan timer JavaScript.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onToggleWorkerPulse}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    antiSleep.workerPulseActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {antiSleep.workerPulseActive ? 'AKTIF' : 'NONAKTIF'}
                </button>
              </div>

              {/* Defense 4: Auto-Reconnect Watchdog */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${antiSleep.autoReconnect ? 'bg-purple-500/15 text-purple-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">Auto-Reconnect Watchdog</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        ({antiSleep.reconnectAttempts}x Reconnected)
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Otomatis menyambungkan ulang Baileys jika terjadi disconnect atau pergantian WiFi/Data.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onToggleAutoReconnect}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    antiSleep.autoReconnect
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {antiSleep.autoReconnect ? 'AKTIF' : 'NONAKTIF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Phone Local Storage Engine */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Penyimpanan HP Lokal
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Semua sesi, kode, dan log tersimpan di HP kamu
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                IndexedDB
              </span>
            </div>

            {/* Storage Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Kapasitas HP Tersedia:</span>
                <span className="font-mono text-zinc-200">{quotaGb} GB</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(3, storage.usagePercentage))}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Terpakai oleh Bot: <strong className="text-cyan-300 font-mono">{usedMb} MB</strong></span>
                <span>Bebas biaya cloud/server</span>
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/60 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400">Database Name:</span>
                <span className="font-mono text-zinc-300">WABotLocalStorageDB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400">Status Sesi WhatsApp:</span>
                <span className="font-mono font-medium text-emerald-400">
                  {session ? `Tersimpan (+${session.phoneNumber})` : 'Belum Ada Sesi'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400">Jumlah File Script Bot:</span>
                <span className="font-mono text-zinc-300">{storage.filesCount} file tersimpan</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Catatan Log Terminal:</span>
                <span className="font-mono text-zinc-300">{storage.logsCount} entri</span>
              </div>
            </div>

            {/* Storage Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={onExportBackup}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Sesi (.json)</span>
              </button>

              <button
                onClick={onClearCache}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-medium border border-red-800/50 transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Cache</span>
              </button>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Privasi Terjaga 100%</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Token autentikasi multi-device, private keys, dan riwayat pesan dienkripsi secara lokal di penyimpanan HP kamu. Tidak ada data rahasia yang dikirim ke server luar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
