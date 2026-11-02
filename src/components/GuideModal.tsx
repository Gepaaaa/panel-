import React from 'react';
import { 
  BookOpen, 
  X, 
  Smartphone, 
  KeyRound, 
  Code, 
  ShieldCheck, 
  Terminal, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  Volume2,
  Lock,
  BatteryCharging
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Panduan Lengkap Cara Pakai Panel</h2>
              <p className="text-xs text-zinc-400">Ikuti 4 langkah mudah ini agar bot WA kamu aktif 24/7 di HP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-zinc-300">
          {/* Langkah 1 */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center font-mono text-xs">
                  1
                </span>
                <span>Tautkan WhatsApp dengan Auto Pair Code</span>
              </div>
              <button
                onClick={() => { onClose(); onNavigateTab('pairing'); }}
                className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
              >
                Buka Tab Pairing →
              </button>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Kamu tidak perlu scan QR atau butuh 2 HP. Cukup gunakan fitur Pair Code:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 pl-1 font-sans">
              <li>Masuk ke tab <strong>"Auto Pair & Sesi"</strong>.</li>
              <li>Masukkan nomor WhatsApp kamu yang ingin dijadikan bot (contoh: <code className="text-emerald-300 font-mono">6281234567890</code>).</li>
              <li>Klik tombol <strong>"Dapatkan Kode Pairing Otomatis"</strong>.</li>
              <li>Kamu akan menerima 8 digit kode pairing (contoh: <code className="text-emerald-300 font-mono">4K9X-2M8L</code>).</li>
              <li>Buka WhatsApp di HP kamu &gt; Menu Titik Tiga (⋮) &gt; <strong>Perangkat Tertaut</strong> &gt; <strong>Tautkan Perangkat</strong> &gt; Pilih <strong>"Tautkan dengan nomor telepon saja"</strong> &gt; Masukkan 8 kode tadi.</li>
              <li>Selesai! Sesi langsung otomatis tersimpan di memori HP lokal kamu.</li>
            </ol>
          </div>

          {/* Langkah 2 */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center font-mono text-xs">
                  2
                </span>
                <span>Masukkan Source Code Bot Milikmu</span>
              </div>
              <button
                onClick={() => { onClose(); onNavigateTab('code'); }}
                className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
              >
                Buka Tab Code →
              </button>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Karena kamu sudah punya source code bot sendiri:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-300 pl-1">
              <li>Buka tab <strong>"Source Code & Rules"</strong>.</li>
              <li>Kamu bisa <strong>Upload File .js</strong> milikmu atau langsung <strong>Copy-Paste</strong> isi script kamu ke dalam editor.</li>
              <li>Klik <strong>"Simpan & Reload"</strong>. Kode akan langsung tersimpan di penyimpanan IndexedDB HP kamu.</li>
              <li>Kamu juga bisa menambah respon cepat pada sub-tab <strong>"Perintah Cepat"</strong> tanpa coding sama sekali!</li>
            </ul>
          </div>

          {/* Langkah 3 */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center font-mono text-xs">
                  3
                </span>
                <span>Aktifkan 24/7 Anti-Sleep Agar Bot Tidak Mati</span>
              </div>
              <button
                onClick={() => { onClose(); onNavigateTab('dashboard'); }}
                className="text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                Buka Dashboard →
              </button>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Agar bot tidak dimatikan oleh sistem Android (MIUI, Samsung, Vivo, Oppo) saat layar HP mati:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Screen Wake Lock (ON)
                </div>
                <p className="text-zinc-400">Menjaga CPU HP tetap menyala saat tab terbuka.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="font-semibold text-emerald-300 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" /> Silent Audio Loop (ON)
                </div>
                <p className="text-zinc-400">Memberi prioritas tinggi agar browser tidak dibekukan OS HP.</p>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/50 text-[11px] text-amber-200">
              💡 <strong>Tips Tambahan di HP:</strong> Matikan "Penghemat Baterai" (Battery Saver) untuk aplikasi browser kamu agar sistem Android tidak membatasi proses di latar belakang.
            </div>
          </div>

          {/* Langkah 4 */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center font-mono text-xs">
                  4
                </span>
                <span>Uji Coba Respon Bot Langsung</span>
              </div>
              <button
                onClick={() => { onClose(); onNavigateTab('simulator'); }}
                className="text-[11px] font-semibold text-purple-400 hover:underline flex items-center gap-1"
              >
                Buka Simulator →
              </button>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Sebelum membagikan bot ke teman atau grup WA, kamu bisa mengujinya:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-300 pl-1">
              <li>Buka tab <strong>"Live Simulator"</strong> untuk chat langsung dengan bot seperti di WhatsApp asli.</li>
              <li>Ketik <code className="text-emerald-400 font-mono">!ping</code>, <code className="text-emerald-400 font-mono">!menu</code>, atau perintah kustom milikmu.</li>
              <li>Buka tab <strong>"Terminal Logs"</strong> untuk memantau lalu lintas WebSocket dan performa latensi milidetik.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
          >
            Saya Mengerti, Mulai Sekarang!
          </button>
        </div>
      </div>
    </div>
  );
};
