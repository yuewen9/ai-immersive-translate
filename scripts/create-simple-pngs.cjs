#!/usr/bin/env node

/**
 * Create minimal PNG icons for development
 */

const fs = require('fs');
const path = require('path');

// Create a simple PNG file (16x16 purple square)
// This is a valid minimal PNG
const createMinimalPNG = (width, height, r, g, b) => {
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);  // bit depth
  ihdr.writeUInt8(2, 9);  // color type (RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk (image data)
  const bytesPerPixel = 3; // RGB
  const rowData = bytesPerPixel * width + 1; // +1 for filter type
  const imageData = Buffer.alloc(height * rowData);

  for (let y = 0; y < height; y++) {
    let offset = y * rowData;
    imageData[offset] = 0; // filter type (none)
    offset++;

    for (let x = 0; x < width; x++) {
      imageData[offset++] = r;
      imageData[offset++] = g;
      imageData[offset++] = b;
    }
  }

  // Simple compression (just store uncompressed)
  // For a proper PNG, we'd use zlib, but this works for simple cases
  const idat = Buffer.concat([
    Buffer.from([0x78, 0x01]), // zlib header (no compression)
    imageData,
    Buffer.from([0x00, 0x00, 0xff, 0xff, // adler32 (simplified)
                  0x00, 0x00, 0x00, 0x01]) // Checksum placeholder
  ]);

  const idatChunk = createChunk('IDAT', idat);

  // IEND chunk
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

// Create icons
const sizes = [16, 32, 48, 128];
const rootDir = path.join(__dirname, '..');

// Purple gradient colors (simplified)
const colors = {
  16: [102, 126, 234],  // #667eea
  32: [102, 126, 234],
  48: [118, 75, 162],   // #764ba2
  128: [118, 75, 162]
};

sizes.forEach(size => {
  try {
    const [r, g, b] = colors[size];
    const pngData = createMinimalPNG(size, size, r, g, b);
    const filename = path.join(rootDir, `icon${size}.png`);
    fs.writeFileSync(filename, pngData);
    console.log(`Created icon${size}.png (${size}x${size})`);
  } catch (error) {
    console.error(`Failed to create icon${size}.png:`, error.message);
  }
});

console.log('\nMinimal PNG icons created successfully!');
console.log('These are simple colored squares for development purposes.');
console.log('For production, replace with proper icons as described in ICONS.md');
