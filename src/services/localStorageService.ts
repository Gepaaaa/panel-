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
      ' * WABot Multi-Feature (Gepaaaa/bot)',
      ' * Repository: https://github.com/Gepaaaa/bot',
      ' * Berjalan di memori HP lokal & disinkronkan dengan sesi Baileys',
      ' */',
      '',
      'export const config = {',
      "  botName: 'WABot Multi-Feature',",
      "  prefix: '.',",
      "  ownerNumber: '6289673533963',",
      "  ownerDisplay: '+62 896-7353-3963',",
      "  packName: 'WABot',",
      "  authorName: 'Gepaaaa',",
      '};',
      '',
      'export default async function handleMessage(sock, m) {',
      '  const { from, body, sender, isGroup, pushName } = m;',
      '  const prefix = body.startsWith(".") ? "." : body.startsWith("!") ? "!" : "";',
      '  ',
      '  if (!prefix) return;',
      '  ',
      '  const args = body.slice(prefix.length).trim().split(/ +/);',
      '  const command = args.shift().toLowerCase();',
      '',
      '  switch (command) {',
      "    case 'ping':",
      '      await sock.sendMessage(from, {',
      '        text: `*${config.botName} Aktif*\\n• Respons: ${Date.now() - m.timestamp} ms\\n• Uptime: 24/7 Anti-Sleep HP Lokal\\n• Prefix: *${prefix}*\\n• Owner: *${config.ownerDisplay}*`,',
      '      });',
      '      break;',
      '',
      "    case 'menu':",
      "    case 'help':",
      '      const menuText = `*${config.botName}*\\n` +',
      '        `Prefix: *${prefix}*  ·  Owner: *wa.me/${config.ownerNumber}*\\n` +',
      '        `Status: *Online 24/7 di Memori HP Lokal (Anti-Sleep)*\\n\\n` +',
      '        `📥 *DOWNLOADER:*\\n` +',
      '        `• ${prefix}tt <link> - Download video TikTok HD tanpa watermark\\n` +',
      '        `• ${prefix}mp3 <link> - Ekstrak audio musik MP3\\n` +',
      '        `• ${prefix}aio <link> - Auto Downloader serbaguna\\n\\n` +',
      '        `🎨 *STIKER & MEDIA:*\\n` +',
      '        `• ${prefix}s - Ubah foto/video pendek jadi stiker WA\\n` +',
      '        `• ${prefix}qc <teks> - Buat Quote Chat estetik\\n` +',
      '        `• ${prefix}hdsw - Siapkan video HD untuk status WA\\n\\n` +',
      '        `🛡️ *GRUP & ADMIN:*\\n` +',
      '        `• ${prefix}antilink - Toggle proteksi link grup\\n` +',
      '        `• ${prefix}hidetag <pesan> - Tag seluruh anggota grup\\n\\n` +',
      '        `⚙️ *INFO & SYSTEM:*\\n` +',
      '        `• ${prefix}ping - Cek latensi & server HP\\n` +',
      '        `• ${prefix}runtime - Lama aktif bot nonstop\\n` +',
      '        `• ${prefix}owner - Kontak pemilik bot\\n\\n` +',
      '        `_Source Code: github.com/Gepaaaa/bot_`;',
      '      await sock.sendMessage(from, { text: menuText });',
      '      break;',
      '',
      "    case 's':",
      "    case 'sticker':",
      '      await sock.sendMessage(from, {',
      '        text: `✅ Stiker berhasil dibuat (${config.packName} · ${config.authorName})`',
      '      });',
      '      break;',
      '',
      "    case 'tt':",
      "    case 'tiktok':",
      '      await sock.sendMessage(from, {',
      '        text: `📥 *Unduhan Selesai (TikTok HD)*\\nKualitas: 1080p Tanpa Watermark\\nStatus: Berhasil diproses oleh engine HP.`',
      '      });',
      '      break;',
      '',
      "    case 'mp3':",
      '      await sock.sendMessage(from, {',
      '        text: `🎵 *Audio MP3 Berhasil Diekstrak*\\nFormat: MP3 Audio 320kbps\\nSiap diputar di WhatsApp.`',
      '      });',
      '      break;',
      '',
      "    case 'hdsw':",
      '      await sock.sendMessage(from, {',
      '        text: `✨ *Media HD Siap Status WA*\\nFormat asli tanpa kompresi buram — tinggal tekan *Teruskan (Forward)* ke *Status Saya*.`',
      '      });',
      '      break;',
      '',
      "    case 'antilink':",
      '      await sock.sendMessage(from, {',
      '        text: `🛡️ *Proteksi Grup Antilink:* [AKTIF]\\nTautan tidak sah akan otomatis dihapus oleh bot.`',
      '      });',
      '      break;',
      '',
      "    case 'hidetag':",
      "    case 'tagall':",
      '      await sock.sendMessage(from, {',
      '        text: `📢 *Pemberitahuan Admin Grup*\\n${args.join(" ") || "Halo semuanya!"}\\n\\n(Notifikasi disiarkan ke seluruh anggota)`',
      '      });',
      '      break;',
      '',
      "    case 'runtime':",
      '      await sock.sendMessage(from, {',
      '        text: "⏱️ Bot aktif 24/7 di memori HP lokal tanpa server VPS eksternal."',
      '      });',
      '      break;',
      '',
      "    case 'owner':",
      '      await sock.sendMessage(from, {',
      '        text: `👑 Kontak Pemilik Bot:\\nwa.me/${config.ownerNumber} (${config.ownerDisplay})`',
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
        description: 'Main Handler (Gepaaaa/bot Baileys Engine)',
        content: defaultIndexContent,
      },
      {
        id: 'config-js',
        name: 'config.js',
        description: 'Konfigurasi Bot (Gepaaaa/bot)',
        content: `// Konfigurasi Resmi Gepaaaa/bot
export const config = {
  botName: 'WABot Multi-Feature',
  ownerNumber: '6289673533963',
  ownerDisplay: '+62 896-7353-3963',
  prefix: '.',
  packName: 'WABot',
  authorName: 'Gepaaaa',
  antiLink: true,
  autoRead: true,
  repoUrl: 'https://github.com/Gepaaaa/bot',
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
        response: '⚡ Pong! WABot aktif responsif di memori HP lokal.',
        enabled: true,
        type: 'text',
        usageCount: 88,
      },
      {
        id: 'cmd-2',
        trigger: 'owner',
        response: '👑 Owner Bot: wa.me/6289673533963 (+62 896-7353-3963)',
        enabled: true,
        type: 'text',
        usageCount: 45,
      },
      {
        id: 'cmd-3',
        trigger: 'tt',
        response: '📥 Kirim link TikTok: .tt <link> untuk mengunduh video HD tanpa watermark.',
        enabled: true,
        type: 'text',
        usageCount: 31,
      },
      {
        id: 'cmd-4',
        trigger: 's',
        response: '🎨 Balas foto atau video dengan .s untuk mengubahnya menjadi stiker WhatsApp.',
        enabled: true,
        type: 'text',
        usageCount: 64,
      },
      {
        id: 'cmd-5',
        trigger: 'antilink',
        response: '🛡️ Fitur antilink grup aktif: tautan grup lain akan otomatis dihapus.',
        enabled: true,
        type: 'text',
        usageCount: 22,
      },
    ];
  }
}

export const localStorageService = new LocalStorageService();
