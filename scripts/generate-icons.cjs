#!/usr/bin/env node

/**
 * Simple icon generator for development
 * Creates colored PNG files as temporary icons
 */

const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const color = '#667eea'; // Primary brand color
const rootDir = path.join(__dirname, '..');

// Create simple SVG for each size
sizes.forEach(size => {
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${color}" rx="${size * 0.15}"/>
  <text x="50%" y="55%" font-size="${size * 0.5}" font-family="Arial" font-weight="bold"
        fill="white" text-anchor="middle" dominant-baseline="middle">🌐</text>
</svg>`;

  const filename = path.join(rootDir, `icon${size}.png`);

  // Note: This creates SVG files renamed as .png
  // For actual PNG files, use ImageMagick or an online converter
  fs.writeFileSync(filename.replace('.png', '.svg'), svg.trim());

  console.log(`Created icon${size}.svg (rename to .png or convert)`);
});

console.log('\nTo convert SVG files to PNG, use:');
console.log('1. Online: https://convertio.co/svg-png/');
console.log('2. ImageMagick: convert icon{size}.svg icon{size}.png');
console.log('3. Or follow ICONS.md for detailed instructions');
