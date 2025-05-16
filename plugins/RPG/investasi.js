// Penyimpanan akun pengguna dalam global.db
// Pendefinisian isInvesting
let isInvesting = {}; // Inisialisasi objek untuk melacak pengguna yang sedang berinvestasi

let handler = async (m, { text, command, usedPrefix, conn }) => {
    const userId = m.sender;
    const username = await conn.getName(userId); // Mengambil nama pengguna

    // Ambil data pengguna dari global.db
    let user = global.db.data.users[userId];

    // Jika pengguna tidak ada di database, buat pengguna baru
    if (!user) {
        user = {
            money: 0,
            cooldown: 0
        };
        global.db.data.users[userId] = user;
    }

    // Cek apakah pengguna sedang dalam proses investasi
    if (isInvesting[userId]) {
        m.reply(`🚫 Maaf, ${username}, Anda sedang dalam proses investasi. Tunggu hingga investasi sebelumnya selesai.`, null, { mentionedJid: [userId] });
        return;
    }

    // Cek cooldown
    if (user.cooldown && Date.now() - user.cooldown < 20 * 60 * 1000) {
        const remainingTime = Math.ceil((20 * 60 * 1000 - (Date.now() - user.cooldown)) / 1000 / 60);
        m.reply(`⏳ Maaf, ${username}, Anda harus menunggu ${remainingTime} menit sebelum dapat berinvestasi lagi.`, null, { mentionedJid: [userId] });
        return;
    }

    // Validasi input
    if (!text || (isNaN(text) && text.toLowerCase() !== 'all')) {
        m.reply(`⚠️ ${username}, silakan masukkan nominal yang valid untuk investasi. Gunakan format ${usedPrefix}${command} <nominal> atau ${usedPrefix}${command} all.`, null, { mentionedJid: [userId] });
        return;
    }

    // Tentukan nominal investasi
    let nominal;
    if (text.toLowerCase() === 'all') {
        nominal = user.money;
    } else {
        nominal = parseInt(text);
        if (nominal <= 0) {
            m.reply(`⚠️ ${username}, masukkan nominal yang valid.`, null, { mentionedJid: [userId] });
            return;
        }
    }

    // Cek ketersediaan dana
    if (nominal > user.money) {
        m.reply(`❌ Maaf, ${username}, Anda tidak memiliki cukup uang untuk investasi sebesar ${nominal.toLocaleString()}. Uang Anda saat ini: ${user.money.toLocaleString()}.`, null, { mentionedJid: [userId] });
        return;
    }

    // Mulai investasi
    isInvesting[userId] = true;
    user.money -= nominal;

    // Simpan perubahan ke database
    await global.db.write();

    m.reply(`💰 ${username}, investasi sebesar ${nominal.toLocaleString()} berhasil dimulai. Hasil investasi akan tersedia setelah 20 menit.`, null, { mentionedJid: [userId] });

    setTimeout(async () => {
        // Simulasikan hasil investasi
        let result;
        let changePercent;

        if (Math.random() < 0.39) { // Peluang rugi 39%
            result = 'rugi';
            changePercent = 100;
        } else {
            changePercent = Math.floor(Math.random() * 21 + 5); // Untung 5%-25%
            result = 'untung';
        }

        const profit = Math.floor(nominal * (changePercent / 100));
        const totalInvestment = nominal + (result === 'untung' ? profit : -nominal);

        if (result === 'untung') {
            user.money += nominal + profit;
            m.reply(`📈 ${username}, investasi selesai setelah 20 menit. Total investasi Anda: ${totalInvestment.toLocaleString()}. Anda mendapatkan keuntungan sebesar ${profit.toLocaleString()}.`, null, { mentionedJid: [userId] });
        } else {
            m.reply(`📉 ${username}, investasi selesai setelah 20 menit. Investasi Anda mengalami kerugian total. Uang Anda hilang.`, null, { mentionedJid: [userId] });
        }

        // Hapus tanda investasi
        isInvesting[userId] = false;

        // Set cooldown
        user.cooldown = Date.now();

        // Simpan perubahan ke database
        await global.db.write();

        // Informasi cooldown selesai
        setTimeout(() => {
            m.reply(`✅ ${username}, Anda sudah dapat melakukan investasi kembali. Gunakan ${usedPrefix}${command} <nominal> untuk memulai investasi baru.`, null, { mentionedJid: [userId] });
        }, 20 * 60 * 1000);
    }, 20 * 60 * 1000);
};

handler.help = ['investasi <nominal>'];
handler.tags = ['rpg'];
handler.command = /^investasi$/i;

handler.rpg = true;
handler.group = true;
handler.register = true;

export default handler;
