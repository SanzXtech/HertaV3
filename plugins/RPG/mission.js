import { promises, readFileSync } from 'fs'
let misi = JSON.parse(readFileSync('./lib/misi.json'))

const rankMultiplier = {
  "SSS": 3,
  "SS": 2.5,
  "S": 2,
  "A": 1.75,
  "B": 1.5,
  "C": 1.25,
  "D": 1,
  "E": 0.75
};

async function handler(m, { conn, args, text , usedPrefix, command }) {
  conn.mission = conn.mission ? conn.mission : {}
  if(m.sender in conn.mission) return m.reply("Kamu Masih Melakukan Misi, Tunggu Sampai Selesai!!")

  try {
    let json = misi[Math.floor(Math.random() * misi.length)] //get misi
    const cooldown = 15 * (1000 * 60) //cooldown timer in milliseconds
    let user = global.db.data.users[m.sender] //Get db user
    
    if (user.stamina < 100) return m.reply(`⚡ Stamina Kamu Kurang Dari 100, Tidak Bisa Menjalankan Misi\nKetik *.heal stamina* Untuk Menggunakan Potion`)
    if (user.armor < 1 || user.sword < 1) return m.reply("Kamu belum memiliki 🥼 armor dan ⚔️ sword ketik *.craft* untuk membuat armor dan sword.")

    if(typeof user.lastmission != "number") global.db.data.users[m.sender].lastmission = 0
    if(typeof user.exp != "number") global.db.data.users[m.sender].exp = 0
    if(typeof user.diamond != "number") global.db.data.users[m.sender].diamond = 0

    let timers = (cooldown - (new Date - user.lastmission))
    if(new Date - user.lastmission <= cooldown) return m.reply(`Kamu Sudah Menjalankan Misi, Tunggu Selama ${clockString(timers)}`)
    if(user.skill == "") return m.reply("Kamu Belum Mempunyai Skill")

    let multiplier = rankMultiplier[json.rank] || 1;

    if(!(m.sender in conn.mission)) {
      conn.mission[m.sender] = {
        sender: m.sender,
        timeout: setTimeout(() => {m.reply('timed out');delete conn.mission[m.sender]}, 60000),
        json
      }
      let caption = `*📝 Misi Telah Di Berikan*
📊 *Rank:* ${json.rank}
✉️ *Misi:* ${json.misii}
📦 *Reward:* 
🧪 Exp: ${json.exp}
💎 Diamond: ${json.diamond}

Kamu akan kehilangan:
❤️ Health: ${json.health}
⚡ Stamina: ${json.stamina}

Ketik *terima* Untuk Menerima
Ketik *tolak* Untuk Membatalkan
`
      return conn.reply(m.chat, caption, m) 
    }
  } catch (e) {
    console.error(e)
    if(m.sender in conn.mission) {
      let { timeout } = conn.mission[m.sender]
      clearTimeout(timeout)
      delete conn.mission[m.sender]
      m.reply('Rejected')
    }
  }
}

handler.before = async m => {
  conn.mission = conn.mission ? conn.mission : {}
  if(!(m.sender in conn.mission)) return
  if(m.isBaileys) return

  let { timeout, json } = conn.mission[m.sender]
  const cooldown = 5 * (1000 * 60) //cooldown timer in milliseconds
  let user = global.db.data.users[m.sender] //Get db user

  if (user.armor < 1 || user.sword < 1) return m.reply("Kamu belum memiliki 🥼 armor dan ⚔️ sword ketik *.craft untuk membuat armor dan sword.")

  let txt = (m.msg && m.msg.selectedDisplayText ? m.msg.selectedDisplayText : m.text ? m.text : '').toLowerCase()
  if(txt != "terima" && txt != "tolak" && txt != "gas") return

  if(typeof user.lastmission != "number") global.db.data.users[m.sender].lastmission = 0
  if(typeof user.exp != "number") global.db.data.users[m.sender].exp = 0
  if(typeof user.diamond != "number") global.db.data.users[m.sender].diamond = 0

  let timers = (cooldown - (new Date - user.lastmission))
  if(new Date - user.lastmission <= cooldown) return m.reply(`Kamu Sudah Melakukan Misi, Mohon Tunggu ${clockString(timers)}`)
  if(!user.skill) return m.reply("Kamu Belum Mempunyai Skill")

  let multiplier = rankMultiplier[json.rank] || 1;

  let randomaku = Math.floor(Math.random() * (101 * multiplier)).toString().trim();
  let randomkamu = Math.floor(Math.random() * (24 * multiplier)).toString().trim(); 

  let Aku = randomaku * 1;
  let Kamu = randomkamu * 1;
  let aud = ["Mana Habis", "Stamina Habis", "Diserang Monster", "Dibokong Monster"];
  let aui = aud[Math.floor(Math.random() * aud.length)];

  try {
    if(/^terima?$/i.test(txt)) {
      if(Aku > Kamu) {
        var cpt = `\nBerhasil Menyelesaikan Misi ${json.misii}`;
        if (json.title && !user.title.includes(json.title)) {
          m.reply(`\nKamu Mendapatkan Title ${json.title}`);
          user.title += `\n${json.title}`;
        }
        m.reply(cpt);
        user.exp += json.exp;
        user.diamond += json.diamond;

        user.armordurability -= 10 * multiplier;
        user.sworddurability -= 10 * multiplier;

      } else if(Aku < Kamu) {
        var flr = `\nGagal Menyelesaikan Misi ${json.misii} Dikarenakan ${aui}`;
        m.reply(flr);

        user.armordurability -= 20 * multiplier;
        user.sworddurability -= 20 * multiplier;
      }

      // Pengecekan armor durability
      if (user.armordurability <= 0) {
        user.armor -= 1;
        if (user.armor > 0) {
          user.armordurability = user.armor * 50; // Menghitung durability berdasarkan jumlah armor
        } else {
          user.armordurability = 0;
          m.reply(`🥼Armor kamu hancur! Kamu harus membuat yang baru.`);
        }
      }

      // Pengecekan sword durability
      if (user.sworddurability <= 0) {
        user.sword -= 1;
        user.sworddurability = user.sword * 50; // Menghitung durability berdasarkan jumlah armor
        m.reply(`⚔️Pedang kamu hancur! Kamu harus membuat yang baru.`);
      }

      user.health -= json.health * multiplier;
      user.stamina -= json.stamina * multiplier;

      if (user.health <= 0) {
        user.health = 0;
        m.reply("❤️ Health kamu habis! Gunakan potion untuk memulihkan, ketik *.heal health* untuk memulihkan Health kamu.");
      }
      if (user.stamina <= 0) {
        user.stamina = 0;
        m.reply("⚡ Stamina kamu habis! Gunakan potion untuk memulihkan, ketik *.heal stamina* untuk memulihkan Stamina kamu.");
      }

      user.lastmission = new Date * 1;
      clearTimeout(timeout);
      delete conn.mission[m.sender];
      return !0
    } else if (/^tolak?$/i.test(txt)) {
      clearTimeout(timeout)
      delete conn.mission[m.sender]
      m.reply('Canceled')
      return !0
    }
  } catch (e) {
    clearTimeout(timeout)
    delete conn.mission[m.sender]
    m.reply('Error Saat Pengambilan Misi (Rejected)')
    console.log(e.stack)
    return !0
  } finally {
    clearTimeout(timeout)
    delete conn.mission[m.sender]
    return !0
  }
}

handler.help = ['mission']
handler.tags = ['rpg']
handler.command = /^(m(isi)?(ission)?)$/i

export default handler
