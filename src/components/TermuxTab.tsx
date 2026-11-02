import React, { useState } from 'react';
import { SessionData } from '../types';
import { 
  Terminal, 
  Copy, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  FileCode2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { TermuxBridge } from '../services/termuxBridge';

interface TermuxTabProps {
  session: SessionData | null;
}

export const TermuxTab: React.FC<TermuxTabProps> = ({ session }) => {
  const [copied, setCopied] = useState(false);
  const termuxScript = TermuxBridge.generateTermuxScript(
    session?.credsContent || '',
    ''
  );

  const handleCopyScript = () => {
    navigator.clipboard.writeText(termuxScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Termux 24/7 Background Runner (HP Android)
            </h2>
            <p className="text-xs text-zinc-400">
              Jalankan bot langsung di memori HP menggunakan Termux + PM2 agar 100% tidak pernah mati walau browser ditutup
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyScript}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Script Termux Disalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Salin 1-Klik Script Termux</span>
            </>
          )}
        </button>
      </div>

      {/* 1-SHOT AUTO-INSTALLER HERO BOX */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-zinc-900 to-zinc-900 border-2 border-emerald-500/50 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm">⚡</span>
            <div>
              <h3 className="text-sm font-bold text-white">
                1-Kali Jalan Langsung Beres (Setelah Reinstall Termux)
              </h3>
              <p className="text-xs text-zinc-400">
                Otomatis: WakeLock ON + Node.js + Baileys + PM2 + Auto Reconnect 24/7
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
            PASTI JALAN 100%
          </span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Setelah Termux kamu di-reinstall atau di-clear data, cukup salin baris perintah ini lalu tekan <strong className="text-white">Enter</strong>. Bot akan menginstal seluruh modul tanpa error <code className="text-red-300 font-mono">MODULE_NOT_FOUND</code> dan langsung menampilkan kode pairing / status bot:
        </p>

        <div className="relative">
          <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap break-all select-all leading-relaxed">
            curl -sL https://raw.githubusercontent.com/Gepaaaa/bot/main/termux.sh | bash
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={() => {
              navigator.clipboard.writeText("curl -sL https://raw.githubusercontent.com/Gepaaaa/bot/main/termux.sh | bash");
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-700/20 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Perintah 1-Baris Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Perintah 1-Kali Jalan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Troubleshooting NDK / libc++ Error Box */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <h4 className="text-xs font-bold text-amber-300">
              Mengatasi Error: <code className="font-mono text-zinc-200 bg-zinc-950 px-1.5 py-0.5 rounded text-[11px]">CANNOT LINK EXECUTABLE "node"</code> &amp; <code className="font-mono text-zinc-200 bg-zinc-950 px-1.5 py-0.5 rounded text-[11px]">No command pm2 found</code>
            </h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-200 border border-amber-700/60 font-mono">
            Solusi Termux HP
          </span>
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          Penyebab: Pustaka C++ (<code className="text-amber-300 font-mono">libc++</code>) di Termux kamu belum sinkron dengan versi Node.js yang baru diunduh. Salin perintah perbaikan di bawah ini dan tempel di Termux:
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <code className="flex-1 p-2.5 rounded-xl bg-zinc-950 text-xs font-mono text-emerald-300 border border-zinc-800 select-all overflow-x-auto whitespace-pre-wrap">
            pkg update -y && pkg install -y libc++ && pkg upgrade -y && pkg install -y nodejs-lts git curl && npm install -g pm2
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText("pkg update -y && pkg install -y libc++ && pkg upgrade -y && pkg install -y nodejs-lts git curl && npm install -g pm2");
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold whitespace-nowrap active:scale-95 transition-all shadow-md shadow-amber-800/20"
          >
            Salin Perintah Fix
          </button>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center font-mono">1</span>
            <span>Instal Termux di HP</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Unduh aplikasi <strong>Termux</strong> dari F-Droid (jangan dari Play Store karena versi Play Store sudah deprecated).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center font-mono">2</span>
            <span>Aktifkan Wake Lock</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Ketik <code className="text-cyan-300 font-mono">termux-wake-lock</code> di Termux agar HP tidak menidurkan proses saat layar mati.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center font-mono">3</span>
            <span>Jalankan dengan PM2</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            PM2 secara otomatis merestart bot jika terjadi error atau koneksi terputus. Bot kamu akan aktif 24/7 non-stop!
          </p>
        </div>
      </div>

      {/* Script Preview Box */}
      <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-zinc-300 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Script Shell Otomatis (run-wabot-local.sh)
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {session ? 'Termasuk Session Baileys HP Kamu' : 'Gunakan Kode Pairing di Panel'}
          </span>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto max-h-96 leading-relaxed select-text">
            {termuxScript}
          </pre>
        </div>

        {/* Tip for Battery Optimization */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-100">Tips Penting Agar Tidak Mati di HP (Xiaomi, Samsung, Oppo, Vivo):</strong>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              Buka Pengaturan HP -&gt; Aplikasi -&gt; Termux -&gt; Penghemat Baterai (Battery Saver) -&gt; Ubah menjadi <strong>"Tidak ada pembatasan" (No Restrictions)</strong> dan aktifkan <strong>"Mulai Otomatis" (Autostart)</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
