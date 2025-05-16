import fs from "fs-extra";
import WSF from 'wa-sticker-formatter';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    // Ambil teks dari pesan yang di-quote atau dari argumen langsung
    const q = m.quoted && m.quoted.text ? m.quoted.text : args.join(" ");
    
    if (!q) return m.reply(`Gunakan format: ${usedPrefix}${command} <teks> atau balas pesan dengan perintah ini.`);

    let media = `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(q)}`;

    try {
        await conn.toSticker(m.chat, media, m);
    } catch (e) {
        console.error(e);
        await m.reply('Terjadi kesalahan T-T');
    }
};

handler.command = ['brat'];
handler.help = ['brat'];
handler.tags = ['sticker'];

export default handler;
