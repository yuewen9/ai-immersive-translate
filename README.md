# AI Immersive Translate

A free, AI-powered bilingual web page translation extension supporting BigModel API.

## Features

- **Bilingual Display**: Show original and translated text side by side
- **Smart Translation**: Paragraph-level translation with context awareness
- **Hover Translation**: Mouse hover to see translations
- **Multiple AI Models**: Support for BigModel API (GLM-4)
- **Privacy First**: All translations happen locally with your own API key
- **Cache System**: Reduce API calls with intelligent caching

## Installation

### Development

1. Clone this repository
```bash
git clone https://github.com/yourusername/ai-immersive-translate.git
cd ai-immersive-translate
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Load the extension in your browser
- Chrome: Go to `chrome://extensions`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `build/chrome-mv3-dev` folder

### Production Build

```bash
npm run build
```

## Usage

1. Click the extension icon in your browser
2. Enter your BigModel API Key in settings
3. Choose your target language
4. Click "Translate this page"
5. Enjoy bilingual reading experience!

## Configuration

### API Key Setup

1. Get your API key from [BigModel](https://open.bigmodel.cn/)
2. Open extension settings
3. Paste your API key
4. Save and start translating

### Translation Settings

- **Source Language**: Auto-detect or specific language
- **Target Language**: Choose from 50+ languages
- **Display Mode**: Side-by-side, top-bottom, or hover
- **Font Size**: Adjust translation text size

## Project Structure

```
src/
├── background/         # Background scripts
├── components/         # React components
│   ├── Popup.tsx      # Extension popup
│   └── Options.tsx    # Settings page
├── content/           # Content scripts
│   └── translator.tsx # Page translation logic
├── core/              # Core modules
│   ├── translator/    # Translation engine
│   ├── extractor/     # Text extraction
│   ├── cache/         # Cache management
│   └── renderer/      # Bilingual renderer
├── lib/               # Utilities
└── types/             # TypeScript types
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by [Immersive Translate](https://immersivetranslate.com/)
- Built with [Plasmo Framework](https://plasmo.com/)
- Powered by [BigModel API](https://open.bigmodel.cn/)

## Roadmap

- [ ] Support for more AI models (OpenAI, Google Translate)
- [ ] Input box translation
- [ ] PDF translation
- [ ] Vocabulary builder
- [ ] Collaborative translation memory
