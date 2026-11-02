export class TermuxBridge {
  static generateTermuxScript(sessionJson: string = '', userCode: string = ''): string {
    return `#!/data/data/com.termux/files/usr/bin/bash
# =======================================================
# WA BOT 24/7 AUTO-INSTALLER (1-KALI JALAN LANGSUNG BERES)
# Tanpa error module missing, auto install Baileys + PM2
# =======================================================
set -e

echo "🚀 [1/5] Mengaktifkan Anti-Sleep HP..."
termux-wake-lock || true

echo "📦 [2/5] Menginstal NodeJS & Git di Termux..."
pkg update -y
pkg install -y nodejs-lts git

echo "⚙️ [3/5] Menginstal PM2 Process Manager..."
npm install -g pm2 || npm install -g pm2 --unsafe-perm

echo "📂 [4/5] Menyiapkan folder bot & mengunduh dependensi Baileys..."
mkdir -p ~/wabot
cd ~/wabot

# Inisialisasi package.json
cat << 'EOF' > package.json
{
  "name": "wabot-lokal",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.8",
    "pino": "^9.0.0",
    "qrcode-terminal": "^0.12.0"
  }
}
EOF

# Instal modul sampai benar-benar ada
npm install --no-audit --no-fund

mkdir -p auth_info

${sessionJson ? `# Menyimpan session dari panel
cat << 'EOF' > auth_info/creds.json
${sessionJson}
EOF
` : ''}

# Tulis script bot utama
cat << 'EOF' > index.js
${userCode || `const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

  console.log('🤖 Menginisialisasi koneksi Baileys...');

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04']
  });

  // Jika belum tertaut, minta kode pairing otomatis
  if (!sock.authState.creds.registered) {
    console.log('\\n======================================================');
    console.log('📱 PERANGKAT BELUM TERTAUT KE WHATSAPP');
    console.log('======================================================');
    
    // Gunakan nomor owner resmi atau minta input
    let phone = '6289673533963';
    try {
      console.log('Tekan ENTER untuk nomor default (' + phone + ') atau ketik nomor lain:');
      const input = await question('Nomor WA (contoh: 628xxx): ');
      if (input && input.trim()) {
        phone = input.replace(/[^0-9]/g, '');
      }
    } catch (e) {}

    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phone);
        console.log('\\n🔥 ==============================================');
        console.log('🔑 KODE PAIRING WHATSAPP KAMU:  ' + code);
        console.log('==============================================');
        console.log('1. Buka WA di HP > Titik Tiga / Pengaturan');
        console.log('2. Perangkat Tertaut > Tautkan Perangkat');
        console.log('3. Tautkan dengan nomor telepon saja');
        console.log('4. Masukkan kode di atas!\\n');
      } catch (err) {
        console.error('Gagal minta kode pairing:', err.message);
      }
    }, 3000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log('⚠️ Koneksi tertutup (' + statusCode + '). Reconnecting: ' + shouldReconnect);
      if (shouldReconnect) {
        setTimeout(startBot, 3000);
      } else {
        console.log('❌ Sesi telah keluar. Hapus folder auth_info dan jalankan ulang.');
      }
    } else if (connection === 'open') {
      console.log('\\n🎉 ==============================================');
      console.log('✅ BOT WHATSAPP BERHASIL ON 24/7 DI HP KAMU!');
      console.log('==============================================\\n');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    const body = (m.message.conversation || m.message.extendedTextMessage?.text || '').trim();
    const from = m.key.remoteJid;

    if (body === '.ping' || body === '!ping') {
      await sock.sendMessage(from, { text: '⚡ Pong! Bot aktif 24/7 di memori HP lokal tanpa VPS.' });
    } else if (body === '.menu' || body === '!menu') {
      await sock.sendMessage(from, { 
        text: '*WABot Multi-Feature (24/7 HP Lokal)*\\n\\n' +
              '• .ping - Cek respon bot\\n' +
              '• .runtime - Cek durasi aktif bot\\n' +
              '• .owner - Kontak pemilik bot\\n' +
              '• .s - Buat stiker\\n' +
              '• .tt - Download TikTok HD'
      });
    } else if (body === '.owner' || body === '!owner') {
      await sock.sendMessage(from, { text: '👑 Owner Bot: wa.me/6289673533963 (+62 896-7353-3963)' });
    }
  });
}

startBot();
`}
EOF

echo "🔥 [5/5] Menjalankan Bot dengan PM2 Anti-Sleep..."
pm2 delete wabot 2>/dev/null || true
pm2 start index.js --name "wabot"
pm2 save

echo ""
echo "=========================================================="
echo "🎉 SELESAI 100%! Bot WhatsApp sekarang berjalan dengan PM2"
echo "📌 Menampilkan log langsung sekarang (Tekan CTRL + C untuk keluar log):"
echo "=========================================================="
sleep 1
pm2 logs wabot
`;
  }
}
