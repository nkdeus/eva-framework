# EVA CSS Examples

Complete, working examples showing different ways to use EVA CSS in your projects.

## Available Examples

### Quick Reference

| Example | Configuration Method | Complexity | Use Case |
|---------|---------------------|------------|----------|
| [Simple SCSS](#simple-scss-project) | SCSS Variables | ⭐ Easy | Learning, prototyping |
| [JSON Config](#json-config-project) | JSON File | ⭐⭐ Medium | Production, teams |
| [Monorepo](#monorepo-project) | JSON File (shared) | ⭐⭐⭐ Advanced | Large apps, design systems |

## Simple SCSS Project

**Location:** `examples/projects/simple-scss/`

### What This Example Shows

- Using SCSS variables (`@use ... with ()`)
- Standard Sass compilation
- Native watch mode
- Complete HTML demo

### Project Structure

```
simple-scss/
├── package.json
├── index.html
├── styles/
│   └── main.scss
└── dist/
    └── main.css
```

### Quick Start

```bash
cd examples/projects/simple-scss
npm install
npm run build    # Build CSS once
npm run watch    # Watch mode
npm run dev      # Open in browser
```

### Key Files

**styles/main.scss:**
```scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 128,
  $font-sizes: 14, 16, 20, 24, 32,
  $build-class: true
);

.hero {
  padding: var(--32);
  background: var(--brand);
}
```

**package.json:**
```json
{
  "scripts": {
    "build": "npx sass --load-path=node_modules styles/main.scss:dist/main.css",
    "watch": "npx sass --load-path=node_modules --watch styles/main.scss:dist/main.css"
  }
}
```

### When to Use This Pattern

✅ Simple projects (1-2 SCSS files)
✅ Learning EVA CSS
✅ Quick prototyping
✅ No build pipeline needed

## JSON Config Project

**Location:** `examples/projects/json-config/`

### What This Example Shows

- Using `eva.config.cjs` for configuration
- Custom build script with watch mode
- Config validation
- Multiple SCSS files sharing config
- Complete HTML demo

### Project Structure

```
json-config/
├── eva.config.cjs          ← Configuration file
├── package.json
├── scripts/
│   └── build-with-config.js ← Build script
├── index.html
├── styles/
│   ├── main.scss
│   ├── components.scss
│   └── utilities.scss
└── dist/
    ├── main.css
    ├── components.css
    └── utilities.css
```

### Quick Start

```bash
cd examples/projects/json-config
npm install
npm run validate  # Validate configuration
npm run build     # Build all CSS files
npm run watch     # Watch mode
npm run dev       # Open in browser
```

### Key Files

**eva.config.cjs:**
```javascript
module.exports = {
  sizes: [4, 8, 16, 32, 64, 128],
  fontSizes: [14, 16, 20, 24, 32],
  buildClass: true,
  debug: true,
  theme: {
    name: 'demo',
    colors: {
      brand: '#ff5733',
      accent: '#7300ff'
    }
  }
};
```

**styles/main.scss:**
```scss
@use 'eva-css-fluid';  // Config loaded from eva.config.cjs
```

**package.json:**
```json
{
  "scripts": {
    "validate": "npx eva-css validate",
    "build": "npm run build:main && npm run build:components",
    "build:main": "node scripts/build-with-config.js styles/main.scss dist/main.css",
    "build:components": "node scripts/build-with-config.js styles/components.scss dist/components.css",
    "watch": "nodemon --watch styles --watch eva.config.cjs --ext scss,cjs --exec 'npm run build'"
  }
}
```

### When to Use This Pattern

✅ Multiple SCSS files
✅ Team collaboration
✅ Production projects
✅ Need configuration validation

## Monorepo Project

**Location:** `examples/projects/monorepo/`

### What This Example Shows

- Shared EVA configuration across multiple apps
- Workspace setup with pnpm/npm workspaces
- Design system package
- Multiple apps consuming shared config
- Centralized design tokens

### Project Structure

```
monorepo/
├── package.json             ← Workspace root
├── eva.config.cjs           ← Shared EVA configuration
├── packages/
│   ├── design-system/       ← Shared design tokens & components
│   │   ├── package.json
│   │   ├── styles/
│   │   │   ├── tokens.scss
│   │   │   └── components.scss
│   │   └── dist/
│   │       └── design-system.css
│   │
│   ├── app-marketing/       ← Marketing site
│   │   ├── package.json
│   │   ├── index.html
│   │   └── styles/
│   │       └── main.scss
│   │
│   └── app-dashboard/       ← Dashboard app
│       ├── package.json
│       ├── index.html
│       └── styles/
│           └── main.scss
│
└── scripts/
    └── build-with-config.js  ← Shared build script
```

### Quick Start

```bash
cd examples/projects/monorepo
npm install           # Or pnpm install
npm run validate      # Validate shared config
npm run build         # Build all packages
npm run dev:marketing # Run marketing site
npm run dev:dashboard # Run dashboard app
```

### Key Files

**eva.config.cjs (root):**
```javascript
module.exports = {
  // Design system tokens shared across all apps
  sizes: [4, 8, 16, 32, 64, 128, 256],
  fontSizes: [12, 14, 16, 20, 24, 32, 48],
  buildClass: true,

  theme: {
    name: 'company',
    colors: {
      brand: '#0066cc',
      accent: '#ff6b35'
    }
  }
};
```

**packages/design-system/package.json:**
```json
{
  "name": "@company/design-system",
  "version": "1.0.0",
  "scripts": {
    "build": "node ../../scripts/build-with-config.js styles/tokens.scss dist/design-system.css"
  }
}
```

**packages/app-marketing/styles/main.scss:**
```scss
// Import shared design system
@use '@company/design-system';

// App-specific styles
.hero {
  padding: var(--64);
  background: var(--brand);
}
```

**package.json (root):**
```json
{
  "name": "company-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "validate": "npx eva-css validate",
    "build": "npm run build:design-system && npm run build:apps",
    "build:design-system": "npm run build --workspace=@company/design-system",
    "build:apps": "npm run build --workspaces --if-present",
    "dev:marketing": "npm run dev --workspace=@company/app-marketing",
    "dev:dashboard": "npm run dev --workspace=@company/app-dashboard"
  }
}
```

### When to Use This Pattern

✅ Large applications with multiple projects
✅ Design system shared across apps
✅ Team-based development
✅ Centralized design tokens

## Running the Examples

### Prerequisites

```bash
# Install Node.js (v16 or higher)
node --version

# Clone the EVA CSS repository
git clone https://github.com/nkdeus/eva.git
cd eva
```

### Simple SCSS Example

```bash
cd examples/projects/simple-scss
npm install

# Build once
npm run build

# Watch mode (rebuilds on file changes)
npm run watch

# View in browser
npm run dev
# Opens http://localhost:8000
```

**What you'll see:**
- Hero section with fluid padding and font sizes
- Cards with responsive spacing
- Theme switching (light/dark mode)

### JSON Config Example

```bash
cd examples/projects/json-config
npm install

# Validate configuration
npm run validate

# Build all CSS files
npm run build

# Watch mode
npm run watch

# View in browser
npm run dev
```

**What you'll see:**
- Same UI as Simple SCSS example
- Console shows config validation
- Multiple CSS files generated
- Hot reload on config changes

### Monorepo Example

```bash
cd examples/projects/monorepo

# Install all workspace dependencies
npm install
# Or: pnpm install

# Build design system + all apps
npm run build

# Run specific app
npm run dev:marketing
npm run dev:dashboard
```

**What you'll see:**
- Shared design tokens across apps
- Consistent styling between marketing and dashboard
- Changes to root `eva.config.cjs` affect all apps

## Comparing Outputs

All three examples generate **identical CSS** for equivalent configurations. The difference is in the workflow:

### Build Commands

**Simple SCSS:**
```bash
npx sass styles/main.scss:dist/main.css
```

**JSON Config:**
```bash
node scripts/build-with-config.js styles/main.scss dist/main.css
```

**Monorepo:**
```bash
# From workspace root
npm run build --workspaces
```

### Generated CSS (identical)

All three produce:

```css
:root {
  --4: clamp(0.28rem, 0.28vw + 0.25rem, 0.56rem);
  --8: clamp(0.56rem, 0.56vw + 0.50rem, 1.11rem);
  --16: clamp(1.11rem, 1.11vw + 1.00rem, 2.22rem);
  /* ... */
}

.w-64 { width: var(--64); }
.p-16 { padding: var(--16); }
.fs-24 { font-size: var(--24); }
/* ... */
```

## Customizing the Examples

### Change Design Sizes

**Simple SCSS:**
```scss
@use 'eva-css-fluid' with (
  $sizes: 10, 20, 40, 80  // ← Your sizes
);
```

**JSON Config / Monorepo:**
```javascript
module.exports = {
  sizes: [10, 20, 40, 80]  // ← Your sizes
};
```

Rebuild and see new utility classes generated!

### Add Custom Theme

All examples support theming:

```javascript
// eva.config.cjs (or SCSS equivalent)
module.exports = {
  theme: {
    name: 'myapp',
    colors: {
      brand: '#your-color',
      accent: '#your-accent'
    }
  }
};
```

Update HTML:

```html
<body class="current-theme theme-myapp">
  <h1 class="_c-brand">Hello!</h1>
</body>
```

### Enable Purge (Production)

Reduce CSS file size by 60-90%:

```javascript
// eva.config.cjs
module.exports = {
  sizes: [4, 8, 16, 32, 64],
  purge: {
    enabled: true,
    content: ['**/*.html', 'src/**/*.js'],
    css: 'dist/main.css',
    output: 'dist/main-purged.css'
  }
};
```

Build and compare file sizes:

```bash
npm run build
ls -lh dist/main.css        # Full CSS
ls -lh dist/main-purged.css # Purged CSS (much smaller)
```

## Example Use Cases

### E-commerce Site (JSON Config)

Extract sizes from Figma:
```javascript
module.exports = {
  sizes: [
    4,    // Icon spacing
    8,    // Button padding
    16,   // Card padding
    24,   // Section gaps
    32,   // Hero padding
    64,   // Page margins
    120   // Product images
  ],
  fontSizes: [12, 14, 16, 20, 24, 32]
};
```

### Blog/Content Site (Simple SCSS)

Minimal setup:
```scss
@use 'eva-css-fluid' with (
  $sizes: 16, 32, 64,
  $font-sizes: 16, 20, 32,
  $build-class: false  // Variables only
);
```

### SaaS Dashboard (Monorepo)

Shared design system:
```
packages/
├── ui-components/  ← Shared EVA config
├── admin-panel/    ← Uses shared config
└── user-portal/    ← Uses shared config
```

## Troubleshooting Examples

### Example Won't Build

```bash
# Verify dependencies installed
npm install

# Check Node version (v16+)
node --version

# Verify eva-css-fluid installed
npm ls eva-css-fluid
```

### Config Not Applied

```bash
# Validate config
npx eva-css validate

# Enable debug mode
# Add to eva.config.cjs:
module.exports = {
  debug: true  // ← Shows config during build
};
```

### CSS Not Updating

```bash
# Clear dist folder
rm -rf dist/
npm run build

# Check file paths in package.json
cat package.json | grep "build"
```

## Next Steps

1. **Try an example** - Start with Simple SCSS
2. **Customize it** - Change sizes and colors
3. **Read the docs:**
   - [JSON-CONFIG.md](./JSON-CONFIG.md) - Detailed JSON config guide
   - [WORKFLOWS.md](./WORKFLOWS.md) - Compare SCSS vs JSON workflows
   - [../README.md](../README.md) - Full EVA CSS documentation

## Contributing Examples

Have a useful EVA CSS example? We'd love to include it!

Requirements:
- Complete, working project
- README with clear setup instructions
- Demonstrates a specific use case
- Follows EVA CSS best practices

Submit via GitHub: https://github.com/nkdeus/eva/issues

## Summary

| Example | Best For | Complexity |
|---------|----------|------------|
| **Simple SCSS** | Learning, prototyping | Low |
| **JSON Config** | Production, teams | Medium |
| **Monorepo** | Large apps, design systems | High |

Start simple, grow as needed!
