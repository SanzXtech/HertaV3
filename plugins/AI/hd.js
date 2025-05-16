import { unlinkSync } from "fs";
const { FileUgu } = await import(`../../lib/uploader.js?v=${Date.now()}`).catch(
  (err) => console.log(err)
);
import fetch from "node-fetch";

let handler = async (m, { conn, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (!/image/.test(mime)) return m.reply("Balas gambar yang ingin di-HD-kan!");

  await m.reply("Tunggu sebentar, sedang memproses...");

  let media = await q.download(true);
  let uploaded = await FileUgu(media);
  let imageUrl = uploaded.files[0].url;

  try {
    let res = await fetch(`https://jerofc.my.id/api/remini?url=${encodeURIComponent(imageUrl)}`);
    let json = await res.json();

    if (!json.status || !json.data?.image) throw "Gagal memproses gambar HD.";
    await conn.sendFile(m.chat, json.data.image, "hd.jpg", "Berikut hasil HD-nya!", m);
  } catch (e) {
    console.error(e);
    m.reply("Terjadi kesalahan saat memproses gambar.");
  } finally {
    unlinkSync(media);
  }
};

handler.help = ["hd"];
handler.tags = ["ai"];
handler.command = ["hd"];

export default handler;
