// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

import "./settings.js";

import {
  makeInMemoryStore,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  MessageRetryMap,
  fetchLatestBaileysVersion,
  PHONENUMBER_MCC,
  getAggregateVotesInPollMessage,
  makeWASocket,
  Browsers,
  DisconnectReason
} from "@whiskeysockets/baileys";

import fs, { readdirSync, existsSync, readFileSync, watch, statSync } from "fs";
import logg from "pino";
import { Socket, smsg, protoType } from "./lib/simple.js";
import CFonts from "cfonts";
import path, { join, dirname, basename } from "path";
import { memberUpdate, groupsUpdate } from "./message/group.js";
import { antiCall } from "./message/anticall.js";
import { connectionUpdate } from "./message/connection.js";
import { Function } from "./message/function.js";
import NodeCache from "node-cache";
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";
import { platform } from "process";
import syntaxerror from "syntax-error";
import { format } from "util";
import chokidar from "chokidar";
import chalk from "chalk";
import util from "util";
import { Boom } from "@hapi/boom";

const __dirname = dirname(fileURLToPath(import.meta.url));

global.__filename = function filename(
  pathURL = import.meta.url,
  rmPrefix = platform !== "win32"
) {
  return rmPrefix
    ? /file:\/\/\//.test(pathURL)
      ? fileURLToPath(pathURL)
      : pathURL
    : pathToFileURL(pathURL).toString();
};

global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

protoType();

let phoneNumber = "916909137213";
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const pairingCode = false; // process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");

const msgRetryCounterCache = new NodeCache();
const msgRetryCounterMap = (MessageRetryMap) => {};

CFonts.say("fearless", {
  font: "chrome",
  align: "left",
  gradient: ["red", "magenta"],
});

// Connect to WhatsApp
const connectToWhatsApp = async () => {
  try {
    // Import database (jika ada)
    try {
      await (await import("./message/database.js")).default();
    } catch (error) {
      console.log("⚠️ Database module not found or error, continuing...");
    }

    // Setup session dengan path yang benar untuk Baileys v7
    const sessionFolder = './session';
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

    const store = makeInMemoryStore({
      logger: logg().child({ level: "fatal", stream: "store" }),
    });

    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`📱 Using WhatsApp version: ${version.join('.')}, isLatest: ${isLatest}`);

    // Function agar pesan bot tidak pending
    const getMessage = async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
        return msg?.message || undefined;
      }
      return {};
    };

    // Auth configuration untuk Baileys v7
    const auth = {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        logg().child({ level: "fatal", stream: "store" })
      ),
    };

    // Function agar bisa pake button di baileys terbaru
    const patchMessageBeforeSending = (message) => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.listMessage ||
        message.templateMessage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {},
              },
              ...message,
            },
          },
        };
      }
      return message;
    };

    // Connection options untuk Baileys v7
    const connectionOptions = {
      version,
      printQRInTerminal: !global.pairingCode,
      patchMessageBeforeSending,
      logger: logg({ level: "fatal" }),
      auth,
      browser: Browsers.ubuntu("Chrome"),
      getMessage,
      msgRetryCounterCache,
      defaultQueryTimeoutMs: 60000,
      connectTimeoutMs: 30000,
      emitOwnEvents: true,
      fireInitQueries: true,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      markOnlineOnConnect: true,
    };

    // Membuat koneksi socket
    global.conn = makeWASocket(connectionOptions);

    // Bind store ke events
    if (!global.pairingCode) {
      store.bind(conn.ev);
    }

    // Handle pairing code jika diperlukan
    if (global.pairingCode && !conn.authState?.creds?.registered) {
      setTimeout(async () => {
        try {
          let code = await conn.requestPairingCode(global.nomerBot);
          code = code?.match(/.{1,4}/g)?.join("-") || code;
          console.log(
            chalk.black(chalk.bgGreen(`Your Phone Number : `)),
            chalk.black(chalk.white(global.nomerBot)),
            chalk.black(chalk.bgGreen(`\nYour Pairing Code : `)),
            chalk.black(chalk.white(code))
          );
        } catch (error) {
          console.log("⚠️ Error getting pairing code:", error.message);
        }
      }, 3000);
    }

    // Handle events
    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log('📱 QR Code generated, please scan!');
      }
      
      if (connection === 'close') {
        const statusCode = (new Boom(lastDisconnect?.error)).output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        console.log(`❌ Connection closed. Reconnecting: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          setTimeout(connectToWhatsApp, 5000);
        }
      } else if (connection === 'open') {
        console.log('✅ WhatsApp connected successfully!');
        console.log('👤 User ID:', conn.user?.id);
      }
    });

    // Handle credentials update
    conn.ev.on('creds.update', saveCreds);

    // Handle messages
    conn.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        if (type !== 'notify') return;
        if (!messages || messages.length === 0) return;
        
        let m = messages[0];
        if (!m) return;
        if (m.key?.fromMe) return; // Abaikan pesan yang dikirim oleh bot sendiri
        
        // Handle special message types
        if (m.message?.viewOnceMessageV2) m.message = m.message.viewOnceMessageV2.message;
        if (m.message?.documentWithCaptionMessage) m.message = m.message.documentWithCaptionMessage.message;
        if (m.message?.viewOnceMessageV2Extension) m.message = m.message.viewOnceMessageV2Extension.message;
        
        // Skip status broadcasts
        if (m.key && m.key.remoteJid === 'status@broadcast') return;
        if (!m.message) return;
        
        // Filter out certain message IDs
        if (m.key.id && (m.key.id.length === 22 || (m.key.id.startsWith('3EB0') && m.key.id.length === 12))) return;
        
        // Convert to message object
        m = await smsg(conn, m);
        
        // Handle registration jika ada
        try {
          const { register } = await import(`./message/register.js?v=${Date.now()}`);
          await register(m);
        } catch (err) {
          // Skip if register module doesn't exist
        }
        
        // Handle message dengan handler
        try {
          const { handler } = await import(`./handler.js?v=${Date.now()}`);
          await handler(conn, m, { messages, type }, store);
        } catch (err) {
          console.log('⚠️ Handler error:', err.message);
        }
        
      } catch (err) {
        console.log('⚠️ Error processing message:', err.message);
        if (global.ownerBot) {
          conn.sendMessage(global.ownerBot, { text: util.format(err) }).catch(() => {});
        }
      }
    });

    // Handle calls
    conn.ev.on('call', async (node) => {
      try {
        await antiCall(db, node, conn);
      } catch (error) {
        console.log('⚠️ Error handling call:', error.message);
      }
    });

    // Handle group participants update
    conn.ev.on('group-participants.update', async (anu) => {
      try {
        await memberUpdate(conn, anu);
      } catch (error) {
        console.log('⚠️ Error handling group update:', error.message);
      }
    });

    // Load plugins
    const pluginFolder = path.join(__dirname, "./plugins");
    const pluginFilter = (filename) => /\.js$/.test(filename);
    global.plugins = {};

    async function filesInit(folderPath) {
      if (!existsSync(folderPath)) return;
      
      const files = readdirSync(folderPath);
      for (let file of files) {
        const filePath = join(folderPath, file);
        const fileStat = statSync(filePath);
        
        if (fileStat.isDirectory()) {
          await filesInit(filePath);
        } else if (pluginFilter(file)) {
          try {
            const module = await import("file://" + filePath);
            global.plugins[file] = module.default || module;
          } catch (e) {
            console.log(`⚠️ Error loading plugin ${file}:`, e.message);
            delete global.plugins[file];
          }
        }
      }
    }

    await filesInit(pluginFolder);

    // Plugin reload function
    global.reload = async (_ev, filename) => {
      if (pluginFilter(filename)) {
        let dir = global.__filename(join(pluginFolder, filename), true);
        
        if (filename in global.plugins) {
          if (existsSync(dir)) {
            console.log(
              chalk.bgGreen(chalk.black("[ UPDATE ]")),
              chalk.white(`${filename}`)
            );
          } else {
            console.log(
              chalk.bgRed(chalk.black("[ DELETE ]")),
              chalk.white(`${filename}`)
            );
            return delete global.plugins[filename];
          }
        } else {
          console.log(
            chalk.bgBlue(chalk.black("[ NEW ]")),
            chalk.white(`${filename}`)
          );
        }

        try {
          let err = syntaxerror(readFileSync(dir), filename, {
            sourceType: "module",
            allowAwaitOutsideFunction: true,
          });
          
          if (err) {
            console.log(`❌ Syntax error in ${filename}:\n${format(err)}`);
          } else {
            const module = await import(`${global.__filename(dir)}?update=${Date.now()}`);
            global.plugins[filename] = module.default || module;
          }
        } catch (e) {
          console.log(`❌ Error loading plugin ${filename}:\n${format(e)}`);
        } finally {
          global.plugins = Object.fromEntries(
            Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
          );
        }
      }
    };

    // Setup file watcher untuk plugins
    if (existsSync(pluginFolder)) {
      const watcher = chokidar.watch(pluginFolder, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        depth: 99,
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 100,
        },
      });

      watcher.on("change", (path) => {
        if (path.endsWith(".js")) {
          const filename = basename(path);
          global.reload(null, filename);
        }
      });

      Object.freeze(global.reload);
    }

    // Initialize functions
    try {
      await Function(conn);
    } catch (error) {
      console.log("⚠️ Error initializing functions:", error.message);
    }

    console.log("🚀 WhatsApp Bot is ready!");
    return conn;

  } catch (error) {
    console.log("❌ Error connecting to WhatsApp:", error.message);
    console.log("🔄 Reconnecting in 5 seconds...");
    setTimeout(connectToWhatsApp, 5000);
  }
};

// Start the bot
connectToWhatsApp();

// Error handling
process.on("uncaughtException", function (err) {
  let e = String(err);
  const ignorableErrors = [
    "Socket connection timeout",
    "rate-overlimit",
    "Connection Closed",
    "Timed Out",
    "Value not found",
    "ERR_MODULE_NOT_FOUND"
  ];
  
  if (ignorableErrors.some(error => e.includes(error))) return;
  
  console.log("⚠️ Caught exception: ", err.message);
  console.log("📋 Stack trace:", err.stack);
});

process.on("warning", (warning) => {
  console.warn("⚠️ Warning:", warning.name);
  console.warn("📝 Message:", warning.message);
});

process.on("unhandledRejection", (reason, promise) => {
  console.warn("⚠️ Unhandled Rejection at:", promise);
  console.warn("📝 Reason:", reason);
});
