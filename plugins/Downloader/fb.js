import { miftah, nekohime } from "../../lib/restApi.js";
let handler = async (m, { command, q, conn, prefix, setReply }) => {
  if (!q || !q.startsWith("https"))
    return setReply(
      `Linknya?\nContoh: ${
        prefix + command
      } https://www.facebook.com/share/v/15dFnjbPs2/`
    );
  setReply(mess.wait);

  const { alldl } = require("rahad-all-downloader");

  const videoUrl = q; // Insert a supported URL from YouTube, Facebook, TikTok, Instagram, Twitter, threads, Google Drive, or Capcut.

  async function downloadVideo(url) {
    try {
      const result = await alldl(url);
      return result;
    } catch (error) {
      console.error("Error:", error.message);
      return null; // Return null if an error occurs
    }
  }

  let data = await downloadVideo(videoUrl);

  if (!data || !data.data || !data.data.videoUrl) {
    // Check if videourl is missing
    return setReply("Hanya support Video URL atau link tidak valid.");
  }

  conn.sendMessage(
    m.chat,
    { video: { url: data.data.videoUrl } },
    { quoted: m }
  );
};

handler.help = ["instagram"];
handler.tags = ["downloader"];
handler.command = ["fb"];

export default handler;
