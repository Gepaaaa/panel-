import React, { useState, useEffect } from 'react';
import { 
  ConnectionStatus, 
  SessionData, 
  AntiSleepState, 
  LocalStorageMetrics, 
  LogEntry, 
  SimulatorMessage 
} from './types';
import { botEngine } from './services/botEngine';
import { keepAliveDaemon } from './services/keepAliveDaemon';
import { localStorageService } from './services/localStorageService';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { PairingTab } from './components/PairingTab';
import { CodeManagerTab } from './components/CodeManagerTab';
import { TerminalTab } from './components/TerminalTab';
import { SimulatorTab } from './components/SimulatorTab';
import { TermuxTab } from './components/TermuxTab';
import { GuideModal } from './components/GuideModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>(botEngine.getStatus());
  const [session, setSession] = useState<SessionData | null>(botEngine.getSession());
  const [antiSleep, setAntiSleep] = useState<AntiSleepState>(keepAliveDaemon.getState());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [simulatorMessages, setSimulatorMessages] = useState<SimulatorMessage[]>([]);
  const [stats, setStats] = useState(botEngine.getStats());
  const [storage, setStorage] = useState<LocalStorageMetrics>({
    usedBytes: 14 * 1024 * 1024,
    quotaBytes: 40 * 1024 * 1024 * 1024,
    usagePercentage: 0.05,
    indexedDbSizeKb: 64,
    logsCount: 12,
    filesCount: 2,
    cacheSizeKb: 14000,
  });

  // Subscribe to services on mount
  useEffect(() => {
    const unsubStatus = botEngine.onStatusChange((newStatus) => {
      setStatus(newStatus);
      setSession(botEngine.getSession());
    });

    const unsubLogs = botEngine.onLogs((newLogs) => {
      setLogs(newLogs);
    });

    const unsubSim = botEngine.onSimulator((msgs) => {
      setSimulatorMessages(msgs);
    });

    const unsubStats = botEngine.onStats((newStats) => {
      setStats(newStats);
    });

    const unsubAntiSleep = keepAliveDaemon.subscribe((newState) => {
      setAntiSleep(newState);
    });

    refreshStorageMetrics();

    // Initial log welcome
    botEngine.addLog('info', 'Panel Bot WA Pribadi (HP Local Engine) siap digunakan.', 'INIT');
    botEngine.addLog('info', 'Penyimpanan lokal: IndexedDB aktif (Memori HP).', 'STORAGE');

    return () => {
      unsubStatus();
      unsubLogs();
      unsubSim();
      unsubStats();
      unsubAntiSleep();
    };
  }, []);

  const refreshStorageMetrics = async () => {
    try {
      const metrics = await localStorageService.getStorageMetrics();
      setStorage(metrics);
    } catch (e) {
      console.warn('Gagal membaca storage metrics:', e);
    }
  };

  const handleToggleBot = async () => {
    if (status === 'connected') {
      await botEngine.stopBot();
    } else {
      if (!session) {
        setActiveTab('pairing');
      } else {
        await botEngine.startBot();
      }
    }
  };

  const handleToggleWakeLock = async () => {
    if (antiSleep.wakeLockActive) {
      keepAliveDaemon.releaseWakeLock();
      botEngine.addLog('warn', 'Screen Wake Lock dinonaktifkan.', 'DAEMON');
    } else {
      const ok = await keepAliveDaemon.enableWakeLock();
      if (ok) {
        botEngine.addLog('success', 'Screen Wake Lock diaktifkan (Anti-Sleep HP).', 'DAEMON');
      } else {
        botEngine.addLog('error', 'Gagal mengaktifkan Wake Lock (Browser tidak mengizinkan).', 'DAEMON');
      }
    }
  };

  const handleToggleSilentAudio = () => {
    if (antiSleep.silentAudioActive) {
      keepAliveDaemon.disableSilentAudio();
      botEngine.addLog('warn', 'Silent Audio Loop dinonaktifkan.', 'DAEMON');
    } else {
      keepAliveDaemon.enableSilentAudio();
      botEngine.addLog('success', 'Silent Audio Loop diaktifkan (Mencegah browser dibekukan OS HP).', 'DAEMON');
    }
  };

  const handleToggleWorkerPulse = () => {
    if (antiSleep.workerPulseActive) {
      keepAliveDaemon.disableWorkerPulse();
      botEngine.addLog('warn', 'Web Worker Heartbeat dinonaktifkan.', 'DAEMON');
    } else {
      keepAliveDaemon.enableWorkerPulse();
      botEngine.addLog('success', 'Web Worker Heartbeat diaktifkan.', 'DAEMON');
    }
  };

  const handleToggleAutoReconnect = () => {
    const nextVal = !antiSleep.autoReconnect;
    keepAliveDaemon.setAutoReconnect(nextVal);
    botEngine.addLog('info', `Auto-Reconnect Watchdog diubah ke: ${nextVal ? 'AKTIF' : 'NONAKTIF'}`, 'WATCHDOG');
  };

  const handleExportBackup = async () => {
    try {
      const backupJson = await localStorageService.exportFullBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_wabot_sesi_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      botEngine.addLog('success', 'Backup sesi dan script berhasil di-export ke penyimpanan HP.', 'BACKUP');
    } catch (e: any) {
      botEngine.addLog('error', 'Gagal export backup: ' + e.message, 'BACKUP');
    }
  };

  const handleClearCache = async () => {
    if (confirm('Yakin ingin membersihkan riwayat log dan cache sementara di HP? Sesi dan source code bot akan tetap aman.')) {
      await localStorageService.clearAllLocalCache();
      botEngine.addLog('warn', 'Cache dan log lokal berhasil dibersihkan.', 'CACHE');
      await refreshStorageMetrics();
    }
  };

  const handleRequestPairingCode = async (phone: string) => {
    const code = await botEngine.requestPairingCode(phone);
    await refreshStorageMetrics();
    return code;
  };

  const handleConfirmPairingSuccess = async () => {
    await botEngine.confirmPairingSuccess();
    await refreshStorageMetrics();
    setActiveTab('dashboard');
  };

  const handleImportSession = async (sessionStr: string) => {
    await botEngine.importSessionDirect(sessionStr);
    await refreshStorageMetrics();
    setActiveTab('dashboard');
  };

  const handleLogoutSession = async () => {
    if (confirm('Yakin ingin menghapus sesi WhatsApp dari memori HP lokal ini?')) {
      await botEngine.logoutSession();
      await refreshStorageMetrics();
    }
  };

  const handleClearLogs = async () => {
    await localStorageService.clearLogs();
    setLogs([]);
    await refreshStorageMetrics();
  };

  const handleClearSimulator = () => {
    botEngine.clearSimulator();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-zinc-100 flex flex-col font-sans selection:bg-emerald-900 selection:text-white">
      {/* App Header */}
      <Header
        status={status}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        antiSleep={antiSleep}
        storage={storage}
        onToggleBot={handleToggleBot}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Interactive Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Tab Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            status={status}
            session={session}
            antiSleep={antiSleep}
            storage={storage}
            stats={stats}
            onToggleWakeLock={handleToggleWakeLock}
            onToggleSilentAudio={handleToggleSilentAudio}
            onToggleWorkerPulse={handleToggleWorkerPulse}
            onToggleAutoReconnect={handleToggleAutoReconnect}
            onExportBackup={handleExportBackup}
            onClearCache={handleClearCache}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'pairing' && (
          <PairingTab
            status={status}
            session={session}
            onRequestPairingCode={handleRequestPairingCode}
            onConfirmSuccess={handleConfirmPairingSuccess}
            onImportSession={handleImportSession}
            onLogoutSession={handleLogoutSession}
          />
        )}

        {activeTab === 'code' && (
          <CodeManagerTab onRefreshStorage={refreshStorageMetrics} />
        )}

        {activeTab === 'terminal' && (
          <TerminalTab logs={logs} onClearLogs={handleClearLogs} />
        )}

        {activeTab === 'simulator' && (
          <SimulatorTab
            messages={simulatorMessages}
            session={session}
            onClearMessages={handleClearSimulator}
          />
        )}

        {activeTab === 'termux' && (
          <TermuxTab session={session} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-3 px-4 text-center text-xs text-zinc-500 bg-zinc-950/60">
        <p>
          WAPanel Local Engine • Memori HP Lokal (IndexedDB) • Bebas Biaya Server Eksternal • 24/7 Anti-Sleep
        </p>
      </footer>
    </div>
  );
}
