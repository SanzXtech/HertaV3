import { readFileSync } from 'fs';

// Function untuk membuat thumbnail
function thumbnail(url) {
    return url || 'https://files.catbox.moe/kiycz0.jpg';
}

// Function untuk membuat fake contact
function fkontak(conn, m) {
    return {
        key: {
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            fromMe: false,
            id: 'Halo'
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: '0@s.whatsapp.net'
    };
}

// Fungsi untuk mengupdate harga saham secara periodik
function updateStockPrices() {
    const settings = global.db.data.settings["settingbot"];

    setInterval(() => {
        // Update harga dengan fluktuasi random ±5%
        const fluctuation = () => (Math.random() * 0.1) - 0.05; // -5% to +5%

        if (settings.bbcaPrice) {
            settings.bbcaPrice = Math.max(1000, Math.round(settings.bbcaPrice * (1 + fluctuation())));
        }
        if (settings.bbriPrice) {
            settings.bbriPrice = Math.max(1000, Math.round(settings.bbriPrice * (1 + fluctuation())));
        }
        if (settings.bbniPrice) {
            settings.bbniPrice = Math.max(1000, Math.round(settings.bbniPrice * (1 + fluctuation())));
        }
        if (settings.brisPrice) {
            settings.brisPrice = Math.max(1000, Math.round(settings.brisPrice * (1 + fluctuation())));
        }
    }, 15 * 60 * 1000); // Update setiap 15 menit
}

// Mulai update harga otomatis
updateStockPrices();

async function handler(m, { conn, command, args, usedPrefix }) {
    const user = global.db.data.users[m.sender];
    const settings = global.db.data.settings["settingbot"];


    // Inisialisasi harga saham jika belum ada
    if (!("bbcaNormalPrice" in settings)) settings.bbcaNormalPrice = 10150;
    if (!("bbriNormalPrice" in settings)) settings.bbriNormalPrice = 4750;
    if (!("bbniNormalPrice" in settings)) settings.bbniNormalPrice = 6075;
    if (!("brisNormalPrice" in settings)) settings.brisNormalPrice = 2894;

    // Set harga current jika belum ada
    if (!("bbcaPrice" in settings)) settings.bbcaPrice = settings.bbcaNormalPrice;
    if (!("bbriPrice" in settings)) settings.bbriPrice = settings.bbriNormalPrice;
    if (!("bbniPrice" in settings)) settings.bbniPrice = settings.bbniNormalPrice;
    if (!("brisPrice" in settings)) settings.brisPrice = settings.brisNormalPrice;

    // Inisialisasi data user
    if (!user.money) user.money = 0;
    if (!user.totalInvestasi) user.totalInvestasi = 0;
    if (!user.totalInvestasiSekarang) user.totalInvestasiSekarang = 0;

    const action = args[0]?.toLowerCase();
    const stock = args[1]?.toLowerCase();
    const amount = parseInt(args[2]) || 1;

    // Fungsi untuk menghitung status naik/turun
    const calculateStatus = (price, normalPrice) => {
        const diffPercent = ((price - normalPrice) / normalPrice * 100).toFixed(2);
        const status = price > normalPrice ? `📈 Naik (+${diffPercent}%)` : `📉 Turun (${diffPercent}%)`;
        return { status, emoji: price > normalPrice ? "📈" : "📉", diffPercent: parseFloat(diffPercent) };
    };

    // Data saham yang tersedia
    const stocks = {
        bbca: { name: 'Bank Central Asia', code: 'BBCA', priceKey: 'bbcaPrice', normalKey: 'bbcaNormalPrice' },
        bbri: { name: 'Bank Rakyat Indonesia', code: 'BBRI', priceKey: 'bbriPrice', normalKey: 'bbriNormalPrice' },
        bbni: { name: 'Bank Negara Indonesia', code: 'BBNI', priceKey: 'bbniPrice', normalKey: 'bbniNormalPrice' },
        bris: { name: 'Bank Syariah Indonesia', code: 'BRIS', priceKey: 'brisPrice', normalKey: 'brisNormalPrice' }
    };

    if (!action) {
        // Menu market utama dengan harga saham
        let priceList = '📈 *MARKET SAHAM REAL-TIME*\n\n';

        for (const [key, stockData] of Object.entries(stocks)) {
            const currentPrice = settings[stockData.priceKey];
            const normalPrice = settings[stockData.normalKey];
            const { status, emoji } = calculateStatus(currentPrice, normalPrice);

            priceList += `🏢 *${stockData.code}* (${stockData.name})\n`;
            priceList += `💰 ${currentPrice.toLocaleString()}/lembar ${emoji}\n`;
            priceList += `📦 ${(currentPrice * 100).toLocaleString()}/lot\n`;
            priceList += `📊 ${status}\n\n`;
        }

        priceList += `\n🛒 *CARA TRADING:*\n`;
        priceList += `• ${usedPrefix}market beli [kode] [lot]\n`;
        priceList += `• ${usedPrefix}market jual [kode] [lot]\n`;
        priceList += `\n💡 *Contoh:* ${usedPrefix}market beli bbca 5`;

        conn.sendMessage(m.chat, {
            document: readFileSync('./package.json'),
            mimetype: 'application/pdf',
            fileName: `Market Saham Real-Time`,
            fileLength: "999999999999",
            caption: priceList,
            footer: `Market Trading || Herta Bot`,
            buttons: [
                {
                    buttonId: `!portofolio`,
                    buttonText: { displayText: '💼 Lihat Portofolio' },
                    type: 1
                },
                {
                    buttonId: `!saham`,
                    buttonText: { displayText: '📚 Tutorial Trading' },
                    type: 1
                },
                {
                    buttonId: 'trading_action',
                    buttonText: { displayText: 'TRADING SAHAM' },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: 'TRADING SAHAM',
                            sections: [
                                {
                                    title: 'Market Buy',
                                    highlight_label: 'Beli',
                                    rows: [
                                        {
                                            header: 'BBCA',
                                            title: 'Bank Central Asia',
                                            description: `> Beli saham BBCA - Harga: ${settings.bbcaPrice.toLocaleString()}/lembar`,
                                            id: `!market beli bbca 1`,
                                        },
                                        {
                                            header: 'BBRI',
                                            title: 'Bank Rakyat Indonesia',
                                            description: `> Beli saham BBRI - Harga: ${settings.bbriPrice.toLocaleString()}/lembar`,
                                            id: `!market beli bbri 1`,
                                        },
                                        {
                                            header: 'BBNI',
                                            title: 'Bank Negara Indonesia',
                                            description: `> Beli saham BBNI - Harga: ${settings.bbniPrice.toLocaleString()}/lembar`,
                                            id: `!market beli bbni 1`,
                                        },
                                        {
                                            header: 'BRIS',
                                            title: 'Bank Syariah Indonesia',
                                            description: `> Beli saham BRIS - Harga: ${settings.brisPrice.toLocaleString()}/lembar`,
                                            id: `!market beli bris 1`,
                                        },
                                    ],
                                },
                                {
                                    title: 'Market Sell',
                                    highlight_label: 'Jual',
                                    rows: [
                                        {
                                            header: 'BBCA',
                                            title: 'Bank Central Asia',
                                            description: `> Jual saham BBCA - Harga: ${settings.bbcaPrice.toLocaleString()}/lembar`,
                                            id: `!market jual bbca 1`,
                                        },
                                        {
                                            header: 'BBRI',
                                            title: 'Bank Rakyat Indonesia',
                                            description: `> Jual saham BBRI - Harga: ${settings.bbriPrice.toLocaleString()}/lembar`,
                                            id: `!market jual bbri 1`,
                                        },
                                        {
                                            header: 'BBNI',
                                            title: 'Bank Negara Indonesia',
                                            description: `> Jual saham BBNI - Harga: ${settings.bbniPrice.toLocaleString()}/lembar`,
                                            id: `!market jual bbni 1`,
                                        },
                                        {
                                            header: 'BRIS',
                                            title: 'Bank Syariah Indonesia',
                                            description: `> Jual saham BRIS - Harga: ${settings.brisPrice.toLocaleString()}/lembar`,
                                            id: `!market jual bris 1`,
                                        },
                                    ],
                                },
                            ],
                        }),
                    },
                },
            ],
            headerType: 1,
            viewOnce: true,
            contextInfo: {
                externalAdReply: {
                    title: 'Market Saham Real-Time',
                    body: 'Trading Saham Virtual - Live Prices',
                    thumbnailUrl: thumbnail('https://files.catbox.moe/kiycz0.jpg'),
                    sourceUrl: 'https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak(conn, m) });
        return;
    }

    switch (action) {
        case 'beli':
            if (!stock || !stocks[stock]) {
                return conn.reply(m.chat, '📛 Kode saham tidak valid. Gunakan: bbca, bbri, bbni, atau bris', fkontak(conn, m));
            }

            const stockInfo = stocks[stock];
            const stockPrice = settings[stockInfo.priceKey];
            const totalCost = stockPrice * amount * 100; // 1 lot = 100 lembar

            if (user.money < totalCost) {
                return conn.reply(m.chat, `💸 Uang Anda tidak cukup!\n\nDibutuhkan: ${totalCost.toLocaleString()}\nUang Anda: ${user.money.toLocaleString()}`, fkontak(conn, m));
            }

            // Proses pembelian
            user.money -= totalCost;
            user[stock] = (user[stock] || 0) + 1;
            user[`${stock}LembarSaham`] = (user[`${stock}LembarSaham`] || 0) + (amount * 100);
            user[`${stock}Investasi`] = (user[`${stock}Investasi`] || 0) + totalCost;
            user[`${stock}InvestasiSekarang`] = (user[`${stock}InvestasiSekarang`] || 0) + totalCost;
            user.totalInvestasi += totalCost;
            user.totalInvestasiSekarang += totalCost;

            return conn.reply(m.chat, `🛒 *MARKET BUY BERHASIL!*\n\n📊 Saham: ${stockInfo.name} (${stockInfo.code})\n📦 Lot: ${amount}\n📈 Lembar: ${amount * 100}\n💰 Harga: ${stockPrice.toLocaleString()}/lembar\n💸 Total: ${totalCost.toLocaleString()}\n\n💵 Sisa Uang: ${user.money.toLocaleString()}`, fkontak(conn, m));

        case 'jual':
            if (!stock || !stocks[stock]) {
                return conn.reply(m.chat, '📛 Kode saham tidak valid. Gunakan: bbca, bbri, bbni, atau bris', fkontak(conn, m));
            }

            if (!user[stock] || user[`${stock}LembarSaham`] < (amount * 100)) {
                return conn.reply(m.chat, `⛔ Anda tidak memiliki cukup saham ${stocks[stock].code}!\n\nDibutuhkan: ${amount * 100} lembar\nYang dimiliki: ${user[`${stock}LembarSaham`] || 0} lembar`, fkontak(conn, m));
            }

            const sellStockInfo = stocks[stock];
            const sellPrice = settings[sellStockInfo.priceKey];
            const totalSell = sellPrice * amount * 100;

            // Proses penjualan
            user.money += totalSell;
            user[`${stock}LembarSaham`] -= (amount * 100);
            user[`${stock}InvestasiSekarang`] = user[`${stock}LembarSaham`] * sellPrice;

            // Jika semua saham terjual
            if (user[`${stock}LembarSaham`] <= 0) {
                user[stock] = 0;
                user[`${stock}LembarSaham`] = 0;
                user[`${stock}Investasi`] = 0;
                user[`${stock}InvestasiSekarang`] = 0;
            }

            return conn.reply(m.chat, `💵 *MARKET SELL BERHASIL!*\n\n📊 Saham: ${sellStockInfo.name} (${sellStockInfo.code})\n📦 Lot: ${amount}\n📈 Lembar: ${amount * 100}\n💰 Harga: ${sellPrice.toLocaleString()}/lembar\n💸 Total: ${totalSell.toLocaleString()}\n\n💵 Total Uang: ${user.money.toLocaleString()}`, fkontak(conn, m));

        default:
            return conn.reply(m.chat, `❌ Aksi tidak valid. Gunakan: beli atau jual\n\nContoh:\n• ${usedPrefix}market beli bbca 5\n• ${usedPrefix}market jual bbri 3`, fkontak(conn, m));
    }
}

// Properti untuk membantu handler
handler.help = ['market'];
handler.tags = ['finance'];
handler.command = /^market$/i;

export default handler;