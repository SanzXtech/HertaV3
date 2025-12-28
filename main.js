import "./settings.js"

import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'

import fs, { readdirSync, existsSync, statSync } from "fs"
import pino from "pino"
import { smsg } from "./lib/simple.js"
import path, { join, dirname } from "path"
import { memberUpdate } from "./message/group.js"
import { antiCall } from "./message/anticall.js"
import { connectionUpdate } from "./message/connection.js"
import { Function } from "./message/function.js"
import { createRequire } from "module"
import { fileURLToPath, pathToFileURL } from "url"
import { platform } from "process"
import chalk from "chalk"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Global helpers
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== "win32") {
  return rmPrefix ? (/file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL) : pathToFileURL(pathURL).toString()
}

global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}

// Simple in-memory store alternative
const createSimpleStore = () => {
  return {
    contacts: {},
    chats: {},
    messages: {},
    bind: function(ev) {
      // Simple event binding untuk store
      ev.on('contacts.upsert', (contacts) => {
        contacts.forEach(contact => {
          this.contacts[contact.id] = contact
        })
      })
    }
  }
}

// Fungsi untuk mendapatkan nama pengirim
const getSenderName = async (sock, jid, participant = null) => {
  try {
    let name = "Anonymous"
    const targetJid = participant || jid
    
    // Coba dari kontak yang sudah tersimpan
    if (global.store && global.store.contacts && global.store.contacts[targetJid]) {
      const contact = global.store.contacts[targetJid]
      name = contact.name || contact.notify || targetJid.split('@')[0]
    }
    
    // Jika masih anonymous, gunakan nomor
    if (name === "Anonymous") {
      name = targetJid.split('@')[0]
    }
    
    return name
  } catch {
    return "Anonymous"
  }
}

// Fungsi ekstrak teks pesan
const extractMessageText = (m) => {
  if (!m.message) return "[No Message]"
  
  if (m.message.conversation) return m.message.conversation
  if (m.message.extendedTextMessage?.text) return m.message.extendedTextMessage.text
  if (m.message.imageMessage?.caption) return m.message.imageMessage.caption
  if (m.message.videoMessage?.caption) return m.message.videoMessage.caption
  
  if (m.message.imageMessage) return "[Image]"
  if (m.message.videoMessage) return "[Video]"
  if (m.message.audioMessage) return "[Audio]"
  if (m.message.documentMessage) return "[Document]"
  if (m.message.stickerMessage) return "[Sticker]"
  
  return "[Message]"
}

// Connect to WhatsApp
const connectToWhatsApp = async () => {
  try {
    console.log(chalk.magenta("Starting WhatsApp connection..."))
    
    // Load database jika ada
    if (global.db && typeof global.db.read === 'function') {
      await global.db.read().catch(() => {})
    }
    
    // Auth state
    const sessionFolder = './session'
    if (!existsSync(sessionFolder)) {
      fs.mkdirSync(sessionFolder, { recursive: true })
    }
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
    
    // Version
    const { version } = await fetchLatestBaileysVersion()
    
    // Buat store sederhana
    global.store = createSimpleStore()
    
    // Socket config
    const sockConfig = {
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      printQRInTerminal: !global.pairingCode,
      browser: Browsers.ubuntu('WhatsApp Bot'),
      logger: pino({ level: 'fatal' }),
      markOnlineOnConnect: true,
      syncFullHistory: false,
      generateHighQualityLinkPreview: true
    }
    
    // Buat socket
    global.conn = makeWASocket(sockConfig)
    
    // Bind store sederhana
    if (global.store.bind) {
      global.store.bind(global.conn.ev)
    }
    
    // Pairing Code handler
    if (global.pairingCode && global.conn.authState && !global.conn.authState.creds.registered) {
      setTimeout(async () => {
        try {
          const code = await global.conn.requestPairingCode(global.nomerBot)
          const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code
          
          console.log(chalk.magenta(`Pairing Code for ${global.nomerBot}:`))
          console.log(chalk.magenta(`${formattedCode}`))
        } catch (err) {
          console.log(chalk.red(`Error: ${err.message}`))
        }
      }, 3000)
    }
    
    // Event handling
    global.conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error instanceof Boom) 
          ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
          : true
        
        if (shouldReconnect) {
          console.log(chalk.magenta("Reconnecting..."))
          setTimeout(connectToWhatsApp, 5000)
        }
      } else if (connection === 'open') {
        console.log(chalk.magenta("Connected"))
      }
      
      // Call original connectionUpdate jika ada
      if (typeof connectionUpdate === 'function') {
        try {
          await connectionUpdate(connectToWhatsApp, global.conn, update)
        } catch (e) {}
      }
    })
    
    // Creds update
    global.conn.ev.on('creds.update', saveCreds)
    
    // Contacts update untuk store
    global.conn.ev.on('contacts.upsert', (contacts) => {
      if (global.store && global.store.contacts) {
        contacts.forEach(contact => {
          global.store.contacts[contact.id] = contact
        })
      }
    })
    
    // Messages handler - CLEAN LOGGING
    global.conn.ev.on('messages.upsert', async ({ messages }) => {
      try {
        if (!messages || messages.length === 0) return
        
        const m = messages[0]
        if (!m.message || m.key?.fromMe) return
        
        // Skip system messages
        if (m.key.remoteJid === 'status@broadcast') return
        
        // Get sender info
        const senderJid = m.key.remoteJid
        const participant = m.key.participant
        const isGroup = senderJid?.endsWith('@g.us')
        
        // Get display name
        let displayName = await getSenderName(
          global.conn, 
          isGroup && participant ? participant : senderJid
        )
        
        // Extract message text
        const messageText = extractMessageText(m)
        
        // CLEAN LOG OUTPUT - NO BORDER, NO EXTRA INFO
        console.log(
          chalk.magenta(`${displayName}: `) + 
          chalk.white(messageText.substring(0, 200)) // Limit panjang pesan
        )
        
        // Process message jika smsg ada
        if (typeof smsg === 'function') {
          try {
            const processedMsg = await smsg(global.conn, m)
            
            // Load handler jika ada
            try {
              const { handler } = await import(`./handler.js?v=${Date.now()}`)
              if (handler && typeof handler === 'function') {
                await handler(global.conn, processedMsg, { messages })
              }
            } catch (e) {
              // Handler tidak ditemukan, tidak masalah
            }
          } catch (e) {
            // Error processing, continue
          }
        }
        
      } catch (err) {
        console.log(chalk.red(`Error: ${err.message}`))
      }
    })
    
    // Anti call
    global.conn.ev.on('call', async (node) => {
      if (typeof antiCall === 'function') {
        try {
          antiCall(global.db, node, global.conn)
        } catch (e) {}
      }
    })
    
    // Group participants update
    global.conn.ev.on('group-participants.update', async (event) => {
      if (typeof memberUpdate === 'function') {
        try {
          memberUpdate(global.conn, event)
        } catch (e) {}
      }
    })
    
    // Load plugins jika ada
    const pluginFolder = path.join(__dirname, "./plugins")
    global.plugins = {}
    
    if (existsSync(pluginFolder)) {
      try {
        const files = readdirSync(pluginFolder)
        for (const file of files) {
          if (file.endsWith('.js')) {
            try {
              const module = await import(`file://${join(pluginFolder, file)}`)
              global.plugins[file] = module.default || module
            } catch (e) {
              // Skip plugin errors
            }
          }
        }
      } catch (e) {}
    }
    
    // Initialize function jika ada
    if (typeof Function === 'function') {
      try {
        Function(global.conn)
      } catch (e) {}
    }
    
    return global.conn
    
  } catch (err) {
    console.log(chalk.red(`Connection error: ${err.message}`))
    // Restart setelah 10 detik
    setTimeout(connectToWhatsApp, 10000)
    throw err
  }
}

// Start connection dengan error handling
connectToWhatsApp().catch(err => {
  console.log(chalk.red(`Startup failed: ${err.message}`))
})

// Error handling
process.on('uncaughtException', (err) => {
  const msg = err.message || String(err)
  // Skip common connection errors
  if (msg.includes('Socket') || msg.includes('Connection') || msg.includes('ECONN')) {
    return
  }
  console.log(chalk.red(`Error: ${msg}`))
})

process.on('warning', (warning) => {
  console.log(chalk.yellow(`Warning: ${warning.message}`))
})
