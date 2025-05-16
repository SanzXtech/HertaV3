import axios from "axios";
import cheerio from "cheerio";

let handler = async (m, { text, conn, usedPrefix, command }) => {
    if (!text) throw "Masukkan lirik atau judulnya";
    m.reply("⏳ Sedang mencari lirik...");

    try {
        const res = await genius.getSongLyrics(text);

        if (res.error) throw res.error;

        const output = `
*🎵 Title:* ${res.title}
*🎤 Artist:* ${res.artist}

*📜 Lyrics:*

${res.lyrics}
`.trim();

        await conn.reply(m.chat, output, m);
    } catch (e) {
        m.reply(`⚠️ Error: ${e.message}`);
    }
};

handler.help = handler.command = ["lirik", "lyric"];
handler.tags = ["tools"];

export default handler;

const GENIUS_API_URL = "https://api.genius.com";
const GENIUS_ACCESS_TOKEN = "L0BY-i4ZVi0wQ53vlvm2zucqjHTuLbHv--YgjxJoN0spnEIhb5swTr_mWlQ6Ye-F";

const headers = {
    Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}`,
    "User-Agent": "apitester.org Android/7.5(641)"
};

const logs = (message, code) => {
    const error = new Error(message);
    error.code = code;
    return error;
};

const genius = {
    async searchSong(query) {
        const url = new URL("/search", GENIUS_API_URL);
        url.searchParams.append("q", query);

        try {
            const response = await axios.get(url.toString(), { headers });
            return response.data.response.hits;
        } catch (error) {
            if (error.response) {
                throw logs(`❌ Error: ${error.response.status}`, error.response.status);
            }
            throw logs(`❌ Error: ${error.message}`, "NETWORK_ERROR");
        }
    },

    async getLyrics(songUrl) {
        try {
            const response = await axios.get(songUrl);
            const $ = cheerio.load(response.data);
            let lyrics = "";

            $('[class^="Lyrics__Container-"]').each((index, element) => {
                $(element).find("br").replaceWith("\n");
                lyrics += $(element)
                    .text()
                    .replace(/&nbsp;/g, " ")
                    .trim() + "\n";
            });

            // Format and clean up lyrics
            lyrics = lyrics
                .replace(/\n{3,}/g, "\n\n") // Reduce multiple blank lines
                .trim();

            return lyrics;
        } catch (error) {
            throw logs("❌ Error saat mengambil lirik", "LYRICS_ERROR");
        }
    },

    async getSongLyrics(query) {
        try {
            const searchResults = await this.searchSong(query);
            if (searchResults.length === 0) {
                throw "Lirik tidak ditemukan 🌝";
            }

            const song = searchResults[0].result;
            const lyrics = await this.getLyrics(song.url);

            return {
                title: song.title,
                artist: song.primary_artist.name,
                lyrics: lyrics,
                url: song.url,
                thumbnailUrl: song.song_art_image_thumbnail_url
            };
        } catch (error) {
            return { error: error.message };
        }
    }
};
