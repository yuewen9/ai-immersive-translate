# Installation Guide

## Development Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Chrome, Firefox, or Edge browser

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-immersive-translate.git
cd ai-immersive-translate
```

2. **Install dependencies**
```bash
npm install
```

3. **Generate icons** (if not done yet)
Follow the instructions in `ICONS.md` to create the required icon files.

4. **Start development server**
```bash
npm run dev
```

This will build the extension in development mode and watch for changes.

5. **Load in browser**

#### Chrome/Edge/Brave:
1. Open `chrome://extensions/` (or `edge://extensions/` for Edge)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `build/chrome-mv3-dev` folder

#### Firefox:
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `build/firefox-mv2-dev/manifest.json` file

6. **Configure the extension**
1. Click the extension icon in your browser toolbar
2. Click "Settings" or open the options page
3. Enter your BigModel API key
4. Choose your preferred languages
5. Start translating!

## Production Build

1. **Build for production**
```bash
npm run build
```

2. **Package the extension**
```bash
npm run package
```

This will create a zip file ready for submission to the Chrome Web Store or Firefox Add-ons.

## Getting Your API Key

1. Visit [BigModel](https://open.bigmodel.cn/)
2. Register for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste it into the extension settings

## Troubleshooting

### Extension not loading
- Make sure you've enabled "Developer mode"
- Check that you selected the correct build folder
- Verify all icon files exist in the project root

### Translations not working
- Verify your API key is correct
- Check browser console for errors
- Ensure you have sufficient API credits

### Build errors
- Delete `node_modules` and run `npm install` again
- Clear the build directory: `rm -rf build`
- Make sure you're using Node.js 18 or higher

## Development Tips

- Hot reload is enabled for faster development
- Changes to React components will automatically refresh
- Background scripts require manual extension reload
- Check the console for debug logs and errors

## Next Steps

Once installed, visit any webpage and click the extension icon to start translating!
