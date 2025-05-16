import fetch from 'node-fetch';
import fs from 'fs';
import { randomUUID } from 'crypto';

let handler = async (m, { conn, args, command }) => {
    if (command === 'bratvideo') {
        if (!args[0]) return m.reply('harap masukkan teks! Contoh: .bratvideo hai semuanya');

        let text = args.join(' ');
        let apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isVideo=true&delay=700`;

        try {
            let response = await fetch(apiUrl);
            if (!response.ok) return m.reply('❌ Gagal mengambil video dari API.');

            let buffer = await response.buffer();
            let randomId = randomUUID(); // Generate a random ID
            let filePath = `./${randomId}.mp4`; // Save video with random ID
            fs.writeFileSync(filePath, buffer);

            await conn.sendMessage(m.chat, {
                video: fs.readFileSync(filePath),
                caption: `🎥 *Brat Video*\n\nTeks: ${text}\n\nKlik tombol di bawah untuk mengubah video ini menjadi stiker.`,
                buttons: [
                    { buttonId: `!stickerbrats ${randomId}`, buttonText: { displayText: '🖼️ Jadikan Sticker' }, type: 1 }
                ],
                headerType: 4
            }, { quoted: m });
        } catch (err) {
            console.error(err);
            m.reply('❌ Terjadi kesalahan saat memproses permintaan.');
        }
    } else if (command === 'stickerbrats') {
        const randomId = args[0]; // Get the random ID from the command
        if (!randomId) return m.reply('❌ ID video tidak ditemukan!');

        let filePath = `./${randomId}.mp4`;
        if (!fs.existsSync(filePath)) return m.reply('❌ Video tidak ditemukan atau sudah dihapus.');

        try {
            const buffer = fs.readFileSync(filePath);
            await conn.toSticker(m.chat, buffer, m); // Convert video to sticker
            fs.unlinkSync(filePath); // Clean up the video file after conversion
        } catch (err) {
            console.error(err);
            m.reply('❌ Gagal mengubah video menjadi stiker.');
        }
    }
};

handler.help = ['bratvideo <teks>', 'sticker <id>'];
handler.tags = ['fun'];
handler.command = /^(bratvideo|stickerbrats)$/i;

export default handler;
