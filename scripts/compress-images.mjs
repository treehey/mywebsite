import sharp from "sharp";
import { readdir, stat, writeFile, rename } from "fs/promises";
import { join, extname, basename } from "path";

const IMAGES_DIR = "./public/images";
// Max width for any image (it's a portfolio site, screens are max 1920px)
const MAX_WIDTH = 1920;
// Quality settings
const JPEG_QUALITY = 80;
const PNG_QUALITY  = 80;
const WEBP_QUALITY = 75;

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...await getFiles(full));
    else files.push(full);
  }
  return files;
}

const files = await getFiles(IMAGES_DIR);
const targets = files.filter(f => /\.(jpe?g|png|jfif)$/i.test(f));

let savedTotal = 0;

for (const file of targets) {
  const ext = extname(file).toLowerCase();
  const before = (await stat(file)).size;

  try {
    const img = sharp(file);
    const meta = await img.metadata();

    // Resize only if wider than MAX_WIDTH
    if (meta.width > MAX_WIDTH) {
      img.resize(MAX_WIDTH);
    }

    let buf;
    if (ext === ".png") {
      buf = await img.png({ quality: PNG_QUALITY, compressionLevel: 9 }).toBuffer();
    } else {
      // jpg / jfif / jpeg
      buf = await img.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    }

    const after = buf.length;
    const saved = before - after;
    savedTotal += saved;

    if (saved > 0) {
      // Write to temp then replace
      const tmp = file + ".tmp";
      await writeFile(tmp, buf);
      await rename(tmp, file);
      console.log(`✓ ${basename(file).padEnd(40)} ${(before/1024).toFixed(0).padStart(6)} KB → ${(after/1024).toFixed(0).padStart(6)} KB  (-${(saved/1024).toFixed(0)} KB)`);
    } else {
      console.log(`  ${basename(file).padEnd(40)} already optimal`);
    }
  } catch (e) {
    console.error(`✗ ${basename(file)}: ${e.message}`);
  }
}

console.log(`\nTotal saved: ${(savedTotal / 1024 / 1024).toFixed(1)} MB`);
