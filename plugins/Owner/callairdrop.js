import fs from "fs-extra";

let maxClaims = 10;

let handler = async (m, { conn, args, isAdmin, isOwner, setReply }) => {
    if (!isAdmin && !isOwner) return setReply("⚠️ Hanya admin yang bisa memanggil airdrop.");

    let groupId = args[0] || m.chat;
    if (!groupId.endsWith("@g.us")) return setReply("⚠️ Masukkan ID grup yang valid atau gunakan di dalam grup.");

    if (!conn.airdropClaims) conn.airdropClaims = {};
    if (conn.airdropClaims[groupId]) return setReply("⚠️ Airdrop sudah aktif di grup ini.");

    conn.airdropClaims[groupId] = { count: 0, expired: false, claimedUsers: new Set() };

    let message = `
🎁 *「 ᴀɪʀᴅʀᴏᴘ ᴛᴇʀᴊᴀᴛᴜʜ! 」* 🎁

📡 *Sebuah supply box misterius telah terdeteksi di grup ini!*  
💨 *Para pejuang bergegas untuk mengklaimnya!*  

📦 *Isi Airdrop:*  
💰 *Money:* 10000 - 100000  
🧪 *EXP:* 1000 - 5000 
🎁 *Mythic Box:* Kesempatan mendapatkan item langka!  

⚡ *Cara Klaim:*
➤ *Reply pesan ini dengan "claims" untuk mengklaim airdrop!*  
👥 *Batas klaim: ${maxClaims} orang tercepat!*  
    `.trim();

    let sentMsg = await conn.sendMessage(groupId, { text: message });
    
    conn.airdropClaims[groupId].messageId = sentMsg.key.id; // Simpan ID pesan airdrop

    setReply(`✅ Airdrop berhasil dikirim ke grup ${groupId}`);
};

// Handler untuk menangani klaim airdrop
let claimHandler = async (m, { conn, setReply }) => {
    let groupId = m.chat;
    if (!conn.airdropClaims || !conn.airdropClaims[groupId]) return;
    let airdrop = conn.airdropClaims[groupId];

    // Pastikan pengguna mereply pesan airdrop
    if (!m.quoted || m.quoted.id !== airdrop.messageId) return;

    if (airdrop.claimedUsers.has(m.sender)) return setReply("⚠️ Kamu sudah mengklaim airdrop!");
    if (airdrop.count >= maxClaims) return setReply("⚠️ Airdrop sudah habis diklaim!");

    airdrop.count++;
    airdrop.claimedUsers.add(m.sender);

    let money = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;
    let exp = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;

    // Tambahkan hadiah ke pengguna (sesuaikan dengan sistem ekonomi Anda)
    global.db.data.users[m.sender].money += money;
    global.db.data.users[m.sender].exp += exp;

    setReply(`🎉 Selamat! Kamu mendapatkan:\n💰 *${money} Money*\n🧪 *${exp} EXP*`);
    
    if (airdrop.count >= maxClaims) {
        delete conn.airdropClaims[groupId];
        conn.sendMessage(groupId, { text: "⚠️ Airdrop sudah habis diklaim!" });
    }
};

handler.help = ["callairdrop"];
handler.tags = ["rpg"];
handler.command = ["callairdrop"];
handler.group = true;
handler.admin = true;

let claimCommand = /^claims$/i;
claimHandler.command = claimCommand;
claimHandler.group = true;

export default { handler, claimHandler };