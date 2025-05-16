import ms from "parse-ms";

let handler = async (m, { conn, setReply }) => {
  let premium = Object.values(db.data.users);
  let premiumCount = 0;
  let data = db.data.users;

  let txt = `╭─❑「 *📋 LIST PREMIUM* 」❑──\n│ 👑 *Total Premium:* ${premium.length}\n│ \n`;

  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      let user = data[key];
      if (user.premiumTime && !isNaN(user.premiumTime)) {
        premiumCount++;

        // Cek jika premiumTime bernilai Infinity
        let isUnlimited = user.premiumTime === Infinity;

        txt += `├👤 *Name :* ${user.name || "Tidak Diketahui"}\n`;
        txt += `├📱 *Number :* wa.me/${user.id || "Tidak Diketahui"}\n`;
        
        // Jika premiumTime Infinity, tampilkan "Unlimited" saja
        if (isUnlimited) {
          txt += `├⏳ *Remaining Time :* Unlimited\n`;
        } else {
          let cekvip = ms(user.premiumTime - Date.now());
          let cekbulan = Math.max(0, Math.floor(cekvip.days / 30));
          let cekhari = Math.max(0, cekvip.days % 30);
          txt += `├⏳ *Remaining Time :* ${cekbulan} Bulan ${cekhari} Hari ${cekvip.hours} Jam ${cekvip.minutes} Menit\n`;
        }

        txt += `╰❖––––––––––––––––––❖\n\n`;
      }
    }
  }

  txt += `© Sanz X Herta`;
  setReply(txt);
};

handler.help = ["premlist"];
handler.tags = ["info"];
handler.command = /^(listprem|premlist)$/i;
handler.owner = true;

export default handler;
