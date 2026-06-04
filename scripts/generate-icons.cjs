// Resizes public/logo.JPG into the two PWA icon sizes required by the manifest.
const sharp = require('sharp');
const path  = require('path');

const SRC     = path.join(__dirname, '..', 'public', 'logo.JPG');
const OUT_DIR = path.join(__dirname, '..', 'public');

async function generate(size, filename) {
  await sharp(SRC)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(path.join(OUT_DIR, filename));
  console.log(`✓ ${filename} (${size}×${size})`);
}

(async () => {
  await generate(192, 'icon-192.png');
  await generate(512, 'icon-512.png');
})();
