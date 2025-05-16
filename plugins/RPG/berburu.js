let handler = async (m, {
	conn
}) => {
	let __timers = (new Date - global.db.data.users[m.sender].lastberburu)
	let _timers = (500000 - __timers)
	let timers = clockString(_timers)
	let user = global.db.data.users[m.sender]
	
	if (user.pistol < 1) return m.reply('Kamu Harus Memiliki Pistol, Beli Pistol Dulu Sana! 🛒')
	if (user.peluru < 49) return m.reply('Peluru Kamu harus 50! 🔋')

	if (new Date - global.db.data.users[m.sender].lastberburu > 500000) {
		let randomaku1 = `${Math.floor(Math.random() * 15)}`
		let randomaku2 = `${Math.floor(Math.random() * 15)}`
		let randomaku3 = `${Math.floor(Math.random() * 15)}`
		let randomaku4 = `${Math.floor(Math.random() * 15)}`
		let randomaku5 = `${Math.floor(Math.random() * 15)}`
		let randomaku6 = `${Math.floor(Math.random() * 15)}`
		let randomaku7 = `${Math.floor(Math.random() * 15)}`
		let randomaku8 = `${Math.floor(Math.random() * 15)}`
		let randomaku9 = `${Math.floor(Math.random() * 15)}`
		let randomaku10 = `${Math.floor(Math.random() * 15)}`
		let randomaku11 = `${Math.floor(Math.random() * 15)}`
		let randomaku12 = `${Math.floor(Math.random() * 15)}`
		let randomaku13 = `${Math.floor(Math.random() * 259)}`
		let ammo = `${Math.floor(Math.random() * 10)}`
		
		let rbrb1 = (randomaku1 * 1)
		let rbrb2 = (randomaku2 * 1)
		let rbrb3 = (randomaku3 * 1)
		let rbrb4 = (randomaku4 * 1)
		let rbrb5 = (randomaku5 * 1)
		let rbrb6 = (randomaku6 * 1)
		let rbrb7 = (randomaku7 * 1)
		let rbrb8 = (randomaku8 * 1)
		let rbrb9 = (randomaku9 * 1)
		let rbrb10 = (randomaku10 * 1)
		let rbrb11 = (randomaku11 * 1)
		let rbrb12 = (randomaku12 * 1)
		let rbrb13 = (randomaku13 * 1)

		let anti1 = `${rbrb1}`
		let anti2 = `${rbrb2}`
		let anti3 = `${rbrb3}`
		let anti4 = `${rbrb4}`
		let anti5 = `${rbrb5}`
		let anti6 = `${rbrb6}`
		let anti7 = `${rbrb7}`
		let anti8 = `${rbrb8}`
	    let anti9 = `${rbrb9}`
		let anti10 = `${rbrb10}`
		let anti11 = `${rbrb11}`
		let anti12 = `${rbrb12}`
		let anti13 = `${rbrb13}`

		let caption = 
`
*《 Hasil Berburu ${conn.getName(m.sender)} 》*
	
- 🐂 = [ ${anti1} ]        - 🐐 = [ ${anti4} ]
- 🐃 = [ ${anti7} ]        - 🐗 = [ ${anti10} ]
- 🐅 = [ ${anti2} ]        - 🐼 = [ ${anti5} ]
- 🐮 = [ ${anti8} ]        - 🐖 = [ ${anti11} ]
- 🐘 = [ ${anti3} ]        - 🐊 = [ ${anti6} ]
- 🐒 = [ ${anti9} ]        - 🐓 = [ ${anti12} ]

Ketik: *.kandang* Untuk Menampilkan Hasilnya
Peluru  🔋 - ${ammo}
Damage  💥 ${anti13}
`

		global.db.data.users[m.sender].banteng += rbrb1
		global.db.data.users[m.sender].harimau += rbrb2
		global.db.data.users[m.sender].gajah += rbrb3
		global.db.data.users[m.sender].kambing += rbrb4
		global.db.data.users[m.sender].panda += rbrb5
		global.db.data.users[m.sender].buaya += rbrb6
		global.db.data.users[m.sender].kerbau += rbrb7
		global.db.data.users[m.sender].sapi += rbrb8
		global.db.data.users[m.sender].monyet += rbrb9
		global.db.data.users[m.sender].babihutan += rbrb10
		global.db.data.users[m.sender].babi += rbrb11
		global.db.data.users[m.sender].ayam += rbrb12
		global.db.data.users[m.sender].damage  += rbrb13
		global.db.data.users[m.sender].peluru  -= ammo * 1

		setTimeout(() => {
			conn.reply(m.chat, caption, m)
		}, 18000)

		setTimeout(() => {
			conn.reply(m.chat,  'Nah ini dia', m)
		}, 15000)

		setTimeout(() => {
			conn.reply(m.chat,  `${conn.getName(m.sender)} Dapet nih..`, m)
		}, 14000)

		setTimeout(() => {
			conn.reply(m.chat,  `${conn.getName(m.sender)} Sedang berburu...`, m)
		}, 0)

		user.lastberburu = new Date() * 1

	} else {
		conn.reply(m.chat, `\nSilahkan Menunggu Selama ${timers} Untuk Berburu Kembali 🕰️`, m)
	}

}
handler.help = ['berburu']
handler.tags = ['rpg']
handler.command = /^(berburu)$/i
handler.group = true;
handler.rpg = true;
handler.register = true;
export default handler

function clockString(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return `${d} Hari ${h} Jam ${m} Menit ${s} Detik`
}
