// Generates public/icon-192.png and public/icon-512.png without any external deps.
// Uses raw PNG binary construction + Node's built-in zlib for deflate.
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// CRC-32 used by PNG chunks
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t   = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

// Creates a solid-colour RGBA PNG (bg) with an inner circle in a different colour (fg).
function createIcon(size) {
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  // Pixel data: dark slate bg (#0f172a), emerald circle (#10b981)
  const cx = size / 2, cy = size / 2, r = size * 0.42;
  const ri = size * 0.30; // inner ring for football visual
  const rowLen = 1 + size * 4;
  const raw = Buffer.alloc(size * rowLen, 0);

  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filter byte: None
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy, dist = Math.sqrt(dx * dx + dy * dy);
      const off = y * rowLen + 1 + x * 4;

      if (dist <= r) {
        // Emerald circle
        raw[off]     = 16;  // R
        raw[off + 1] = 185; // G
        raw[off + 2] = 129; // B
        raw[off + 3] = 255;
        if (dist <= ri) {
          // Inner dark centre with "S" silhouette — use a lighter slate
          raw[off]     = 30;
          raw[off + 1] = 41;
          raw[off + 2] = 59;
          raw[off + 3] = 255;
        }
      } else {
        // Background: slate-900 #0f172a
        raw[off]     = 15;
        raw[off + 1] = 23;
        raw[off + 2] = 42;
        raw[off + 3] = 255;
      }
    }
  }

  const idat = zlib.deflateSync(raw);

  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const publicDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createIcon(512));

console.log('✓ Generated public/icon-192.png (192×192)');
console.log('✓ Generated public/icon-512.png (512×512)');
