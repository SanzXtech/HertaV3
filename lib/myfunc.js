"use strict";
import axios from "axios";
import fs from 'fs-extra'
import fetch from "node-fetch";
import chalk from "chalk";
import { randomBytes } from "crypto";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

// Jimp di-import di dalam fungsi saja untuk menghindari error
let Jimp;

const generateProfilePicture = async (buffer) => {
  try {
    // Coba import Jimp jika belum ada
    if (!Jimp) {
      try {
        // Coba metode 1: import biasa
        const jimpModule = await import("jimp");
        Jimp = jimpModule.default || jimpModule;
      } catch (importError) {
        console.log('First import method failed, trying alternative...');
        // Coba metode 2: require style
        Jimp = (await import("jimp")).default;
      }
    }
    
    const image = await Jimp.read(buffer);
    const min = image.getWidth();
    const max = image.getHeight();
    const cropped = image.crop(0, 0, min, max);
    return {
      img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
      preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    };
  } catch (error) {
    console.error('Error in generateProfilePicture:', error);
    throw error;
  }
};

// ... semua fungsi lainnya tetap sama ...

// Export tetap sama
export {
  checkWAVersion,
  getBuffer,
  fetchJson,
  fetchText,
  getGroupAdmins,
  runtime,
  removeEmojis,
  sleep,
  isUrl,
  getCase,
  kyun,
  h2k,
  FileSize,
  hitungUmur,
  generateMessageID,
  generateProfilePicture, // fungsi ini sudah diperbaiki
  jsonformat,
  formatDate,
  pickRandom,
  addCase,
  delCase,
  randomNomor,
  createExif,
  modStick
};
