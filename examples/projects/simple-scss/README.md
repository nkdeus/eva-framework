# EVA CSS - Simple SCSS Example

This example demonstrates the simplest way to use EVA CSS with **SCSS variables**.

## Configuration Method: SCSS Variables

All configuration is defined inline in the SCSS file using `@use ... with ()` syntax.

**No build script needed!** Works with standard Sass compilation.

## Quick Start

```bash
# Install dependencies
npm install

# Build CSS once
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Build and open in browser
npm run dev
```

## Project Structure

```
simple-scss/
├── package.json
├── index.html            ← Demo page
├── styles/
│   └── main.scss         ← SCSS with EVA config
└── dist/
    └── main.css          ← Generated CSS (after build)
```

## Configuration

All configuration is in `styles/main.scss`:

```scss
@use 'eva-css-fluid' with (
  // Your design sizes
  $sizes: 4, 8, 16, 32, 64, 128,

  // Your font sizes
  $font-sizes: 14, 16, 20, 24, 32, 48,

  // Generate utility classes
  $build-class: true,

  // Show config during build
  $debug: true
);
```

## How It Works

1. **Edit** `styles/main.scss` to change configuration or add custom styles
2. **Run** `npm run build` to compile SCSS to CSS
3. **Open** `index.html` in your browser to see results

### Watch Mode

```bash
npm run watch
```

Automatically rebuilds CSS when you modify `styles/main.scss`.

## Customizing

### Change Design Sizes

Edit the `$sizes` parameter in `styles/main.scss`:

```scss
@use 'eva-css-fluid' with (
  $sizes: 10, 20, 40, 80, 160  // ← Your custom sizes
);
```

Rebuild and see new utility classes:
- `.w-10`, `.p-10`, `.m-10`
- `.w-20`, `.p-20`, `.m-20`
- etc.

### Change Font Sizes

```scss
@use 'eva-css-fluid' with (
  $font-sizes: 12, 16, 24, 36  // ← Your custom font sizes
);
```

New classes:
- `.fs-12`, `.fs-16`, `.fs-24`, `.fs-36`

### Variables Only Mode

Disable utility classes if you only want CSS variables:

```scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64,
  $build-class: false  // ← No utility classes
);
```

You can still use variables like `var(--16)`, `var(--32)` in your CSS.

## When to Use This Pattern

✅ **Perfect for:**
- Learning EVA CSS
- Simple projects (1-2 SCSS files)
- Quick prototyping
- No build pipeline needed
- Standard Sass workflow

⚠️ **Not ideal for:**
- Multiple SCSS files (config duplication)
- Large teams (prefer JSON config)
- Advanced build pipelines (consider JSON config)

## Next Steps

- **Try the JSON Config example** → `../json-config/`
- **Read the docs** → `../../packages/eva-css/README.md`
- **Compare workflows** → `../../packages/eva-css/docs/WORKFLOWS.md`

## Troubleshooting

### CSS not building

```bash
# Verify dependencies installed
npm install

# Check Sass is working
npx sass --version
```

### Changes not reflected

```bash
# Clear dist folder and rebuild
rm -rf dist/
npm run build
```

### Can't open in browser

```bash
# Install http-server if missing
npm install

# Or open manually
open index.html
```

## License

MIT - Same as EVA CSS framework
