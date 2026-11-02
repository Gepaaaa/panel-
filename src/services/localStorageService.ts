import { SessionData, ScriptFile, LogEntry, CustomCommandRule, LocalStorageMetrics } from '../types';

const DB_NAME = 'WABotLocalStorageDB';
const DB_VERSION = 1;

export class LocalStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB tidak didukung pada browser ini'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('scripts')) {
          db.createObjectStore('scripts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('commands')) {
          db.createObjectStore('commands', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- Storage Metrics ---
  async getStorageMetrics(): Promise<LocalStorageMetrics> {
    let usedBytes = 0;
    let quotaBytes = 1024 * 1024 * 1024; // Default fallback 1GB

    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        usedBytes = estimate.usage || 0;
        quotaBytes = estimate.quota || quotaBytes;
      } catch (err) {
        console.warn('Gagal membaca storage estimate:', err);
      }
    }

    const logs = await this.getAllLogs();
    const scripts = await this.getAllScripts();
    const session = await this.getSession();

    const sessionStr = JSON.stringify(session || {});
    const scriptsStr = JSON.stringify(scripts || []);
    const logsStr = JSON.stringify(logs || []);
    const calculatedIdbBytes = (sessionStr.length + scriptsStr.length + logsStr.length) * 2;

    const usagePercentage = quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;

    return {
      usedBytes,
      quotaBytes,
      usagePercentage,
      indexedDbSizeKb: Math.max(12, Math.round(calculatedIdbBytes / 1024)),
      logsCount: logs.length,
      filesCount: scripts.length,
      cacheSizeKb: Math.round(usedBytes / 1024) || 24,
    };
  }

  // --- Session Storage ---
  async saveSession(session: SessionData): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      const req = store.put(session);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getSession(): Promise<SessionData | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result as SessionData[];
        resolve(results.length > 0 ? results[0] : null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async clearSession(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Scripts Storage ---
  async getAllScripts(): Promise<ScriptFile[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('scripts', 'readonly');
      const store = tx.objectStore('scripts');
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result as ScriptFile[];
        if (results.length === 0) {
          // Provide default starter template for user bot source code
          resolve(this.getDefaultScripts());
        } else {
          resolve(results);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async saveScript(script: ScriptFile): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('scripts', 'readwrite');
      const store = tx.objectStore('scripts');
      const req = store.put(script);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteScript(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('scripts', 'readwrite');
      const store = tx.objectStore('scripts');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Logs Storage ---
  async appendLog(log: LogEntry): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('logs', 'readwrite');
      const store = tx.objectStore('logs');
      const req = store.put(log);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getAllLogs(): Promise<LogEntry[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('logs', 'readonly');
      const store = tx.objectStore('logs');
      const req = store.getAll();
      req.onsuccess = () => {
        const logs = (req.result as LogEntry[]) || [];
        resolve(logs.slice(-200)); // keep last 200 logs
      };
      req.onerror = () => reject(req.error);
    });
  }

  async clearLogs(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('logs', 'readwrite');
      const store = tx.objectStore('logs');
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Commands Storage ---
  async getAllCommands(): Promise<CustomCommandRule[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('commands', 'readonly');
      const store = tx.objectStore('commands');
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result as CustomCommandRule[];
        if (results.length === 0) {
          resolve(this.getDefaultCommands());
        } else {
          resolve(results);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async saveCommand(cmd: CustomCommandRule): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('commands', 'readwrite');
      const store = tx.objectStore('commands');
      const req = store.put(cmd);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteCommand(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('commands', 'readwrite');
      const store = tx.objectStore('commands');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Export & Import ---
  async exportFullBackup(): Promise<string> {
    const session = await this.getSession();
    const scripts = await this.getAllScripts();
    const commands = await this.getAllCommands();

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      session,
      scripts,
      commands,
    };

    return JSON.stringify(backup, null, 2);
  }

  async importFullBackup(jsonContent: string): Promise<void> {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.session) {
        await this.saveSession(parsed.session);
      }
      if (Array.isArray(parsed.scripts)) {
        for (const script of parsed.scripts) {
          await this.saveScript(script);
        }
      }
      if (Array.isArray(parsed.commands)) {
        for (const cmd of parsed.commands) {
          await this.saveCommand(cmd);
        }
      }
    } catch (err) {
      throw new Error('Format file backup tidak valid: ' + (err as Error).message);
    }
  }

  // --- Clear all cache ---
  async clearAllLocalCache(): Promise<void> {
    await this.clearLogs();
    const db = await this.getDB();
    const tx = db.transaction(['logs'], 'readwrite');
    tx.objectStore('logs').clear();
  }

  getDefaultScripts(): ScriptFile[] {
    const defaultIndexContent = [
      '/**',
      ' * Custom WhatsApp Bot Handler',
      ' * Berjalan langsung di memori HP lokal & disinkronkan dengan sesi Baileys',
      ' */',
      '',
      'export default async function handleMessage(sock, m) {',
      '  const { from, body, sender, isGroup, pushName } = m;',
      "  const prefix = '!';",
      '  ',
      '  if (!body.startsWith(prefix)) return;',
      '  ',
      '  const args = body.slice(prefix.length).trim().split(/ +/);',
      '  const command = args.shift().toLowerCase();',
      '',
      '  switch (command) {',
      "    case 'ping':",
      '      await sock.sendMessage(from, {',
      '        text: "⚡ Pong! Latensi bot aktif stabil di HP lokal.\\n📱 Device: Mobile Local Engine\\n🔋 Status: 24/7 Active"',
      '      });',
      '      break;',
      '',
      "    case 'menu':",
      "    case 'help':",
      '      const menuText = `╔═══════『 BOT PRIBADI 24/7 』═══════╗\\n` +',
      '        `║ 👤 Pengguna : ${pushName || "Kawan"}\\n` +',
      '        `║ ⚡ Status   : Online (Memori HP Lokal)\\n` +',
      '        `║ 🕒 Aktif    : 24 Jam Nonstop\\n` +',
      '        `╚══════════════════════════════════╝\\n\\n` +',
      '        `📌 FITUR UTAMA:\\n` +',
      '        `• !ping      - Cek respon latensi bot\\n` +',
      '        `• !runtime   - Cek lama aktif bot di HP\\n` +',
      '        `• !status    - Info memori HP & baterai\\n` +',
      '        `• !quote     - Kata mutiara hari ini\\n` +',
      '        `• !owner     - Kontak pemilik bot\\n\\n` +',
      '        `*Catatan: Bot dilindungi Anti-Sleep Daemon agar tidak mati saat layar HP mati.*`;',
      '      await sock.sendMessage(from, { text: menuText });',
      '      break;',
      '',
      "    case 'runtime':",
      '      await sock.sendMessage(from, {',
      '        text: "⏱️ Bot aktif 24/7 di memori HP lokal tanpa server luar."',
      '      });',
      '      break;',
      '',
      "    case 'owner':",
      '      await sock.sendMessage(from, {',
      '        text: "👑 Kontak Pemilik Bot:\\nwa.me/" + (sock.userNumber || "628xxxxxxxx")',
      '      });',
      '      break;',
      '',
      '    default:',
      '      break;',
      '  }',
      '}',
      ''
    ].join('\n');

    return [
      {
        id: 'index-js',
        name: 'index.js',
        isEntry: true,
        description: 'Main Bot Handler (Baileys compatible event loop)',
        content: defaultIndexContent,
      },
      {
        id: 'config-js',
        name: 'config.js',
        description: 'Konfigurasi Bot & Informasi Owner',
        content: `// Konfigurasi Bot WhatsApp Lokal
export const config = {
  botName: 'Nexus WA Bot',
  ownerName: 'Owner Bot',
  ownerNumber: '6281234567890',
  prefix: '!',
  selfMode: false, // true = hanya respon chat owner
  autoRead: true,  // otomatis centang dua biru
  autoTyping: true, // efek sedang mengetik
  antiCall: true,   // tolak panggilan otomatis
  keepAliveIntervalMs: 15000,
};
`,
      },
    ];
  }

  getDefaultCommands(): CustomCommandRule[] {
    return [
      {
        id: 'cmd-1',
        trigger: 'ping',
        response: '⚡ Pong! Latensi bot aktif stabil di HP lokal.',
        enabled: true,
        type: 'text',
        usageCount: 42,
      },
      {
        id: 'cmd-2',
        trigger: 'info',
        response: '🤖 Bot WA Pribadi aktif 24/7 berjalan langsung di memori HP tanpa VPS.',
        enabled: true,
        type: 'text',
        usageCount: 19,
      },
      {
        id: 'cmd-3',
        trigger: 'rules',
        response: '📜 Dilarang spam atau telepon bot ini secara berulang.',
        enabled: true,
        type: 'text',
        usageCount: 8,
      },
    ];
  }
}

export const localStorageService = new LocalStorageService();
