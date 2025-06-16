import schedule from 'node-schedule'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) throw '❗ Hanya untuk dalam grup!';
  const target = m.mentionedJid?.[0] || args[0];
  const duration = args[1];
  if (!target || !duration) throw `📌 Contoh penggunaan:
${usedPrefix + command} @user 10m

🕒 Format waktu yang didukung:
1s = 1 detik
1m = 1 menit
1h = 1 jam
1d = 1 hari
`;

  let executeTime;
  if (/^\d+[smhd]$/.test(duration)) {
    const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    executeTime = new Date(Date.now() + parseInt(duration) * unit[duration.slice(-1)]);
  } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(duration)) {
    executeTime = new Date(duration);
  } else throw '❌ Format waktu salah!';

  m.reply(`🕒 @${target.split('@')[0]} akan dikeluarkan dari grup pada: *${executeTime.toLocaleString()}*`, null, { mentions: [target] });

  schedule.scheduleJob(executeTime, async () => {
    await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
    conn.sendMessage(m.chat, { text: `👢 Waktu habis! @${target.split('@')[0]} telah dikeluarkan dari grup.`, mentions: [target] });
  });
};

handler.help = ['trialkick @user <durasi>'];
handler.tags = ['group'];
handler.command = /^trialkick$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;