import sharp from "sharp";
import { stat, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ASSETS = resolve(process.cwd(), "src/assets");
const PUBLIC = resolve(process.cwd(), "public");

const targets = [
  { file: `${ASSETS}/background.png`, kind: "png", maxWidth: 1920 },
  { file: `${ASSETS}/texture.png`, kind: "png", maxWidth: 1024 },
  { file: `${ASSETS}/hero-bg.png`, kind: "png", maxWidth: 1920 },
  { file: `${ASSETS}/logibb (1).png`, kind: "png", maxWidth: 512 },
  { file: `${ASSETS}/olimpiedas_logo-removebg-preview.png`, kind: "png", maxWidth: 512 },
  { file: `${ASSETS}/galery/kids.png`, kind: "png", maxWidth: 1280 },
  { file: `${ASSETS}/galery/Corrida.jpg`, kind: "jpg", maxWidth: 1280 },
  { file: `${ASSETS}/galery/Natacao.jpeg`, kind: "jpg", maxWidth: 1280 },
  { file: `${ASSETS}/galery/queimada.jpeg`, kind: "jpg", maxWidth: 1280 },
  { file: `${ASSETS}/galery/volei.jpeg`, kind: "jpg", maxWidth: 1280 },
  { file: `${PUBLIC}/favicon.png`, kind: "png", maxWidth: 256 },
];

function fmt(bytes) {
  const u = ["B", "KB", "MB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${u[i]}`;
}

for (const t of targets) {
  try {
    const input = await readFile(t.file);
    const before = input.length;
    const meta = await sharp(input).metadata();
    const width = meta.width && meta.width > t.maxWidth ? t.maxWidth : meta.width;

    let pipeline = sharp(input);
    if (width !== meta.width) {
      pipeline = pipeline.resize({ width, withoutEnlargement: true });
    }

    let buffer;
    if (t.kind === "png") {
      buffer = await pipeline
        .png({ compressionLevel: 9, palette: true, quality: 80, effort: 10 })
        .toBuffer();
    } else {
      buffer = await pipeline
        .jpeg({ quality: 78, mozjpeg: true, progressive: true })
        .toBuffer();
    }

    if (buffer.length < before) {
      await writeFile(t.file, buffer);
      const pct = (((before - buffer.length) / before) * 100).toFixed(1);
      console.log(`✓ ${t.file}: ${fmt(before)} → ${fmt(buffer.length)} (-${pct}%)`);
    } else {
      console.log(`= ${t.file}: já otimizado (${fmt(before)})`);
    }
  } catch (err) {
    console.error(`✗ ${t.file}: ${err.message}`);
  }
}
