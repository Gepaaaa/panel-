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
