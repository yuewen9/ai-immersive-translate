# Icon Generation Guide

This extension needs icon files in multiple sizes. Follow these steps to create them:

## Using the SVG File

1. **Open the SVG file**: `src/assets/icon.svg` in a browser or design tool

2. **Convert to PNG**: Use any of these methods:
   - Online: https://convertio.co/svg-png/
   - Online: https://cloudconvert.com/svg-to-png
   - Design tools: Figma, Sketch, Adobe Illustrator

3. **Required sizes**: Create PNG files in these dimensions:
   - `icon16.png` - 16x16 pixels
   - `icon32.png` - 32x32 pixels
   - `icon48.png` - 48x48 pixels
   - `icon128.png` - 128x128 pixels

4. **Placement**: Put all PNG files in the project root directory

## Quick Method with ImageMagick

If you have ImageMagick installed:

```bash
# Install ImageMagick (if not installed)
# Ubuntu/Debian: sudo apt-get install imagemagick
# macOS: brew install imagemagick
# Windows: Download from https://imagemagick.org/

# Generate all icon sizes
convert src/assets/icon.svg -resize 16x16 icon16.png
convert src/assets/icon.svg -resize 32x32 icon32.png
convert src/assets/icon.svg -resize 48x48 icon48.png
convert src/assets/icon.svg -resize 128x128 icon128.png
```

## Using Figma (Free)

1. Create a new Figma project
2. Import the SVG file
3. Create frames for each size (16x16, 32x32, 48x48, 128x128)
4. Export as PNG

## Temporary Icons

For development, you can use simple colored squares:

```bash
# Create simple colored squares as temporary icons
convert -size 16x16 xc:#667eea icon16.png
convert -size 32x32 xc:#667eea icon32.png
convert -size 48x48 xc:#667eea icon48.png
convert -size 128x128 xc:#667eea icon128.png
```

## After Creating Icons

Once you have the PNG files, place them in the root directory:
```
ai-immersive-translate/
├── icon16.png
├── icon32.png
├── icon48.png
├── icon128.png
└── ...
```

The extension will use these icons for the browser toolbar, extension management page, and other locations.
