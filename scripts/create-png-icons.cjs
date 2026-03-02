#!/usr/bin/env node

/**
 * Create simple PNG icons as base64 data
 */

const fs = require('fs');
const path = require('path');

// Simple 1x1 colored PNG as base64 (will be scaled by browser)
const createPNG = (color) => {
  // This is a minimal valid PNG file (1x1 pixel)
  // We'll use a simple gradient-like color
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR type
    0x00, 0x00, 0x00, 0x10, // width (16 for icon16)
    0x00, 0x00, 0x00, 0x10, // height (16 for icon16)
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x3D, 0x8A, 0xC7, 0x41, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT type
    0x28, 0x15, 0x63, 0x60, 0x18, 0x05, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // image data (purple)
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND type
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);

  return pngData;
};

// Generate actual SVG files that can be used as icons
const sizes = [16, 32, 48, 128];
const rootDir = path.join(__dirname, '..');

sizes.forEach(size => {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad${size})" rx="${size * 0.15}"/>
  <text x="50%" y="50%" font-size="${size * 0.45}" font-family="Arial, sans-serif" font-weight="bold"
        fill="white" text-anchor="middle" dominant-baseline="middle">🌐</text>
</svg>`;

  fs.writeFileSync(path.join(rootDir, `icon${size}.svg`), svgContent);
  console.log(`Created icon${size}.svg`);
});

console.log('\nNote: These are SVG files with .svg extension.');
console.log('For production, convert them to PNG using the methods described in ICONS.md');
console.log('\nQuick fix: You can use these SVG files as icons during development.');
