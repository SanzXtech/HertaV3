// Define the class details
const classes = [
    {
        name: "KECEPATAN",
        latihan: "kecepatan",
        biaya: 12500,
        durasi: 10,
        reward: { type: 'speed', value: 10 } // Reward structure with type and value
    },
    {
        name: "KETANGGUHAN",
        latihan: "ketangguhan",
        biaya: 7500,
        durasi: 15,
        reward: { type: 'defense', value: 15 }
    },
    {
        name: "KEKUATAN",
        latihan: "kekuatan",
        biaya: 10000,
        durasi: 20,
        reward: { type: 'strength', value: 20 }
    }
];

// Command handler
export async function handler(m, { command, text }) {
    const user = global.db.data.users[m.sender];

    if (command === 'academy') {
        let message = `*「 Academy RPG 」*\n\nBerikut adalah daftar kelas yang tersedia:\n\n`;
        
        classes.forEach(cls => {
            message += `📘 Nama Kelas: ${cls.name}\n👤 Latihan: ${cls.latihan}\n💰 Biaya: ${cls.biaya}\n⏳ Durasi: ${cls.durasi} menit\n🏅 Reward: +${cls.reward.value} ${cls.reward.type}\n\n`;
        });

        message += `Untuk mengikuti kelas, gunakan perintah:\n📘 .joinclass <nama_kelas>\nContoh: .joinclass kecepatan`;

        let skyid = {
            text: message.trim(),
            contextInfo: {
                externalAdReply: {
                    title: `ᴀᴄᴀᴅᴇᴍʏ ʀᴘɢ`,
                    body: "",
                    thumbnailUrl: `https://pomf2.lain.la/f/ns0lcrwx.jpg`,
                    sourceUrl: `https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u`,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        };

        await conn.sendMessage(m.chat, skyid, { quoted: m });
    }

    if (command === 'joinclass') {
        const className = text.trim().toLowerCase();
        const cls = classes.find(c => c.latihan === className);

        if (!cls) {
            return await m.reply(`Kelas tidak ditemukan. Silakan pilih kelas yang tersedia dengan mengetik .academy`);
        }

        // Cooldown check
        const now = Date.now();
        if (user.lastJoinedClass && (now - user.lastJoinedClass < user.classCooldown)) {
            const remainingTime = Math.ceil((user.classCooldown - (now - user.lastJoinedClass)) / 60000);
            return await m.reply(`Kamu masih didalam kelas. Tunggu ${remainingTime} menit lagi sebelum bergabung kelas baru.`);
        }

        if (user.money < cls.biaya) {
            return await m.reply(`Uangmu tidak cukup untuk mengikuti kelas ini. Biaya: ${cls.biaya}`);
        }

        // Deduct cost and start cooldown
        user.money -= cls.biaya;
        user.lastJoinedClass = now;
        user.classCooldown = cls.durasi * 60000; // Set cooldown to class duration in milliseconds

        await m.reply(`Kamu telah bergabung di kelas ${cls.name}. Latihan akan selesai dalam ${cls.durasi} menit.`);

        setTimeout(async () => {
            // Add reward to user's stats based on reward type
            if (cls.reward.type === 'speed') user.speed = (user.speed || 0) + cls.reward.value;
            if (cls.reward.type === 'defense') user.defense = (user.defense || 0) + cls.reward.value;
            if (cls.reward.type === 'strength') user.strength = (user.strength || 0) + cls.reward.value;

            await m.reply(`Latihan ${cls.name} selesai! Kamu mendapatkan +${cls.reward.value} ${cls.reward.type}.`);
        }, cls.durasi * 60000);
    }
}

// Define command settings
handler.help = ['academy', 'joinclass <nama_kelas>'];
handler.tags = ['rpg'];
handler.command = ['academy', 'joinclass'];
handler.rpg = true;
handler.register = true;
handler.group = true;

export default handler;
