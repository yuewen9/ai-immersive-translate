# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Load Extension in Browser

#### Chrome/Edge/Brave:
1. Open `chrome://extensions/` (or `edge://extensions/` for Edge)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `build/chrome-mv3-dev` folder

#### Firefox:
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `build/firefox-mv2-dev/manifest.json`

### Step 4: Get Your API Key

1. Visit [BigModel](https://open.bigmodel.cn/)
2. Register and get your API key
3. Open the extension settings
4. Paste your API key

### Step 5: Start Translating!

Visit any webpage and click the extension icon to translate!

---

## 📁 Project Structure

```
src/
├── background.ts      # Background script
├── content.tsx        # Content script (page translation)
├── components/
│   ├── Popup.tsx     # Extension popup UI
│   └── Options.tsx   # Settings page UI
├── core/
│   ├── translator/   # BigModel API integration
│   ├── extractor/    # Text extraction
│   ├── cache/        # Cache management
│   └── renderer/     # Bilingual rendering
├── lib/
│   ├── constants.ts  # Configuration constants
│   └── utils.ts      # Utility functions
└── types/
    └── index.ts      # TypeScript types
```

## 🎯 Key Features

- ✅ **Bilingual Display**: Side-by-side or hover translation
- ✅ **Smart Caching**: Reduces API calls
- ✅ **Privacy First**: Uses your own API key
- ✅ **12+ Languages**: Support for major world languages
- ✅ **Customizable**: Font size, colors, display modes

## 🛠️ Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run package      # Create distribution package
npm run dev:chrome   # Dev mode for Chrome
npm run dev:firefox  # Dev mode for Firefox
```

## 📝 Important Notes

1. **API Key**: You need a BigModel API key to use this extension
2. **API Costs**: BigModel charges per character, check their pricing
3. **Cache**: Translations are cached to reduce costs
4. **Icons**: Current icons are simple placeholders, replace before production

## 🐛 Troubleshooting

**Extension not loading?**
- Make sure "Developer mode" is enabled
- Check you selected the correct build folder
- Look at browser console for errors

**Translation not working?**
- Verify API key is correct
- Check browser console for API errors
- Ensure you have API credits

**Build errors?**
```bash
rm -rf node_modules build
npm install
npm run dev
```

## 📚 More Documentation

- `README.md` - Project overview
- `INSTALL.md` - Detailed installation guide
- `DEVELOPMENT.md` - Development guide
- `ICONS.md` - How to create production icons

## 🎉 You're Ready!

Start translating websites with AI-powered bilingual reading experience!

---

**Version**: 0.0.1
**License**: MIT
**GitHub**: [Your Repository URL]
