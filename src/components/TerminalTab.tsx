import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { 
  Terminal, 
  Trash2, 
  Download, 
  Search, 
  Send, 
  ArrowDownCircle, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { botEngine } from '../services/botEngine';

interface TerminalTabProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const TerminalTab: React.FC<TerminalTabProps> = ({ logs, onClearLogs }) => {
  const [filterText, setFilterText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [commandInput, setCommandInput] = useState('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    const matchesText = log.message.toLowerCase().includes(filterText.toLowerCase()) ||
      (log.tag && log.tag.toLowerCase().includes(filterText.toLowerCase()));
    const matchesTag = selectedTag === 'all' || log.tag === selectedTag;
    return matchesText && matchesTag;
  });

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    setCommandInput('');
    botEngine.addLog('cmd', `Terminal Exec: "${cmd}"`, 'TERMINAL');
    await botEngine.handleIncomingMessage(cmd, 'Terminal Root');
  };

  const handleDownloadLogs = () => {
    const textContent = logs
      .map((l) => `[${l.timestamp}] [${l.tag || 'LOG'}] ${l.message}`)
      .join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wabot_logs_${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTagColor = (tag?: string) => {
    switch (tag) {
      case 'BAILEYS':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60';
      case 'PAIRING':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
      case 'WATCHDOG':
        return 'text-purple-400 bg-purple-950/60 border-purple-800/60';
      case 'DAEMON':
        return 'text-pink-400 bg-pink-950/60 border-pink-800/60';
      case 'MESSAGE':
      case 'REPLY':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      case 'ERROR':
        return 'text-red-400 bg-red-950/60 border-red-800/60';
      default:
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Cari dalam log terminal..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-300 focus:outline-none"
          >
            <option value="all">Semua Tag</option>
            <option value="BAILEYS">BAILEYS</option>
            <option value="PAIRING">PAIRING</option>
            <option value="WATCHDOG">WATCHDOG</option>
            <option value="DAEMON">DAEMON</option>
            <option value="MESSAGE">MESSAGE</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              autoScroll
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-600/40'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleDownloadLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
            title="Download Log"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export Log</span>
          </button>

          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-zinc-300 hover:text-red-300 border border-zinc-700 hover:border-red-800"
            title="Bersihkan Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Display Screen */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Terminal Title Bar */}
        <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-xs font-mono text-zinc-400 ml-2">
              bash - wabot-daemon@localhost (local-storage-v1)
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {filteredLogs.length} logs
          </span>
        </div>

        {/* Scrollable logs body */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 select-text">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs font-mono">
              <Terminal className="w-8 h-8 text-zinc-700 mb-2" />
              <span>Belum ada log terminal. Jalankan bot atau ketik perintah di bawah.</span>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-zinc-900/40 px-1 py-0.5 rounded">
                <span className="text-zinc-500 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 border ${getTagColor(log.tag)}`}>
                  {log.tag || 'LOG'}
                </span>
                <span
                  className={
                    log.level === 'error'
                      ? 'text-red-400'
                      : log.level === 'warn'
                      ? 'text-amber-300'
                      : log.level === 'success'
                      ? 'text-emerald-300'
                      : log.level === 'cmd'
                      ? 'text-yellow-200'
                      : 'text-zinc-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={terminalBottomRef} />
        </div>

        {/* Terminal Input Prompt */}
        <form onSubmit={handleSendCommand} className="p-2.5 bg-zinc-900/90 border-t border-zinc-800 flex items-center gap-2">
          <span className="text-emerald-400 font-mono text-xs pl-2 font-bold flex items-center gap-1">
            <span>bot@local</span>
            <span className="text-zinc-500">:</span>
            <span className="text-cyan-400">~</span>
            <span>$</span>
          </span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Ketik perintah uji, contoh: !ping, !menu, !status, !runtime..."
            className="flex-1 bg-transparent border-0 text-xs font-mono text-zinc-100 focus:outline-none placeholder:text-zinc-600"
          />
          <button
            type="submit"
            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            title="Kirim ke Bot Engine"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
