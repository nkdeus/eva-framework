# EVA CSS - JSON Configuration Example

This example demonstrates using EVA CSS with a **centralized JSON configuration file** (`eva.config.cjs`).

## Configuration Method: JSON Config

Configuration is defined in a separate `eva.config.cjs` file at the project root, which is loaded by a custom build script before SCSS compilation.

**Requires a custom build script** but provides better organization for larger projects.

## Quick Start

```bash
# Install dependencies
npm install

# Validate configuration (optional but recommended)
npm run validate

# Build CSS once
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Build and open in browser
npm run dev
```

## Project Structure

```
json-config/
├── eva.config.cjs          ← Configuration file (shared across all SCSS)
├── package.json
├── scripts/
│   └── build-with-config.js ← Custom build script
├── index.html              ← Demo page
├── styles/
│   └── main.scss           ← Clean SCSS (no inline config)
└── dist/
    └── main.css            ← Generated CSS (after build)
```

## Configuration

All configuration is in `eva.config.cjs` at the project root:

```javascript
// eva.config.cjs
module.exports = {
  // Design sizes
  sizes: [4, 8, 16, 32, 64, 128],

  // Font sizes
  fontSizes: [14, 16, 20, 24, 32, 48],

  // Generate utility classes
  buildClass: true,

  // Show config during build
  debug: true,

  // Theme configuration
  theme: {
    name: 'demo',
    colors: {
      brand: '#6366f1',
      accent: '#f43f5e',
      extra: '#f59e0b'
    }
  }
};
```

Your SCSS files stay clean:

```scss
// styles/main.scss
@use 'eva-css-fluid';  // Config automatically loaded!

.hero {
  padding: var(--32);
  background: var(--brand);
}
```

## How It Works

1. **Build script reads** `eva.config.cjs`
2. **Converts JSON** to SCSS variables
3. **Injects variables** into your SCSS
4. **Compiles** with Sass to generate CSS

```
eva.config.cjs → build-with-config.js → SCSS + Config → Sass → CSS
```

## Available Commands

### Validate Configuration

Check your configuration for errors before building:

```bash
npm run validate
```

Example output:

```
✅ Configuration is valid

📋 Configuration Summary:
  - Sizes: 4, 8, 16, 32, 64, 128 (6 values)
  - Font sizes: 14, 16, 20, 24, 32, 48 (6 values)
  - Build class: true
  - Theme: demo
```

### Build CSS

```bash
# Build once
npm run build

# Builds: styles/main.scss → dist/main.css
```

### Watch Mode

Automatically rebuild when files change:

```bash
npm run watch
```

Watches:
- `styles/*.scss` - Any SCSS file changes
- `eva.config.cjs` - Configuration changes

### Development Server

```bash
npm run dev
```

Builds CSS and opens `index.html` in your browser at `http://localhost:8001`.

## Customizing

### Change Design Sizes

Edit `eva.config.cjs`:

```javascript
module.exports = {
  sizes: [10, 20, 40, 80, 160],  // ← Your custom sizes
  fontSizes: [12, 16, 24, 36]    // ← Your font sizes
};
```

Save and rebuild (or use watch mode for automatic rebuild).

New utility classes will be generated:
- `.w-10`, `.p-10`, `.m-10`
- `.w-20`, `.p-20`, `.m-20`
- `.fs-12`, `.fs-16`, `.fs-24`
- etc.

### Change Theme Colors

```javascript
module.exports = {
  theme: {
    name: 'myapp',
    colors: {
      brand: '#your-primary-color',
      accent: '#your-accent-color',
      extra: '#your-extra-color'
    }
  }
};
```

Update HTML to use the new theme:

```html
<body class="current-theme theme-myapp">
  <h1 class="_c-brand">Hello!</h1>
</body>
```

### Variables Only Mode

Disable utility classes to reduce CSS file size:

```javascript
module.exports = {
  sizes: [4, 8, 16, 32, 64],
  buildClass: false  // ← No utility classes
};
```

You can still use variables like `var(--16)`, `var(--32)` in your CSS.

### Enable Purge (Production)

Reduce CSS file size by 60-90% by removing unused classes:

```javascript
module.exports = {
  sizes: [4, 8, 16, 32, 64],

  purge: {
    enabled: true,
    content: ['*.html', 'src/**/*.{js,jsx,tsx,vue}'],
    css: 'dist/main.css',
    output: 'dist/main-purged.css',
    safelist: ['theme-', 'current-', 'toggle-']
  }
};
```

Build and check the file sizes:

```bash
npm run build
ls -lh dist/main.css         # Full CSS
ls -lh dist/main-purged.css  # Purged (much smaller)
```

## Multiple SCSS Files

The main advantage of JSON config is sharing configuration across multiple SCSS files.

**Add new SCSS file:**

```scss
// styles/components.scss
@use 'eva-css-fluid';  // Same config as main.scss!

.card {
  padding: var(--16);
  gap: var(--8);
}
```

**Add build script in `package.json`:**

```json
{
  "scripts": {
    "build": "npm run build:main && npm run build:components",
    "build:main": "node scripts/build-with-config.js styles/main.scss dist/main.css",
    "build:components": "node scripts/build-with-config.js styles/components.scss dist/components.css"
  }
}
```

Both files will use the same configuration from `eva.config.cjs`!

## When to Use This Pattern

✅ **Perfect for:**
- Multiple SCSS files sharing config
- Team collaboration (JSON is universal)
- Production projects
- Need configuration validation
- Design system management
- Build pipeline integration

⚠️ **Not ideal for:**
- Simple projects (1 SCSS file) - Use SCSS variables instead
- Quick prototyping - Use SCSS variables for faster setup
- Learning EVA CSS - Start with SCSS variables

## Comparison with SCSS Variables

| Feature | This Example (JSON) | SCSS Variables |
|---------|-------------------|----------------|
| **Setup** | 10 minutes (script needed) | 2 minutes |
| **Config location** | `eva.config.cjs` | Inside SCSS file |
| **Build command** | Custom script | `npx sass` |
| **Multiple files** | ✅ Shared config | ⚠️ Duplicate config |
| **Validation** | ✅ `npx eva-css validate` | ❌ No |
| **Watch mode** | `nodemon` required | Native Sass watch |

**Both generate identical CSS!** Choose based on your project needs.

## Troubleshooting

### Config not being applied

1. Check `eva.config.cjs` is in project root (not in a subdirectory)
2. Verify file exports correctly: `module.exports = {...}`
3. Run `npm run validate` to check for errors
4. Enable debug mode in config: `debug: true`

### Build script not found

```bash
# Verify script exists
ls scripts/build-with-config.js

# Copy from template if missing
cp ../../user-scripts/build-with-config.js scripts/
```

### CSS not updating

```bash
# Clear dist and rebuild
rm -rf dist/
npm run build

# Or use watch mode
npm run watch
```

### SCSS import not found

```bash
# Verify eva-css-fluid is installed
npm ls eva-css-fluid

# Reinstall if needed
npm install
```

### Watch mode not working

```bash
# Install nodemon if missing
npm install --save-dev nodemon

# Verify package.json watch script
npm run watch
```

## Next Steps

- **Edit `eva.config.cjs`** to customize sizes and colors
- **Run `npm run watch`** for automatic rebuilds
- **Try the Simple SCSS example** → `../simple-scss/`
- **Read the JSON Config Guide** → `../../packages/eva-css/docs/JSON-CONFIG.md`
- **Compare workflows** → `../../packages/eva-css/docs/WORKFLOWS.md`

## Migration

### From SCSS Variables to JSON Config

If you have an existing project using SCSS variables:

1. Create `eva.config.cjs` with your current settings
2. Copy the build script from `../../user-scripts/build-with-config.js`
3. Update SCSS from `@use ... with ()` to `@use 'eva-css-fluid'`
4. Update package.json scripts
5. Rebuild

The generated CSS will be identical!

### From JSON Config to SCSS Variables

To simplify your setup:

1. Copy config values from `eva.config.cjs` to SCSS
2. Update SCSS to use `@use ... with ()`
3. Update package.json to use `npx sass`
4. Delete `eva.config.cjs` and build script

The generated CSS will be identical!

## License

MIT - Same as EVA CSS framework
