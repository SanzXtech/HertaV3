import fs from "fs";

let handler = async (m, { conn }) => {
    let sender = m.sender;
    let who = m.mentionedJid && m.mentionedJid[0]
        ? m.mentionedJid[0]
        : m.fromMe
        ? conn.user.jid
        : sender;

    if (!(who in global.db.data.users)) {
        return m.reply(`User ${who} tidak ada dalam database`);
    }

    let user = global.db.data.users[who];
    let name = user?.name || await conn.getName(who);
    let nomor = who.split('@')[0];

    const caption = `
▧「 *BANK CEK* 」
│ 👤 Nama: ${user.registered ? user.name : name}
│ 💳 Atm: ${user.atm > 0 ? 'Level ' + user.atm : '❌'}
│ 🏦 Bank: ${user.bank.toLocaleString('id-ID')} / ${user.fullatm.toLocaleString('id-ID')}
│ 💰 Uang: ${user.money.toLocaleString('id-ID')}
│ ♋ Chip: ${user.chip.toLocaleString('id-ID')}
│ 🤖 Robo: ${user.robo > 9 ? 'MAX' : user.robo > 0 ? 'Level ' + user.robo : '❌'}
│ 🪙 BTC: ${user.btc.toFixed(8)}
│ 📑 Terdaftar: ${user.registered ? 'Yes ✅' : 'No ❌'}
└────···
`.trim();

    await conn.sendMessage(m.chat, {
        image: fs.readFileSync('./media/bank.jpg'), // Gambar tetap dari folder
        caption,
    }, {
        quoted: fkontak(name, nomor) // fkontak pakai nama & nomor user
    });
};

handler.help = ['bank'];
handler.tags = ['rpg'];
handler.command = /^bank$/i;

handler.register = true;
handler.group = true;
handler.rpg = true;

export default handler;

// Fungsi kontak broadcast dari user
function fkontak(name, nomor) {
    const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
TEL;type=CELL;type=VOICE;waid=${nomor}:${nomor}
END:VCARD`.trim();

    return {
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast' // Supaya tampil seperti pesan sistem
        },
        message: {
            contactMessage: {
                displayName: name,
                vcard
            }
        }
    };
}