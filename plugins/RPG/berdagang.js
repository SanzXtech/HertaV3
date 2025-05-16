// let pajak = 0.02
let handler = async (m, { conn, text }) => {
  let dapat = Math.floor(Math.random() * 5000);
  let who;
  if (m.isGroup) who = m.mentionedJid[0];
  else who = m.chat;
  if (!who) throw "⚠️ Tag salah satu orang yang ingin kamu ajak berdagang!";
  if (typeof db.data.users[who] == "undefined")
    return m.reply("❌ Pengguna tidak ada dalam database.");
  let __timers = new Date() - global.db.data.users[m.sender].lastdagang;
  let _timers = 28800000 - __timers;
  let timers = clockString(_timers);
  let users = global.db.data.users;
  let username = conn.getName(who);
  
  if (new Date() - global.db.data.users[m.sender].lastdagang > 28800000) {
    if (4999 > users[who].money)
      throw "💸 Target tidak memiliki cukup modal. Harap masukkan modal minimal 5000.";
    if (4999 > users[m.sender].money)
      throw "💸 Kamu tidak memiliki cukup modal. Harap masukkan modal minimal 5000.";
    
    users[who].money -= dapat * 1;
    users[m.sender].money -= dapat * 1;
    global.db.data.users[m.sender].lastdagang = new Date() * 1;
    
    m.reply(
      `📦 Bersiaplah!\nKamu dan @${who.replace(
        /@.+/,
        ""
      )} sedang berdagang... 💼\nModal kalian: -${dapat} 💰`,
      null,
      { contextInfo: { mentionedJid: [m.sender, who] } }
    );
    
    const waktuDagang = [3600000, 7200000, 10800000, 14400000, 18000000, 21600000, 25200000, 28800000];
    const rewards = [50000, 50000, 50000, 50000, 50000, 50000, 10000, 100000];
    
    for (let i = 0; i < waktuDagang.length; i++) {
      setTimeout(() => {
        conn.reply(
          m.chat,
          `🎉 Selamat!\nKamu dan @${who.replace(/@.+/, "")} mendapatkan hasil dagang!\n💵 Kamu: +${rewards[i]}\nSaldo kamu: ${users[m.sender].money += rewards[i]}\n💵 @${who.replace(/@.+/, "")}: +${rewards[i]}\nSaldo @${who.replace(/@.+/, "")}: ${users[who].money += rewards[i]}`,
          null,
          { contextInfo: { mentionedJid: [m.sender, who] } }
        );
      }, waktuDagang[i]);
    }
  } else m.reply(`⏳ Kamu sudah berdagang. Tunggu ${timers} lagi!`);
};

handler.help = ["berdagang *@tag*"];
handler.tags = ["rpg"];
handler.command = /^berdagang$/;
handler.register = true;
handler.group = true;
handler.rpg = true;
export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}
