import fetch from 'node-fetch'
import toMs from "ms"
import moment from "moment-timezone"

let handler = async (m, { conn, usedPrefix, command }) => {
    let options = [
        { text: "15k / Bulan", value: "15000", duration: "30d" },
        { text: "30k / 2 Bulan", value: "30000", duration: "60d" }
    ]

    let buttons = options.map(o => ({
        buttonId: `.paypremium ${o.value} ${o.duration}`,
        buttonText: { displayText: o.text },
        type: 1
    }))

    let buttonMessage = {
        text: "Pilih paket premium:",
        footer: "Setelah memilih, Anda akan diberikan QRIS pembayaran.",
        buttons: buttons,
        headerType: 1
    }

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

handler.command = /^(buypremium)$/i
export default handler