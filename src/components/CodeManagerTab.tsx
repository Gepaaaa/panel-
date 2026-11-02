import React, { useState, useEffect } from 'react';
import { ScriptFile, CustomCommandRule } from '../types';
import { 
  FileCode2, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  Upload, 
  Code, 
  Play, 
  Settings2, 
  Zap, 
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { localStorageService } from '../services/localStorageService';
import { botEngine } from '../services/botEngine';

interface CodeManagerTabProps {
  onRefreshStorage: () => void;
}

export const CodeManagerTab: React.FC<CodeManagerTabProps> = ({ onRefreshStorage }) => {
  const [subTab, setSubTab] = useState<'editor' | 'rules'>('editor');
  const [scripts, setScripts] = useState<ScriptFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [editorContent, setEditorContent] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [commands, setCommands] = useState<CustomCommandRule[]>([]);

  // New Command State
  const [newTrigger, setNewTrigger] = useState('');
  const [newResponse, setNewResponse] = useState('');

  // New File State
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedScripts = await localStorageService.getAllScripts();
    setScripts(loadedScripts);
    if (loadedScripts.length > 0) {
      setActiveFileId(loadedScripts[0].id);
      setEditorContent(loadedScripts[0].content);
    }

    const loadedCommands = await localStorageService.getAllCommands();
    setCommands(loadedCommands);
  };

  const handleSelectFile = (file: ScriptFile) => {
    // save draft if needed or switch
    setActiveFileId(file.id);
    setEditorContent(file.content);
  };

  const handleSaveFile = async () => {
    const file = scripts.find((s) => s.id === activeFileId);
    if (!file) return;

    const updated: ScriptFile = {
      ...file,
      content: editorContent,
    };

    await localStorageService.saveScript(updated);
    setScripts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSavedSuccess(true);
    botEngine.addLog('info', `File [${updated.name}] disimpan ke IndexedDB HP & di-reload.`, 'SOURCE');
    setTimeout(() => setSavedSuccess(false), 2000);
    onRefreshStorage();
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newFile: ScriptFile = {
      id: 'file-' + Date.now(),
      name: newFileName.trim().endsWith('.js') ? newFileName.trim() : newFileName.trim() + '.js',
      description: 'Custom module script',
      content: `// ${newFileName}\nexport default function moduleHandler(sock, m) {\n  // Code bot kamu disini\n}\n`,
    };

    await localStorageService.saveScript(newFile);
    setScripts((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setEditorContent(newFile.content);
    setNewFileName('');
    setShowNewFileModal(false);
    onRefreshStorage();
  };

  const handleDeleteFile = async (id: string) => {
    if (scripts.length <= 1) {
      alert('Minimal harus ada 1 file script bot.');
      return;
    }
    await localStorageService.deleteScript(id);
    const updated = scripts.filter((s) => s.id !== id);
    setScripts(updated);
    if (activeFileId === id && updated.length > 0) {
      setActiveFileId(updated[0].id);
      setEditorContent(updated[0].content);
    }
    onRefreshStorage();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const newFile: ScriptFile = {
          id: 'uploaded-' + Date.now(),
          name: file.name,
          description: 'Uploaded from user device',
          content,
        };
        await localStorageService.saveScript(newFile);
        setScripts((prev) => [...prev, newFile]);
        setActiveFileId(newFile.id);
        setEditorContent(newFile.content);
        botEngine.addLog('success', `Source code [${file.name}] berhasil diunggah ke memori HP.`, 'UPLOAD');
        onRefreshStorage();
      }
    };
    reader.readAsText(file);
  };

  // --- Quick Command Rules Builder ---
  const handleAddCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.trim() || !newResponse.trim()) return;

    const cleanTrigger = newTrigger.trim().replace(/^!/, '').toLowerCase();
    const newCmd: CustomCommandRule = {
      id: 'cmd-' + Date.now(),
      trigger: cleanTrigger,
      response: newResponse.trim(),
      enabled: true,
      type: 'text',
      usageCount: 0,
    };

    await localStorageService.saveCommand(newCmd);
    setCommands((prev) => [...prev, newCmd]);
    setNewTrigger('');
    setNewResponse('');
    await botEngine.reloadCommands();
    botEngine.addLog('info', `Perintah baru [!${cleanTrigger}] ditambahkan ke memori lokal.`, 'RULES');
    onRefreshStorage();
  };

  const handleToggleCommand = async (cmd: CustomCommandRule) => {
    const updated = { ...cmd, enabled: !cmd.enabled };
    await localStorageService.saveCommand(updated);
    setCommands((prev) => prev.map((c) => (c.id === cmd.id ? updated : c)));
    await botEngine.reloadCommands();
  };

  const handleDeleteCommand = async (id: string) => {
    await localStorageService.deleteCommand(id);
    setCommands((prev) => prev.filter((c) => c.id !== id));
    await botEngine.reloadCommands();
    onRefreshStorage();
  };

  const activeFile = scripts.find((s) => s.id === activeFileId);

  const handleSyncGepaaaa = async () => {
    const defaults = localStorageService.getDefaultScripts();
    for (const def of defaults) {
      await localStorageService.saveScript(def);
    }
    const fresh = await localStorageService.getAllScripts();
    setScripts(fresh);
    if (fresh.length > 0) {
      setActiveFileId(fresh[0].id);
      setEditorContent(fresh[0].content);
    }
    botEngine.addLog('success', 'Source code disinkronkan dari github.com/Gepaaaa/bot ke memori HP!', 'GITHUB');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onRefreshStorage();
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs: Code Editor vs Quick Commands */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex rounded-xl bg-zinc-900/80 p-1 border border-zinc-800">
          <button
            onClick={() => setSubTab('editor')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              subTab === 'editor'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Editor Source Code Bot</span>
          </button>
          <button
            onClick={() => setSubTab('rules')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              subTab === 'rules'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Perintah Cepat ({commands.length})</span>
          </button>
        </div>

        {subTab === 'editor' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSyncGepaaaa}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-600/50 active:scale-95 transition-all"
              title="Sinkronkan kode dari github.com/Gepaaaa/bot"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sync Repo Gepaaaa/bot</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 text-xs font-medium border border-zinc-700 cursor-pointer active:scale-95 transition-all">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload File .js</span>
              <input type="file" accept=".js,.json,.txt" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleSaveFile}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Tersimpan di HP!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan & Reload</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: CODE EDITOR */}
      {subTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* File sidebar */}
          <div className="lg:col-span-3 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">File Source Code</span>
              <button
                onClick={() => setShowNewFileModal(true)}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs border border-zinc-700"
                title="Tambah file baru"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {scripts.map((file) => {
                const isSelected = file.id === activeFileId;
                return (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-950/40 hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileCode2 className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                      <span className="truncate">{file.name}</span>
                    </div>

                    {!file.isEntry && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                        title="Hapus file"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
              💡 File disimpan di <strong className="text-zinc-200">IndexedDB memori HP lokal</strong>. Kamu bisa mengedit atau menempel source code bot Baileys milikmu di sini secara langsung!
            </div>
          </div>

          {/* Code Textarea Editor */}
          <div className="lg:col-span-9 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-zinc-200 font-semibold">{activeFile?.name || 'editor.js'}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">{activeFile?.description}</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-400">JavaScript (ESM)</span>
            </div>

            <div className="relative font-mono text-xs">
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                rows={18}
                spellCheck={false}
                className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed resize-y selection:bg-emerald-900 selection:text-white"
                placeholder="// Tempel source code bot kamu disini..."
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: QUICK COMMAND RULES BUILDER */}
      {subTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add rule form */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Tambah Perintah Cepat</h3>
                <p className="text-xs text-zinc-400">Buat respon otomatis tanpa perlu mengetik kode rumit</p>
              </div>
            </div>

            <form onSubmit={handleAddCommand} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Trigger Perintah (Tanpa spasi)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-400 font-mono text-xs">
                    !
                  </span>
                  <input
                    type="text"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    placeholder="contoh: donasi / rules / sewa"
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Respon Balasan Bot
                </label>
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Ketik teks balasan bot yang akan dikirimkan ke pengguna..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all"
              >
                + Simpan Perintah ke Memori HP
              </button>
            </form>
          </div>

          {/* List of rules */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Daftar Perintah Aktif di Memori ({commands.length})
            </h3>

            <div className="space-y-2.5">
              {commands.map((cmd) => (
                <div
                  key={cmd.id}
                  className={`p-4 rounded-xl border transition-all ${
                    cmd.enabled
                      ? 'bg-zinc-900/90 border-zinc-800'
                      : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        !{cmd.trigger}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                        Digunakan {cmd.usageCount}x
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCommand(cmd)}
                        className="text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        {cmd.enabled ? (
                          <ToggleRight className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-zinc-600" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteCommand(cmd.id)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-zinc-300 font-sans whitespace-pre-line bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                    {cmd.response}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal for new file */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h4 className="text-sm font-semibold text-white">Buat File Script Baru</h4>
            <form onSubmit={handleCreateFile} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nama File (.js)</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="contoh: plugins.js"
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewFileModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Simpan File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
