import React, { useState, useEffect } from 'react';
import { ConnectionStatus, SessionData } from '../types';
import { 
  KeyRound, 
  Smartphone, 
  Copy, 
  Check, 
  RefreshCw, 
  Upload, 
  ShieldCheck, 
  LogOut, 
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface PairingTabProps {
  status: ConnectionStatus;
  session: SessionData | null;
  onRequestPairingCode: (phone: string) => Promise<string>;
  onConfirmSuccess: () => Promise<void>;
  onImportSession: (sessionStr: string) => Promise<void>;
  onLogoutSession: () => Promise<void>;
}

export const PairingTab: React.FC<PairingTabProps> = ({
  status,
  session,
  onRequestPairingCode,
  onConfirmSuccess,
  onImportSession,
  onLogoutSession,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('6289673533963');
  const [generatedCode, setGeneratedCode] = useState(session?.pairingCode || '');
  const [countdown, setCountdown] = useState(60);
  const [isCopied, setIsCopied] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importTab, setImportTab] = useState<'paircode' | 'session_string'>('paircode');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (session?.pairingCode) {
      setGeneratedCode(session.pairingCode);
    }
  }, [session]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsRequesting(true);
    try {
      const code = await onRequestPairingCode(phoneNumber);
      setGeneratedCode(code);
      setCountdown(60);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal meminta kode pairing');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode.replace('-', ''));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    setErrorMessage('');
    try {
      await onImportSession(importText);
      setImportText('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengimpor sesi');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Session Active Notice if Connected */}
      {status === 'connected' && session && (
        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Sesi WhatsApp Terhubung 24/7</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  +{session.phoneNumber}
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Device: <span className="font-mono text-emerald-400">{session.deviceName}</span> • Tersimpan di IndexedDB Lokal HP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={onLogoutSession}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-semibold border border-red-800/60 transition-all active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Putuskan / Hapus Sesi</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs Switcher: Pair Code vs Session Input */}
      <div className="flex rounded-xl bg-zinc-900/80 p-1 border border-zinc-800 max-w-md">
        <button
          onClick={() => setImportTab('paircode')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            importTab === 'paircode'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Auto Pair Code (Rekomendasi)</span>
        </button>
        <button
          onClick={() => setImportTab('session_string')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            importTab === 'session_string'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Input Session / Creds.json</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* MODE 1: AUTO PAIR CODE */}
      {importTab === 'paircode' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Request Code */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/80">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Tautkan WhatsApp Tanpa Scan QR
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Cukup masukkan nomor WA kamu dan dapatkan kode pairing 8 digit otomatis
                  </p>
                </div>
              </div>

              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Nomor WhatsApp Kamu (Awali dengan kode negara, contoh 628xxx)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 text-sm font-mono">
                      +
                    </div>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="6281234567890"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Format internasional tanpa spasi atau strip (+62 untuk Indonesia).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isRequesting || status === 'requesting_code'}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isRequesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Meminta Kode dari WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Dapatkan Kode Pairing Otomatis</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Generated Code Display Box */}
            {generatedCode && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 border border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    KODE PAIRING WHATSAPP KAMU:
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kadaluarsa dalam {countdown}s</span>
                  </div>
                </div>

                {/* Big Code Blocks */}
                <div className="py-3 px-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-2 sm:gap-3">
                  {generatedCode.split('').map((char, index) => {
                    if (char === '-') {
                      return (
                        <span key={index} className="text-zinc-600 font-mono text-xl sm:text-2xl font-bold">
                          -
                        </span>
                      );
                    }
                    return (
                      <div
                        key={index}
                        className="w-8 h-10 sm:w-10 sm:h-12 rounded-lg bg-zinc-900 border border-emerald-500/50 flex items-center justify-center text-lg sm:text-2xl font-mono font-bold text-emerald-300 shadow-inner"
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold border border-zinc-700 transition-all active:scale-95"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Kode Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-cyan-400" />
                        <span>Salin Kode Pairing</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onConfirmSuccess}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saya Sudah Input di WA</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Step-by-Step Instructions */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                Cara Menautkan WhatsApp di HP:
              </h3>

              <div className="space-y-3">
                <div className="flex gap-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                    1
                  </div>
                  <div className="text-xs text-zinc-300 space-y-0.5">
                    <strong className="text-zinc-100">Buka WhatsApp di HP kamu</strong>
                    <p className="text-zinc-400 text-[11px]">
                      Buka aplikasi WhatsApp utama di HP kamu yang ingin dijadikan bot.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                    2
                  </div>
                  <div className="text-xs text-zinc-300 space-y-0.5">
                    <strong className="text-zinc-100">Buka Menu Perangkat Tertaut</strong>
                    <p className="text-zinc-400 text-[11px]">
                      Ketuk Titik Tiga (⋮) di pojok kanan atas Android (atau tab Pengaturan ⚙️ di iPhone) lalu pilih <span className="text-emerald-400">"Perangkat Tertaut" (Linked Devices)</span>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                    3
                  </div>
                  <div className="text-xs text-zinc-300 space-y-0.5">
                    <strong className="text-zinc-100">Pilih "Tautkan dengan nomor telepon saja"</strong>
                    <p className="text-zinc-400 text-[11px]">
                      Di bagian bawah layar pemindai kamera QR, ketuk link teks kecil <span className="text-emerald-400">"Tautkan dengan nomor telepon saja"</span>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                    4
                  </div>
                  <div className="text-xs text-zinc-300 space-y-0.5">
                    <strong className="text-zinc-100">Ketik 8 Huruf Kode Pairing</strong>
                    <p className="text-zinc-400 text-[11px]">
                      Ketikkan 8 karakter kode pairing di atas. Notifikasi WhatsApp akan muncul dan sesi otomatis terhubung 24/7!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: DIRECT SESSION / CREDS.JSON INPUT */}
      {importTab === 'session_string' && (
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 max-w-2xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Import Sesi Baileys (creds.json / Base64)
              </h3>
              <p className="text-xs text-zinc-400">
                Punya sesi yang sudah jadi? Tempel atau upload file creds.json ke penyimpanan lokal HP.
              </p>
            </div>
          </div>

          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Upload File creds.json
              </label>
              <input
                type="file"
                accept=".json,.txt"
                onChange={handleFileUpload}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-emerald-400 hover:file:bg-zinc-700 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Atau Tempel Teks Sesi / JSON Disini:
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"noiseKey":{"private":"..."}, "signedIdentityKey":{"private":"..."}, ...}'
                rows={6}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={!importText.trim()}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-700/20 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              Simpan ke Penyimpanan HP & Mulai Sesi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
