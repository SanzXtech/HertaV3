const COOLDOWN = 60 * 60 * 1000; // Cooldown 60 menit
const MINE_TIME = 5 * 60 * 1000; // Delay waktu mining 5 menit
const TOOL_BONUSES = {
  pickaxe: 0.00039581,  // Sesuaikan bonus untuk alat pickaxe
  drill: 0.00206932,    // Sesuaikan bonus untuk alat drill
  robot: 0.00850492     // Sesuaikan bonus untuk alat robot
};
const PRICES = {
  pickaxe: 1000000,  // Sesuaikan harga alat sesuai profit yang diinginkan
  drill: 5000000,   // Sesuaikan harga alat sesuai profit yang diinginkan
  robot: 10000000    // Sesuaikan harga alat sesuai profit yang diinginkan
};
const thumbnailUrl = 'https://pomf2.lain.la/f/kp2x0axf.jpg';

const sendMessageWithSkyid = async (message, m, conn) => {
  const skyid = {
    text: message.trim(),
    contextInfo: {
      externalAdReply: {
        title: `ᴍɪɴɪɴɢ ʙɪᴛᴄᴏɪɴ [ʀᴘɢ]`,
        thumbnailUrl: thumbnailUrl,
        sourceUrl: `https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u`,
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    },
  };
  await conn.sendMessage(m.chat, skyid, { quoted: m });
};

const calculateCooldown = (lastTime) => {
  const remainingTime = COOLDOWN - (Date.now() - lastTime);
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);
  return { minutes, seconds };
};

const calculateCoinEarned = (user) => {
  let coinEarned = 0;
  coinEarned += user.pickaxemine * TOOL_BONUSES.pickaxe;
  coinEarned += user.drillmine * TOOL_BONUSES.drill;
  coinEarned += user.robotmine * TOOL_BONUSES.robot;
  return coinEarned;
};

const handler = async (m, { command, conn }) => {
  const user = global.db.data.users[m.sender] || { btc: 0, money: 0, lastmine: 0, pickaxemine: 0, pickaxemines: 0, drillmine: 0, drillmines: 0, robotmine: 0, robotmines: 0 };
  const currentTime = Date.now();

  try {
    if (command === 'minecoin') {
      const type = m.text.split(' ')[1]?.toLowerCase() || '';

      switch (type) {
        case '':
          const tutorialMessage = `
💎 *Selamat datang di MiningCoin!* 💎
⛏️ *!minecoin start* - Mulai mining, tunggu 5 menit untuk hasil.
📊 *!minecoin stats* - Melihat Progres mining.
🔍 *!minecoin check* - Cek alat & BTC yang didapat per mining.
🛒 *!minecoin shop* - Lihat alat untuk meningkatkan hasil mining.
🛠️ *!minecoin buy [item]* - Beli alat untuk mining. Pilihan: *pickaxe*, *drill*, *robot*.
          `;
          await sendMessageWithSkyid(tutorialMessage, m, conn);
          break;

        case 'start':
          if (!user.pickaxemine && !user.drillmine && !user.robotmine) {
            return m.reply("❗ Kamu tidak memiliki alat. Silakan beli di *!minecoin shop*.");
          }

          if (currentTime - user.lastmine < COOLDOWN) {
            const { minutes, seconds } = calculateCooldown(user.lastmine);
            return m.reply(`⛔ Tunggu ${minutes} menit ${seconds} detik sebelum mining lagi.`);
          }

          user.lastmine = currentTime;
          await m.reply("⛏️ *Mining dimulai!*\n⌛ Kamu perlu menunggu 5 menit untuk melihat hasil Mining.");

          const coinEarned = calculateCoinEarned(user);

          setTimeout(async () => {
            user.btc += coinEarned;

            if (user.pickaxemines > 0) {
              user.pickaxemines -= 1;
              if (user.pickaxemines === 0) user.pickaxemine = 0;
            }
            if (user.drillmines > 0) {
              user.drillmines -= 1;
              if (user.drillmines === 0) user.drillmine = 0;
            }
            if (user.robotmines > 0) {
              user.robotmines -= 1;
              if (user.robotmines === 0) user.robotmine = 0;
            }

            global.db.data.users[m.sender] = user;
            await m.reply(`*🚀Mining selesai!*\nKamu mendapatkan ${coinEarned.toFixed(8)} BTC.\nTotal BTC: ${user.btc.toFixed(8)} 🪙.`);
          }, MINE_TIME);
          break;
          
          case 'stats':
  if (currentTime - user.lastmine > MINE_TIME) {
    return m.reply('⛔ Tidak ada proses mining aktif saat ini.');
  }

  const elapsed = currentTime - user.lastmine;
  const remaining = MINE_TIME - elapsed;

  const totalBars = 20; // Jumlah kotak di progress bar
  const percentage = Math.min((elapsed / MINE_TIME) * 100, 100); // Hitung persentase progres
  const barsFilled = Math.floor((percentage / 100) * totalBars); // Hitung kotak yang sudah terisi
  const bar = `[${'■'.repeat(barsFilled)}${'□'.repeat(totalBars - barsFilled)}]`; // Progress bar

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const message = `⛏️ *Mining sedang berlangsung...*\nProgres: ${bar} ${percentage.toFixed(0)}%\nWaktu tersisa: ${minutes} menit ${seconds} detik.`;

  m.reply(message);
  break;

        case 'check':
          const toolsList = [];

          // Menampilkan Pickaxe jika dimiliki
          if (user.pickaxemine > 0) {
            const pickaxeBonus = TOOL_BONUSES.pickaxe * user.pickaxemine;  // Menghitung total bonus pickaxe
            toolsList.push(`⛏️ Pickaxe *${user.pickaxemine === 10 ? 'MAX' : user.pickaxemine}* (${user.pickaxemines} uses)\n + ${pickaxeBonus.toFixed(7)} 🪙 / Mining`);
          }
          
          // Menampilkan Drill jika dimiliki
          if (user.drillmine > 0) {
            const drillBonus = TOOL_BONUSES.drill * user.drillmine;  // Menghitung total bonus drill
            toolsList.push(`🛠️ Drill *${user.drillmine === 10 ? 'MAX' : user.drillmine}* (${user.drillmines} uses)\n + ${drillBonus.toFixed(7)} 🪙 / Mining`);
          }
          
          // Menampilkan Robot jika dimiliki
          if (user.robotmine > 0) {
            const robotBonus = TOOL_BONUSES.robot * user.robotmine;  // Menghitung total bonus robot
            toolsList.push(`🤖 Robot *${user.robotmine === 10 ? 'MAX' : user.robotmine}* (${user.robotmines} uses)\n + ${robotBonus.toFixed(7)} 🪙 / Mining`);
          }

          const toolsText = toolsList.length ? toolsList.join('\n\n') : 'Tidak ada alat';
          const coinPerMine = calculateCoinEarned(user).toFixed(8);  // Menghitung total BTC per mining berdasarkan semua alat

          await sendMessageWithSkyid(`
🔧 *Alat yang kamu miliki:*
${toolsText}

*Total BTC Per Mining:* ${coinPerMine} 🪙
*🪙 BTC: ${user.btc.toFixed(8)}*
          `, m, conn);
          break;
        case 'shop':
          await sendMessageWithSkyid(`
🛒 *Shop Tools*
- *pickaxe* - ${PRICES.pickaxe.toLocaleString()} money (+${TOOL_BONUSES.pickaxe} 🪙/Mining)
- *drill* - ${PRICES.drill.toLocaleString()} money (+${TOOL_BONUSES.drill} 🪙/Mining)
- *robot* - ${PRICES.robot.toLocaleString()} money (+${TOOL_BONUSES.robot} 🪙/Mining)
Gunakan *!minecoin buy [item] [quantity]* untuk membeli. Contoh: *!minecoin buy pickaxe 5*
          `, m, conn);
          break;

        case 'buy':
          const item = m.text.split(' ')[2]?.toLowerCase();
          const quantity = parseInt(m.text.split(' ')[3]) || 1; // Menambahkan parsing kuantitas
          
          if (!PRICES[item]) {
            return m.reply("❌ Pilih item dari: pickaxe, drill, robot.\n*Example :* !minecoin buy pickaxe");
          }

          if (quantity < 1 || quantity > 10) {
            return m.reply("❌ Kamu hanya bisa membeli maksimal 10 alat.");
          }

          if (user[item + 'mine'] + quantity > 10) {
            return m.reply(`❌ Jumlah alat ${item} sudah maksimal. Kamu hanya bisa memiliki maksimal 10.`);
          }

          const totalPrice = PRICES[item] * quantity;
          
          if (user.money < totalPrice) {
            return m.reply(`❌ Uang tidak cukup untuk membeli ${quantity} ${item}. Total yang dibutuhkan: ${totalPrice} money.`);
          }

          user.money -= totalPrice;
          user[item + 'mine'] += quantity;
          user[item + 'mines'] = 3; // Setiap pembelian alat mendapatkan 3 uses

          global.db.data.users[m.sender] = user;
          await m.reply(`🎉 Kamu berhasil membeli *${quantity} ${item}!*`);
          break;
      }
    }
  } catch (error) {
    console.error(error);
  }
};

handler.help = ['minecoin start', 'minecoin check', 'minecoin leaderboard', 'minecoin buy [item]', 'minecoin shop'];
handler.tags = ['game', 'mining', 'btc', 'money'];
handler.command = /^(minecoin)$/i;
handler.rpg = true;
handler.register = true;
handler.group = true;

export default handler;