export class TermuxBridge {
  static generateTermuxScript(sessionJson: string = '', userCode: string = ''): string {
    return `#!/data/data/com.termux/files/usr/bin/bash
# =======================================================
# WA BOT 24/7 LOCAL PHONE DAEMON (TERMUX RUNNER)
# Membebankan semua memori ke penyimpanan HP lokal
# Menjaga bot tetap ON 24/7 tanpa server eksternal / VPS
# =======================================================

echo "🚀 [1/5] Mengaktifkan Termux Wake-Lock (Anti-Sleep HP)..."
termux-wake-lock

echo "📦 [2/5] Menginstal paket yang diperlukan (NodeJS & Git)..."
pkg update -y && pkg install -y nodejs-lts git

echo "⚙️ [3/5] Menginstal PM2 (Process Manager agar bot tidak off-off an)..."
npm install -g pm2

mkdir -p ~/wabot-pribadi
cd ~/wabot-pribadi

# Simpan package.json lokal
cat << 'EOF' > package.json
{
  "name": "wabot-lokal-hp",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.8",
    "pino": "^9.0.0",
    "qrcode-terminal": "^0.12.0"
  }
}
EOF

echo "📥 [4/5] Mengunduh dependensi Baileys lokal..."
npm install --silent

# Buat folder auth_info_baileys di penyimpanan HP lokal
mkdir -p auth_info_baileys

${sessionJson ? `# Menyimpan session dari panel
cat << 'EOF' > auth_info_baileys/creds.json
${sessionJson}
EOF
` : ''}

# Simpan source code bot
cat << 'EOF' > index.js
${userCode || `const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
  
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['HP Lokal 24/7', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('⚠️ Koneksi terputus. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Bot WA Berhasil Terhubung 24/7 di Memori HP Lokal!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    const body = m.message.conversation || m.message.extendedTextMessage?.text || '';
    
    if (body === '!ping') {
      await sock.sendMessage(m.key.remoteJid, { text: '⚡ Pong! Bot aktif 24/7 di memori HP lokal tanpa VPS.' });
    } else if (body === '!menu') {
      await sock.sendMessage(m.key.remoteJid, { text: '🤖 Halo! Bot WA berjalan via Termux lokal di memori HP kamu.' });
    }
  });
}

startBot();`}
EOF

echo "🔥 [5/5] Menjalankan Bot dengan PM2 Anti-Mati..."
pm2 start index.js --name "wabot-lokal" --watch
pm2 save

echo ""
echo "=========================================================="
echo "🎉 SELESAI! Bot WhatsApp kamu sekarang aktif 24/7 di HP!"
echo "📌 Untuk melihat log langsung: pm2 logs wabot-lokal"
echo "📌 Untuk restart bot        : pm2 restart wabot-lokal"
echo "📌 Untuk stop bot           : pm2 stop wabot-lokal"
echo "=========================================================="
`;
  }
}
