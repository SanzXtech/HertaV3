import canvafy from "canvafy";

let handler = (m) => m;

handler.before = async function (m, { conn }) {
  if (!global.db.data.chats) global.db.data.chats = {};
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { autoLevelUp: true };

  const chat = global.db.data.chats[m.chat];
  if (!chat.autoLevelUp) return; // Stop if auto-level-up is disabled

  const user = global.db.data.users[m.sender];
  if (!user) return;

  const userLevel = user.level || 0;
  let userExp = user.exp || 0;

  // Hitung EXP yang dibutuhkan
  let requiredExp = userLevel === 0 ? 500 : 1000 * userLevel;
  let totalBonus = 0;
  let newLevel = userLevel;

  // Cek level up
  let hasLeveledUp = false;
  while (userExp >= requiredExp) {
    userExp -= requiredExp;
    newLevel++;
    totalBonus += 1000 * newLevel;
    requiredExp = 1000 * newLevel;
    hasLeveledUp = true;
  }

  // Jika tidak ada kenaikan level, hentikan proses
  if (!hasLeveledUp) return;

  // Update data pengguna
  user.exp = userExp;
  user.level = newLevel;
  user.money = (user.money || 0) + totalBonus;

  const { userLeveling } = await import("../../lib/user.js");
  user.grade = userLeveling(`${newLevel}`);

  // Generate gambar level up dengan Canvafy
  const nama = user.name || m.pushname || "Pengguna";
  const pp = await conn.profilePictureUrl(m.sender, "image").catch(() => null);

  let image;
  try {
    const backgroundPath = "./media/background.jpg";
    const avatarPath = "./media/levelup.jpg";

    image = await new canvafy.LevelUp()
      .setAvatar(pp || "./media/levelup.jpg")
      .setBackground("image", backgroundPath)
      .setUsername(nama)
      .setBorder("#000000")
      .setAvatarBorder("#6200ee")
      .setOverlayOpacity(0.7)
      .setLevels(userLevel, newLevel)
      .build();
  } catch (err) {
    console.error("Error creating Canvafy image:", err);
    return;
  }

  // Kirim gambar + teks dalam satu pesan
  const levelsGained = newLevel - userLevel;
  const caption = `🎉 *[ LEVEL UP BERHASIL ]* 🎉\n
✨ *Nama:* ${nama}
🎖️ *Pangkat:* ${user.grade}
⬆️ *Level Baru:* ${userLevel} ➠ ${newLevel}
💰 *Total Bonus:* Rp ${totalBonus.toLocaleString()}`;

  await conn.sendMessage(m.chat, { image, caption }, { quoted: m });
};

export default handler;
