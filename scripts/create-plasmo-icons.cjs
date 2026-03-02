#!/usr/bin/env node

/**
 * Create Plasmo-compatible icon files
 */

const fs = require('fs');
const path = require('path');

// Create a simple PNG file (16x16 purple square)
const createMinimalPNG = (width, height, r, g, b) => {
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(2, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk
  const bytesPerPixel = 3;
  const rowData = bytesPerPixel * width + 1;
  const imageData = Buffer.alloc(height * rowData);

  for (let y = 0; y < height; y++) {
    let offset = y * rowData;
    imageData[offset] = 0;
    offset++;

    for (let x = 0; x < width; x++) {
      imageData[offset++] = r;
      imageData[offset++] = g;
      imageData[offset++] = b;
    }
  }

  const idat = Buffer.concat([
    Buffer.from([0x78, 0x01]),
    imageData,
    Buffer.from([0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x00, 0x01])
  ]);

  const idatChunk = createChunk('IDAT', idat);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([PNG_SIGNATURE, ihdrChunk, idatChunk, iendChunk]);
};

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = calculateCRC(Buffer.concat([typeBuffer, data]));

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function calculateCRC(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Create icons in both locations
const sizes = [16, 32, 48, 64, 128];
const colors = {
  16: [102, 126, 234],
  32: [102, 126, 234],
  48: [118, 75, 162],
  64: [118, 75, 162],
  128: [118, 75, 162]
};

// Create in project root
const rootDir = path.join(__dirname, '..');
// Create in .plasmo/gen-assets
const plasmoDir = path.join(__dirname, '../.plasmo/gen-assets');

// Ensure directories exist
if (!fs.existsSync(plasmoDir)) {
  fs.mkdirSync(plasmoDir, { recursive: true });
}

// Create icons for both locations
sizes.forEach(size => {
  try {
    const [r, g, b] = colors[size];
    const pngData = createMinimalPNG(size, size, r, g, b);

    // Save in project root (icon{size}.png)
    const rootFilename = path.join(rootDir, `icon${size}.png`);
    fs.writeFileSync(rootFilename, pngData);

    // Save in .plasmo/gen-assets (icon{size}.plasmo.png)
    const plasmoFilename = path.join(plasmoDir, `icon${size}.plasmo.png`);
    fs.writeFileSync(plasmoFilename, pngData);

    console.log(`Created icon${size}.png and icon${size}.plasmo.png (${size}x${size})`);
  } catch (error) {
    console.error(`Failed to create icon${size}.png:`, error.message);
  }
});

console.log('\n✅ Plasmo-compatible icons created successfully!');
