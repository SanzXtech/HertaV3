//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

import "./settings.js";

// ✅ BAILEYS V7 IMPORT
import makeWASocket, {
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  Browsers
} from '@whiskeysockets/baileys';

import fs, { readdirSync, existsSync, readFileSync, watch, statSync } from "fs";
import logg from "pino";
import { smsg, protoType, store } from "./lib/simple.js";
import CFonts from "cfonts";
import path, { join, dirname } from "path";
import { memberUpdate } from "./message/group.js";
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

const requireC = createRequire(import.meta.url);
const readline = requireC("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pairingCode = false;
const msgRetryCounterCache = new NodeCache();

// ✅ MESSAGERETRYMAP UNTUK BAILEYS V7
const msgRetryCounterMap = {
  get: (key) => msgRetryCounterCache.get(key) || 0,
  set: (key, value) => msgRetryCounterCache.set(key, value)
};

CFonts.say("fearless", {
  font: "chrome",
  align: "left",
  gradient: ["red", "magenta"],
});

// Connect to WhatsApp
const connectToWhatsApp = async () => {
  try {
    // Load database
    const loadDatabase = (await import("./message/database.js")).default;
    await loadDatabase();

    // Session path
    const sessionPath = global.session || './session';
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    // ✅ BAILEYS V7 - TIDAK PERLU fetchLatestBaileysVersion
    const version = [2, 2413, 1];

    // Get message function
    const getMessage = async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
        return msg?.message || undefined;
      }
      return {};
    };

    // Auth state
    const auth = {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        logg().child({ level: "fatal", stream: "store" })
      ),
    };

    // ✅ CONFIG BAILEYS V7
    const connectionOptions = {
      version,
      printQRInTerminal: !global.pairingCode,
      logger: logg({ level: "fatal" }),
      auth,
      browser: Browsers.ubuntu('Chrome'),
      getMessage,
      msgRetryCounterMap,
      keepAliveIntervalMs: 20000,
      connectTimeoutMs: 30000,
      emitOwnEvents: true,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      markOnlineOnConnect: true,
      msgRetryCounterCache,
    };

    // Create connection
    global.conn = makeWASocket(connectionOptions);

    // Bind store
    store.bind(conn.ev);

    // ✅ PAIRING CODE BAILEYS V7
    if (global.pairingCode && !conn.authState.creds.registered) {
      setTimeout(async () => {
        try {
          if (global.nomerBot) {
            const code = await conn.requestPairingCode(global.nomerBot);
            const formattedCode = code.length === 8 ? 
              `${code.substring(0, 4)}-${code.substring(4)}` : code;
            
            console.log(chalk.magenta(`\n📱 PAIRING CODE`));
            console.log(chalk.magenta(`Untuk: ${global.nomerBot}`));
            console.log(chalk.magenta(`Kode: ${formattedCode}`));
            console.log(chalk.magenta(`⏣ Masukkan di WhatsApp > Linked Devices\n`));
          }
        } catch (err) {
          console.log(chalk.red(`Error pairing: ${err.message}`));
        }
      }, 5000);
    }

    // Event handlers
    conn.ev.on('connection.update', async (update) => {
      await connectionUpdate(connectToWhatsApp, conn, update);
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        if (!messages || !messages[0]) return;
        
        let m = messages[0];
        if (m.key.fromMe) return;
        
        // Process message
        m = await smsg(conn, m);
        
        // Load handler
        const { handler } = await import(`./handler.js?v=${Date.now()}`).catch(
          (err) => console.log(chalk.red(`Handler: ${err.message}`))
        );
        
        if (handler) {
          await handler(conn, m, { messages, type }, store);
        }
        
        // Log message
        if (m.body) {
          console.log(chalk.magenta(`${m.pushname || 'Unknown'}: `) + chalk.white(m.body.substring(0, 100)));
        }
        
      } catch(err) {
        console.log(chalk.red(`Message error: ${err.message}`));
      }
    });

    conn.ev.on('call', async (calls) => {
      if (calls?.length > 0) {
        antiCall(global.db, calls[0], conn);
      }
    });

    conn.ev.on('group-participants.update', async (event) => {
      memberUpdate(conn, event);
    });

    // Load plugins
    const pluginFolder = path.join(__dirname, "./plugins");
    global.plugins = {};

    async function loadPlugins(folderPath) {
      const files = readdirSync(folderPath);
      for (let file of files) {
        const filePath = join(folderPath, file);
        const fileStat = statSync(filePath);
        
        if (fileStat.isDirectory()) {
          await loadPlugins(filePath);
        } else if (file.endsWith('.js')) {
          try {
            const module = await import("file://" + filePath);
            global.plugins[file] = module.default || module;
          } catch (e) {
            console.log(chalk.red(`Plugin error ${file}: ${e.message}`));
          }
        }
      }
    }

    await loadPlugins(pluginFolder);

    // Initialize function
    Function(conn);
    
    console.log(chalk.green('✅ Bot berhasil terhubung!'));
    return conn;
    
  } catch (error) {
    console.log(chalk.red(`❌ Connection error: ${error.message}`));
    // Restart after 5 seconds
    setTimeout(connectToWhatsApp, 5000);
  }
};

// Start connection
connectToWhatsApp();

// Error handlers
process.on("uncaughtException", function (err) {
  const e = String(err);
  if (e.includes("Socket connection timeout")) return;
  if (e.includes("Connection Closed")) return;
  console.log(chalk.red("Uncaught Exception: ", err.message));
});

process.on("warning", (warning) => {
  console.log(chalk.yellow(`Warning: ${warning.message}`));
});

process.on("unhandledRejection", (reason, promise) => {
  console.log(chalk.red('Unhandled Rejection at:', promise, 'reason:', reason));
});
