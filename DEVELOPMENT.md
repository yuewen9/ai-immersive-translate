# Development Guide

## Project Structure

```
ai-immersive-translate/
├── src/
│   ├── background.ts         # Background script
│   ├── content.tsx           # Content script
│   ├── components/           # React components
│   │   ├── Popup.tsx        # Extension popup
│   │   └── Options.tsx      # Settings page
│   ├── core/                # Core modules
│   │   ├── translator/      # Translation engine
│   │   ├── extractor/       # Text extraction
│   │   ├── cache/           # Cache management
│   │   └── renderer/        # Bilingual renderer
│   ├── lib/                 # Utilities
│   │   ├── constants.ts     # Constants
│   │   └── utils.ts         # Helper functions
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── assets/              # Static assets
├── public/                  # Public files (icons)
├── plasmo.config.ts         # Plasmo configuration
└── package.json
```

## Development Workflow

### Running in Development Mode

```bash
npm run dev
```

This starts:
- Webpack in watch mode
- Auto-reload on file changes
- Development build with source maps

### Building for Production

```bash
npm run build
```

This creates:
- Optimized production build
- Minified JavaScript/CSS
- Ready for distribution

## Core Modules

### 1. Translation Engine (`core/translator/TranslationEngine.ts`)

Handles all API interactions with BigModel.

**Key methods:**
- `translate(text, options)` - Translate a single text
- `translateBatch(texts, options)` - Translate multiple texts
- `updateApiKey(key)` - Update the API key

**Adding a new translation provider:**

```typescript
// Extend TranslationEngine to support other APIs
async callOpenAI(text: string, options: TranslationOptions) {
  // Implementation for OpenAI API
}

async callGoogle(text: string, options: TranslationOptions) {
  // Implementation for Google Translate API
}
```

### 2. Text Extractor (`core/extractor/TextExtractor.ts`)

Extracts translatable text from web pages.

**Key methods:**
- `extractMainContent()` - Extract all translatable text
- `extractSelectedText()` - Get user-selected text
- `shouldExclude(element)` - Check if element should be excluded

**Customizing extraction rules:**

Edit `lib/constants.ts` to modify `EXCLUDED_SELECTORS`:

```typescript
export const EXCLUDED_SELECTORS = [
  'script',
  'style',
  // Add your custom selectors
  '.your-custom-class',
];
```

### 3. Cache Manager (`core/cache/CacheManager.ts`)

Manages translation cache to reduce API calls.

**Key methods:**
- `get(text, from, to)` - Get cached translation
- `set(text, from, to, result)` - Cache a translation
- `clear()` - Clear all cache
- `cleanExpired()` - Remove expired entries

### 4. Bilingual Renderer (`core/renderer/BilingualRenderer.ts`)

Renders translations on the page.

**Key methods:**
- `renderTranslation(unit, translatedText)` - Render a translation
- `injectStyles()` - Inject CSS styles
- `clearAll()` - Remove all translations

**Adding a new render mode:**

```typescript
private renderYourCustomMode(element, original, translation) {
  // Your custom rendering logic
}
```

## Adding New Features

### 1. Adding a New Translation Provider

1. Update `types/index.ts` to add the provider:
```typescript
export interface ExtensionConfig {
  api: {
    provider: 'bigmodel' | 'openai' | 'google' | 'your-provider';
    // ...
  };
}
```

2. Add API integration in `TranslationEngine.ts`
3. Update UI in `Options.tsx` to allow selection

### 2. Adding New Language Support

Edit `lib/constants.ts`:

```typescript
export const SUPPORTED_LANGUAGES: Language[] = [
  // Add your language
  { code: 'xx', name: 'Your Language', nativeName: 'Native Name' },
];
```

### 3. Adding UI Components

1. Create component in `src/components/`
2. Import and use in `Popup.tsx` or `Options.tsx`
3. Add styles in `src/style.css`

### 4. Adding Keyboard Shortcuts

1. Update `manifest` in `plasmo.config.ts`:
```typescript
manifest: {
  commands: {
    'translate-page': {
      suggested_key: {
        default: 'Ctrl+Shift+T',
        mac: 'Command+Shift+T'
      },
      description: 'Translate current page'
    }
  }
}
```

2. Handle the command in `background.ts`:
```typescript
chrome.commands.onCommand.addListener((command) => {
  if (command === 'translate-page') {
    // Handle translation
  }
});
```

## Testing

### Manual Testing

1. Load the extension in development mode
2. Visit various websites
3. Test different scenarios:
   - Translation accuracy
   - Different display modes
   - Cache functionality
   - Settings persistence

### Debugging

1. **Popup/Options**: Right-click → Inspect
2. **Content Script**: Open browser DevTools on any page
3. **Background Script**: Go to `chrome://extensions/` → Click "Service worker" link

## Code Style

- Use TypeScript for type safety
- Follow React best practices
- Keep functions small and focused
- Add JSDoc comments for public APIs
- Use `const` and `let`, avoid `var`

## Performance Optimization

1. **Reduce API calls**: Use cache effectively
2. **Batch translations**: Process multiple texts at once
3. **Lazy loading**: Only translate visible content
4. **Debounce user input**: Avoid excessive requests

## Publishing

### Pre-publish Checklist

- [ ] Update version in `package.json`
- [ ] Test on multiple browsers
- [ ] Verify all icons are present
- [ ] Test with different screen sizes
- [ ] Check for console errors
- [ ] Update documentation
- [ ] Test API key handling

### Submit to Stores

**Chrome Web Store:**
1. Create zip: `npm run package`
2. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Fill in store listing details
4. Submit for review

**Firefox Add-ons:**
1. Create zip: `npm run package`
2. Upload to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/en-US/developers/)
3. Fill in listing details
4. Submit for review

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Getting Help

- Check existing [Issues](https://github.com/yourusername/ai-immersive-translate/issues)
- Read [Plasmo documentation](https://docs.plasmo.com/)
- Review [Chrome Extension docs](https://developer.chrome.com/docs/extensions/)
