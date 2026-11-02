import React from 'react';
import { ConnectionStatus, AntiSleepState, LocalStorageMetrics } from '../types';
import { 
  Bot, 
  Power, 
  Smartphone, 
  ShieldCheck, 
  BatteryCharging, 
  Battery, 
  HardDrive,
  Volume2,
  Lock
} from 'lucide-react';

interface HeaderProps {
  status: ConnectionStatus;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  antiSleep: AntiSleepState;
  storage: LocalStorageMetrics;
  onToggleBot: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeTab,
  setActiveTab,
  antiSleep,
  storage,
  onToggleBot,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Online 24/7 (HP Lokal)
          </span>
        );
      case 'pairing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            Menunggu Pair Code
          </span>
        );
      case 'requesting_code':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-spin"></span>
            Membuat Kode...
          </span>
        );
      case 'reconnecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            Auto-Reconnecting...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
            Offline / Standby
          </span>
        );
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Anti-Sleep', icon: '📊' },
    { id: 'pairing', label: 'Auto Pair & Sesi', icon: '🔗' },
    { id: 'code', label: 'Source Code & Rules', icon: '💻' },
    { id: 'terminal', label: 'Terminal Logs', icon: '📟' },
    { id: 'simulator', label: 'Live Simulator', icon: '💬' },
    { id: 'termux', label: 'Termux 24/7', icon: '📱' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
            <Bot className="w-6 h-6 text-emerald-100" />
            {status === 'connected' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                WAPanel <span className="text-emerald-400 font-mono text-sm px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">Local</span>
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Host Bot WA di Memori HP Lokal • Bebas VPS • 24/7 Anti-Sleep
            </p>
          </div>
        </div>

        {/* Status Indicators & Action */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Storage HP metric pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400">Penyimpanan HP:</span>
            <span className="font-mono font-medium text-cyan-300">
              {(storage.usedBytes / (1024 * 1024)).toFixed(1)} MB
            </span>
          </div>

          {/* WakeLock indicator */}
          <div 
            title={antiSleep.wakeLockActive ? 'Screen WakeLock aktif (Layar & CPU HP terjaga)' : 'WakeLock nonaktif'} 
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border ${
              antiSleep.wakeLockActive 
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-300' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WakeLock:</span>
            <span>{antiSleep.wakeLockActive ? 'ON' : 'OFF'}</span>
          </div>

          {/* Audio KeepAlive indicator */}
          <div 
            title={antiSleep.silentAudioActive ? 'Silent Audio Loop aktif (Mencegah browser dibekukan OS HP)' : 'Audio loop nonaktif'} 
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border ${
              antiSleep.silentAudioActive 
                ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">24/7 Loop:</span>
            <span>{antiSleep.silentAudioActive ? 'ON' : 'OFF'}</span>
          </div>

          {/* Battery pill if supported */}
          {antiSleep.batteryLevel !== null && (
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              {antiSleep.batteryCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Battery className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="font-mono">{antiSleep.batteryLevel}%</span>
            </div>
          )}

          {/* Toggle Bot Button */}
          <button
            onClick={onToggleBot}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 ${
              status === 'connected'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-700/20'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{status === 'connected' ? 'Hentikan Bot' : 'Jalankan Bot'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar border-t border-zinc-900 pt-1 pb-1">
        {navItems.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-zinc-800/90 text-emerald-400 border border-zinc-700/70 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
