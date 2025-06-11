import fs from "fs-extra";
import WSF from 'wa-sticker-formatter';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const q = m.quoted && m.quoted.text ? m.quoted.text : args.join(" ");
    if (!q) return m.reply(`Gunakan format: ${usedPrefix}${command} <teks> atau balas pesan dengan perintah ini.`);

    const user = global.db.data.users[m.sender];
    const isPremium = user?.premium;
    const media = `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(q)}`;

    if (!conn.bratQueue) conn.bratQueue = [];
    if (!conn.bratProcessing) conn.bratProcessing = false;

    // === PREMIUM USER ===
    if (isPremium) {
        try {
            // Emoji ⏳ saat mulai
            await conn.sendMessage(m.chat, {
                react: {
                    text: '⏳',
                    key: m.key
                }
            });

            await conn.toSticker(m.chat, media, m);

            // Emoji ✅ saat selesai
            await conn.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            });
        } catch (e) {
            console.error(e);
            await m.reply('Terjadi kesalahan >_<');
        }
        return;
    }

    // === NON-PREMIUM USER ===

    const alreadyInQueue = conn.bratQueue.find(entry => entry.sender === m.sender);
    if (alreadyInQueue) {
        const position = conn.bratQueue.findIndex(entry => entry.sender === m.sender) + 1;
        return m.reply(`(>///<) Kamu sudah ada di antrian ke *${position}*, Senpai~\nTunggu sampai giliranmu diproses ya~`);
    }

    if (conn.bratQueue.length >= 10) {
        return m.reply(`(╥﹏╥) Antrian penuh, Senpai~\nMaksimal hanya *10 pengguna* dalam antrian.\nSilakan coba lagi nanti!`);
    }

    conn.bratQueue.push({ m, media, sender: m.sender });
    const position = conn.bratQueue.length;
    await m.reply(`(>///<) Kamu masuk antrian ke *${position}*, Senpai~\nUpgrade ke *Premium* biar langsung diproses tanpa antri~ ketik *.buypremium* 💎`);

    if (!conn.bratProcessing) {
        conn.bratProcessing = true;
        await processQueue(conn);
    }
};

// Fungsi proses antrian
async function processQueue(conn) {
    while (conn.bratQueue.length > 0) {
        const { m, media, sender } = conn.bratQueue[0];

        try {
            // Emoji ⏳ saat mulai
            await conn.sendMessage(m.chat, {
                react: {
                    text: '⏳',
                    key: m.key
                }
            });

            await new Promise(resolve => setTimeout(resolve, 3000)); // jeda 3 detik

            await conn.toSticker(m.chat, media, m);

            // Emoji ✅ saat selesai
            await conn.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            });
        } catch (e) {
            console.error(`Error proses brat untuk ${sender}`, e);
            await m.reply('Terjadi kesalahan saat memproses brat kamu >_<');
        }

        conn.bratQueue.shift(); // Keluarkan dari antrian
    }

    conn.bratProcessing = false;
}

handler.command = ['brat'];
handler.help = ['brat'];
handler.tags = ['sticker'];

export default handler;
