const adminNumber = '6281401689098@s.whatsapp.net'; // Nomor admin

const items = ["money", "chip", "diamond", "bank", "emerald", "gold"];
async function handler(m, { conn, usedPrefix, command, text }) {
  conn.bj = conn.bj ? conn.bj : {};
  if (m.sender in conn.bj)
    return m.reply("You are still in the game, wait until it finishes!!");

  try {
    let cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let playerCards = [];
    let computerCards = [];

    let calculateTotal = (cardArray) => {
      let total = 0;
      let hasAce = false;
      for (let card of cardArray) {
        if (card === "A") {
          total += 11;
          hasAce = true;
        } else if (card === "K" || card === "Q" || card === "J") {
          total += 10;
        } else {
          total += parseInt(card);
        }
      }
      if (hasAce && total > 21) {
        total -= 10;
      }
      return total;
    };

    let pickCard = () => {
      let index = Math.floor(Math.random() * cards.length);
      return cards[index];
    };

    if (!(m.sender in conn.bj)) {
      let [type, betText] = text.split(' ');
      type = type.toLowerCase();
      if (!items.includes(type))
        return m.reply(`*List Item:*\n💰money\n♋chip\n💎diamond\n🏦bank\n❇️emerald\n🪙gold\n\nExample:\n${usedPrefix + command} money 1000`);

      let bet = parseInt(betText);
      if (isNaN(bet) || bet <= 0) {
        return m.reply(`*• Example :* ${usedPrefix + command} money 1000`);
      }
      if (global.db.data.users[m.sender][type] < bet) {
        return m.reply(`Your ${type} is insufficient`);
      }

      playerCards.push(pickCard());
      computerCards.push(pickCard());

      let playerTotal = calculateTotal(playerCards);
      let computerTotal = calculateTotal(computerCards);

      async function sendResultMessage(result, playerTotal, computerTotal) {
        let message = `*• B L A C K J A C K - R E S U L T*\n\n` +
          `╭── •\n` +
          `│ ◦ *Your Cards:* ${playerCards.join(", ")}\n` +
          `│ ◦ *Your Total:* ${playerTotal}\n` +
          `├─ •\n` +
          `│ ◦ *ComputerCards*: ${computerCards.join(", ")}\n` +
          `│ ◦ *ComputerTotal:* ${computerTotal}\n` +
          `╰── •\n\n` +
          `${result}`;

        conn.reply(m.chat, message, m, {
          contextInfo: {
            externalAdReply: {
              title: "C A S I N O",
              body: "",
              thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
              sourceUrl: myUrl, // Pastikan myUrl valid
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        });
      }

      if (playerTotal === 21 && computerTotal !== 21) {
        await sendResultMessage(`*You got Blackjack! You win!*\n*+${bet} ${type}*`, playerTotal, computerTotal);
        global.db.data.users[m.sender][type] += bet;
        delete conn.bj[m.sender];
      } else if (playerTotal === 21 && computerTotal === 21) {
        await sendResultMessage("The result is a DRAW! Both got Blackjack!", playerTotal, computerTotal);
        delete conn.bj[m.sender];
      } else {
        conn.bj[m.sender] = {
          playerCards: playerCards,
          computerCards: computerCards,
          playerTotal: playerTotal,
          computerTotal: computerTotal,
          bet: bet,
          type: type,
          timeout: setTimeout(() => {
            m.reply("Time is up, bet has been deducted!");
            global.db.data.users[m.sender][type] -= bet;
            global.db.data.users[adminNumber][type] += bet; // Berikan ke admin
            delete conn.bj[m.sender];
          }, 1800000), // 30 detik timeout
        };

        let message = `*• B L A C K J A C K*\n\n` +
          `╭── •\n` +
          `│ ◦ *Your Cards:* ${playerCards.join(", ")}\n` +
          `│ ◦ *Your Total:* ${playerTotal}\n` +
          `├─ •\n` +
          `│ ◦ *ComputerCards:* ${computerCards[0]}, \n` +
          `│ ◦ *Bet:* ${bet} ${type}\n` +
          `╰── •\n\n` +
          `Type *hit* to take additional cards.\n` +
          `Type *stand* to end the turn.`;

        conn.reply(m.chat, message, m, {
          contextInfo: {
            externalAdReply: {
              title: "C A S I N O",
              body: "",
              thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
              sourceUrl: myUrl, // Pastikan myUrl valid
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        });
      }
    }
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, "An error occurred while running the Blackjack game.", m);
    if (m.sender in conn.bj) {
      let { timeout } = conn.bj[m.sender];
      clearTimeout(timeout);
      delete conn.bj[m.sender];
      return true;
    }
  }
}

handler.before = async (m) => {
  conn.bj = conn.bj ? conn.bj : {};
  if (!(m.sender in conn.bj)) return;
  if (m.isBaileys) return;

  let { timeout, type } = conn.bj[m.sender]; // Memastikan 'type' tersedia di 'before'
  let txt = (
    m.msg.selectedDisplayText ? m.msg.selectedDisplayText : m.text ? m.text : ""
  ).toLowerCase();
  if (txt !== "stand" && txt !== "hit") return;

  let cards = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
  ];

  let calculateTotal = (cardArray) => {
    let total = 0;
    let hasAce = false;

    for (let card of cardArray) {
      if (card === "A") {
        total += 11;
        hasAce = true;
      } else if (card === "K" || card === "Q" || card === "J") {
        total += 10;
      } else {
        total += parseInt(card);
      }
    }

    if (hasAce && total > 21) {
      total -= 10;
    }

    return total;
  };

  let pickCard = () => {
    let index = Math.floor(Math.random() * cards.length);
    return cards[index];
  };

  let bjData = conn.bj[m.sender];
  let playerCards = bjData.playerCards;
  let computerCards = bjData.computerCards;
  let playerTotal = calculateTotal(playerCards);
  let computerTotal = bjData.computerTotal;
  let bet = bjData.bet;

  async function sendResultMessage(result, playerTotal, computerTotal) {
    let message = `*• B L A C K J A C K - R E S U L T*

╭── •
│ ◦ *Your Cards:* ${playerCards.join(", ")}
│ ◦ *Your Total:* ${playerTotal}
├─ •
│ ◦ *ComputerCards*: ${computerCards.join(", ")}
│ ◦ *ComputerTotal:* ${computerTotal}
╰── •

${result}`;

    conn.reply(m.chat, message, m, {
      contextInfo: {
        externalAdReply: {
          title: "C A S I N O",
          body: "",
          thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
          sourceUrl: myUrl, // Pastikan myUrl valid
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    });
  };

  try {
    if (/^hit?$/i.test(txt)) {
      let newCard = pickCard();
      playerCards.push(newCard);
      playerTotal = calculateTotal(playerCards);

      if (playerTotal > 21) {
        await sendResultMessage(`*You lose! Total cards exceed 21.*\n*-${bet} ${type}*`, playerTotal, computerTotal);
        global.db.data.users[m.sender][type] -= bet;
        clearTimeout(conn.bj[m.sender].timeout);
        delete conn.bj[m.sender];
      } else if (playerTotal == 21) {
        await sendResultMessage(`*You win!*\n*+${bet} ${type}*`, playerTotal, computerTotal);
        global.db.data.users[m.sender][type] += bet;
        clearTimeout(timeout);
        delete conn.bj[m.sender];
      } else {
        let message = `*• B L A C K J A C K*\n\n` +
          `╭── •\n` +
          `│ ◦ *Your Cards:* ${playerCards.join(", ")}\n` +
          `│ ◦ *Your Total:* ${playerTotal}\n` +
          `├─ •\n` +
          `│ ◦ *ComputerCards:* ${computerCards[0]}\n` +
          `│ ◦ *Bet:* ${bet} ${type}\n` +
          `╰── •\n\n` +
          `Type *hit* to take additional cards.\n` +
          `Type *stand* to end your turn.`;

        conn.reply(m.chat, message, m, {
          contextInfo: {
            externalAdReply: {
              title: "C A S I N O",
              body: "",
              thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
              sourceUrl: myUrl, // Pastikan myUrl valid
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        });
      }
    } else if (/^stand?$/i.test(txt)) {
      while (computerTotal < 18) {
        let newCard = pickCard();
        computerCards.push(newCard);
        computerTotal = calculateTotal(computerCards);
      }

      if (computerTotal > 21) {
        await sendResultMessage(`*You win! Computer's card total exceeds 21.*\n*+${bet} ${type}*`, playerTotal, computerTotal);
        global.db.data.users[m.sender][type] += bet;
      } else if (playerTotal > computerTotal) {
        await sendResultMessage(`*You win!*\n*+${bet} ${type}*`, playerTotal, computerTotal);
        global.db.data.users[m.sender][type] += bet;
      } else if (playerTotal < computerTotal) {
        await sendResultMessage(`*You lose!*\n*-${bet} ${type}*`, playerTotal, computerTotal);
        global.db.data.users[m.sender][type] -= bet;
      } else {
        await sendResultMessage("The result is a DRAW!", playerTotal, computerTotal);
      }

      clearTimeout(timeout);
      delete conn.bj[m.sender];
    }
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, "An error occurred during the Blackjack game.", m);
    clearTimeout(timeout);
    delete conn.bj[m.sender];
    return true;
  }
};

handler.command = handler.help = ["blackjack", "bj"];
handler.tags = ["game"];
handler.register = true;
handler.limit = false;
handler.group = true;

export default handler;