import fs from "fs";

let handler = async (m, { conn }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    if (!(who in global.db.data.users)) return m.reply(`User ${who} tidak ada dalam database`);

    let user = global.db.data.users[who];
    const caption = `
▧「 *BANK CEK* 」
│ 👤 Nama: ${user.registered ? user.name : conn.getName(m.sender)}
│ 💳 Atm: ${user.atm > 0 ? 'Level ' + user.atm : '❌'}
│ 🏦 Bank: ${user.bank.toLocaleString('id-ID')} / ${user.fullatm.toLocaleString('id-ID')}
│ 💰 Uang: ${user.money.toLocaleString('id-ID')}
│ ♋ Chip: ${user.chip.toLocaleString('id-ID')}
│ 🤖 Robo: ${user.robo > 9 ? 'MAX' : user.robo > 0 ? 'Level ' + user.robo : '❌'}
│ 🪙 BTC: ${user.btc.toFixed(8)}
│ 📑 Terdaftar: ${user.registered ? 'Yes ✅' : 'No ❌'}
└────···
`.trim();

    await conn.adReply(m.chat, caption, '', '', fs.readFileSync('./media/bank.jpg'), '', m);
};

handler.help = ['bank'];
handler.tags = ['rpg'];
handler.command = /^bank$/i;

handler.register = true;
handler.group = true;
handler.rpg = true;

export default handler;
