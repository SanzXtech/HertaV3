import axios from 'axios';

let handler = async (m, {
    conn,
    text,
    args,
    command,
    usedPrefix
}) => {
    let input = `[!] *wrong input*
	
Ex : ${usedPrefix + command} https://vt.tiktok.com/ZSYgBPSLD/`

    if (!text) return m.reply(input)

    if (!(text.includes('http://') || text.includes('https://'))) return m.reply(`url invalid, please input a valid url. Try with add http:// or https://`)
    if (!text.includes('tiktok.com')) return m.reply(`Invalid Tiktok URL.`)
try {
const { play, music, title, images, isVideo } = await ttdl(text);
if (isVideo == false) {
await m.reply('Terdeteksi url tiktok slide\nFoto dikirim ke chat pribadi')
for (let img of images) {
await conn.sendMessage(m.sender, { image: { url: img }, mimetype: 'image/jpeg' },{ quoted: m });
await sleep(1500)
}
} else if (isVideo == true) {
await m.reply('Terdeteksi url tiktok video')
let vd = `*${title}*`
await conn.sendMessage(m.chat, { video: { url: play }, mimetype: 'video/mp4', caption: vd }, { quoted: m });
await conn.sendMessage(m.chat, { audio: { url: music }, mimetype: 'audio/mpeg' }, { quoted: m });
 }
} catch (e) {
throw e
 }
}

handler.help = ['tiktok <url>']
handler.tags = ['downloader']
handler.command = /^(t(ik)?t(ok)?|t(ik)?t(ok)?dl)$/i

export default handler

async function ttdl(url) {
    try {
        if (!/^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com|m\.tiktok\.com)\/.+/i.test(url)) 
            throw new Error('Invalid url');
        
        const { data } = await axios.get('https://tiktok-scraper7.p.rapidapi.com', {
            headers: {
                'Accept-Encoding': 'gzip',
                'Connection': 'Keep-Alive',
                'Host': 'tiktok-scraper7.p.rapidapi.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com',
                'X-RapidAPI-Key': 'ca5c6d6fa3mshfcd2b0a0feac6b7p140e57jsn72684628152a'
            },
            params: {
                url: url,
                hd: '1'
            }
        });

        const tiktokData = data.data;
        const isVideo = !(Array.isArray(tiktokData.images) && tiktokData.images.length > 0);

        return { ...tiktokData, isVideo };
    } catch (error) {
        throw new Error(error.message);
    }
}