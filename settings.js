import { createRequire } from "module";
import { fileURLToPath } from "url";
import fs from 'fs-extra';
import chalk from "chalk";
const require = createRequire(import.meta.url);
const version = require("@whiskeysockets/baileys/package.json").version; // ✅ Update ke @whiskeysockets/baileys
const stringSimilarity = require("string-similarity");

//======== OWNER SETTINGS =======\\
global.nomerOwner = "6281401689098";
global.nomerOwner2 = "6287767805182";
global.nomerBot = "6287767805182"; // ✅ Untuk pairing code
global.botName = "Herta - V3";
global.ownerName = "© SanzOnly"; 
global.sgc = 'https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u';

//======= BOT SETTINGS ======\\
global.pairingCode = true; // ✅ TRUE untuk pairing code, FALSE untuk QR
global.heroku = true;
global.username = "SanzXtech";
global.repo = "HertaV3";
global.token = "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";
global.botName = "Herta";
global.session = "session";
global.runWith = "Heroku";
global.language = "id";
global.Qoted = "ftoko";
global.baileysMd = true;
global.antiSpam = true;
global.fake = global.botName;
global.Console = false;
global.print = true;
global.copyright = `© ${global.botName}`;
global.fake1 = "© Sanz X Herta";
global.packName = "Bot Name : Herta-V3\nTiktok : sanzverse7";
global.authorName = '© Sanz Verse';
global.autoblockcmd = false;
global.ownerBot = `${global.nomerOwner}@s.whatsapp.net`;
global.gamewaktu = 60;
global.limitCount = 30;
global.Intervalmsg = 1000;
global.mongodb = "mongodb+srv://sanzaja:sanzaja@sanzaja.6nxd383.mongodb.net/?appName=sanzaja";
global.dbName = "sanzzonly";
global.redisdb = '';
global.myUrl = "https://wa.me/c/6281401689098";
global.newsletterJid = "120363282851754043@newsletter";
global.newsletterName = "HERTA LOVER";
global.gcounti = {
  prem: 60,
  user: 20,
};

global.Exif = {
  packId: "https://linktr.ee/NotNpc.Id",
  packName: "Herta Chan",
  packPublish: `extream`,
  packEmail: "techprototypex@gmail.com",
  packWebsite: "https://linktr.ee/NotNpc.Id",
  androidApp: "https://play.google.com/store/apps/details?id=com.bitsmedia.android.muslimpro",
  iOSApp: "https://apps.apple.com/id/app/muslim-pro-al-quran-adzan/id388389451?|=id",
  emojis: [],
  isAvatar: 0,
};

global.fotoRandom = [
  "https://telegra.ph/file/e8f257845f899f34cd560.jpg",
];

global.apiMiftah = 'officialdittaz';
global.apiNazmy = 'Reyosaka';
global.apiLolhuman = 'ichanZX';
global.apiNekohime = '37b374ef';
global.fileStackApi = "AlDgaKtdiT1iL6CwlXMpWz";
global.apiflash = "39fc26a0f40048eb838b8c35e0789947";
global.apiUrl = 'https://api.tioo.eu.org';

global.multiplier = 38;

/*============== EMOJI ==============*/
global.rpg = {
  emoticon(string) {
    string = string.toLowerCase();
    let emot = {
      level: "📊",
      limit: "🎫",
      tiketcn: "🔖",
      health: "❤️",
      stamina: "⚡",
      exp: "✨",
      atm: "💳",
      money: "💰",
      bank: "🏦",
      potion: "🥤",
      diamond: "💎",
      rawdiamond: "💠",
      common: "📦",
      uncommon: "🛍️",
      mythic: "🎁",
      legendary: "🗃️",
      superior: "💼",
      pet: "🔖",
      trash: "🗑",
      armor: "🥼",
      sword: "⚔️",
      pickaxe: "⛏️",
      axe: "🪓",
      fishingrod: "🎣",
      pistol: "🔫",
      peluru: "🔋",
      kondom: "🎴",
      coal: "⬛",
      wood: "🪵",
      rock: "🪨",
      string: "🕸️",
      horse: "🐴",
      cat: "🐱",
      dog: "🐶",
      fox: "🦊",
      robo: "🤖",
      dragon: "🐉",
      dino: "🦖",
      tano: "🦕",
      kirana: "👩🏻",
      unicorn: "🦄",
      pizza: "🍕",
      burger: "🍔",
      kepitingbakar: "🦀",
      ayambakar: "🍖",
      steak: "🥩",
      wine: "🍷",
      beer: "🍺",
      petfood: "🍖",
      iron: "⛓️",
      rawiron: "◽",
      gold: "🪙",
      rawgold: "🔸",
      emerald: "❇️",
      upgrader: "🧰",
      bibitanggur: "🌱",
      bibitjeruk: "🌿",
      bibitapel: "☘️",
      bibitmangga: "🍀",
      bibitpisang: "🌴",
      anggur: "🍇",
      jeruk: "🍊",
      apel: "🍎",
      mangga: "🥭",
      pisang: "🍌",
      botol: "🍾",
      kardus: "📦",
      kaleng: "🏮",
      plastik: "📜",
      gelas: "🧋",
      chip: "♋",
      umpan: "🪱",
      skata: "🧩",
      defense: "🛡️",
      strength: "💪🏻",
      speed: "🏃",
      tbox: "🗄️",
    };
    let results = Object.keys(emot)
      .map((v) => [v, new RegExp(v, "gi")])
      .filter((v) => v[1].test(string));
    if (!results.length) return "";
    else return emot[results[0][0]];
  },
};

//============================================\\

async function similarity(one, two) {
  const treshold = stringSimilarity.compareTwoStrings(one, two);
  return treshold.toFixed(2);
}

async function reloadFile(file) {
  file = file.url || file;
  let fileP = fileURLToPath(file);
  fs.watchFile(fileP, () => {
    fs.unwatchFile(fileP);
    console.log(
      chalk.bgGreen(chalk.black("[ UPDATE ]")),
      chalk.white(`${fileP}`)
    );
    import(`${file}?update=${Date.now()}`);
  });
}

reloadFile(import.meta.url);

function transformText(text) {
  const charMap = {
    'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ғ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ',
    'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ',
    'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ',
    '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
  };

  return text.toUpperCase().split('').map(char => {
    return charMap[char] || char;
  }).join('');
}

function transformText2(text) {
  const charMap = {
    'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ғ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ',
    'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ',
    'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ',
    '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
  };

  return text.split('').map(char => {
    return charMap[char.toUpperCase()] || char;
  }).join(' ');
}

function transformText3(text) {
  const superscriptMap = {
    'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ',
    'i': 'ᶦ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ',
    'q': 'q', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ',
    'y': 'ʸ', 'z': 'ᶻ',
    '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '0': '⁰',
    '.': '·'
  };

  return [...text.toLowerCase()].map(char => superscriptMap[char] || char).join('');
}

function transformText4(text) {
  const stylishMap = {
    'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨', 'h': '𝘩', 'i': '𝘪',
    'j': '𝘫', 'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳',
    's': '𝘴', 't': '𝘵', 'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹', 'y': '𝘺', 'z': '𝘻',
    '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵', '0': '𝟬',
    '.': '.', ' ': ' '
  };

  return [...text.toLowerCase()].map(char => stylishMap[char] || char).join('');
}

function getRandomFile(ext) {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
}

function makeid(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function totalCase(filePath, command) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    let found = false;
    const lines = data.split('\n');
    lines.forEach((line) => {
      const caseMatch = line.match(/case\s+['"]([^'"]+)['"]/);
      if (caseMatch && caseMatch[1] === command) {
        found = true;
      }
    });
    return found;
  } catch (err) {
    throw err;
  }
}

async function randomNames() {
  const indonesianNames = [
    "Agus", "Budi", "Dewi", "Eka", "Fitri", "Gita", "Hadi", "Indra", "Joko", "Kartika",
    "Lina", "Mega", "Nur", "Putra", "Rini", "Sari", "Tono", "Wahyu", "Yanti", "Zain",
    "Adi", "Bayu", "Cahya", "Dian", "Edi", "Fandi", "Ganda", "Hendra", "Ika", "Jati",
    "Kurnia", "Lusi", "Murni", "Nana", "Oky", "Prita", "Rina", "Santo", "Tika", "Umar",
    "Vera", "Wulan", "Yani", "Zul", "Abdi", "Bagus", "Cindy", "Dinda", "Eko", "Fajar",
    "Gita", "Hesti", "Iwan", "Jaya", "Krisna", "Laras", "Mira", "Nindy", "Olla", "Panda",
    "Rudy", "Sinta", "
