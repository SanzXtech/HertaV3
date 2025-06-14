import fs from 'fs-extra';
import axios from 'axios';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const q = m.quoted?.text || args.join(" ");
    if (!q) return m.reply(`Gunakan format: ${usedPrefix}${command} <teks>`);

    const user = global.db.data.users[m.sender];
    const isPremium = user?.premium;
    const mediaUrl = `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(q)}`;
    const fallbackUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(q)}`;

    if (!conn.bratQueue) conn.bratQueue = [];
    if (!conn.bratProcessing) conn.bratProcessing = false;

    const sendStickerWithFallback = async () => {
        try {
            await conn.toSticker(m.chat, mediaUrl, m); // API utama
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } catch (err) {
            console.log('[❌] Gagal API utama, mencoba fallback...');
            try {
                const { data } = await axios.get(fallbackUrl, { responseType: 'arraybuffer' });
                await conn.sendMessage(m.chat, {
                    sticker: data
                }, { quoted: m });
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } catch (e) {
                console.error('Fallback gagal:', e);
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                await m.reply('Gagal membuat brat dari kedua sumber, coba lagi nanti ya Senpai >_<');
            }
        }
    };

    if (isPremium) {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
        return await sendStickerWithFallback();
    }

    const alreadyInQueue = conn.bratQueue.find(entry => entry.sender === m.sender);
    if (alreadyInQueue) {
        const pos = conn.bratQueue.findIndex(entry => entry.sender === m.sender) + 1;
        return m.reply(`(>///<) Kamu sudah ada di antrian ke *${pos}*, Senpai~\nTunggu giliranmu ya~`);
    }

    if (conn.bratQueue.length >= 10) {
        return m.reply(`(╥﹏╥) Antrian penuh, Senpai~\nMaksimal hanya *10 pengguna*. Coba lagi nanti.`);
    }

    conn.bratQueue.push({ m, sender: m.sender });
    const pos = conn.bratQueue.length;
    await m.reply(`(>///<) Kamu masuk antrian ke *${pos}*, Senpai~\nUpgrade ke *Premium* biar langsung diproses tanpa antri~ ketik *.buypremium* 💎`);

    if (!conn.bratProcessing) {
        conn.bratProcessing = true;
        await processQueue(conn, sendStickerWithFallback);
    }
};

async function processQueue(conn, sendStickerWithFallback) {
    while (conn.bratQueue.length > 0) {
        const { m } = conn.bratQueue[0];
        try {
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            await new Promise(res => setTimeout(res, 3000));
            await sendStickerWithFallback(m);
        } catch (e) {
            console.error('❌ Gagal proses antrian:', e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await m.reply('Terjadi kesalahan saat memproses brat kamu >_<');
        }

        conn.bratQueue.shift();
    }

    conn.bratProcessing = false;
}

handler.command = ['brat'];
handler.help = ['brat <teks>'];
handler.tags = ['sticker'];

export default handler;
