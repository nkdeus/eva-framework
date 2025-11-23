# JSON Configuration Guide for EVA CSS

This guide explains how to use JSON configuration files (`eva.config.cjs`) with EVA CSS in your projects.

## Table of Contents

- [Why Use JSON Configuration?](#why-use-json-configuration)
- [How It Works](#how-it-works)
- [Setup Guide](#setup-guide)
- [Configuration Options](#configuration-options)
- [Advanced Usage](#advanced-usage)
- [Integration Examples](#integration-examples)
- [Troubleshooting](#troubleshooting)

## Why Use JSON Configuration?

### Advantages

✅ **Single source of truth** - One config file for multiple SCSS files
✅ **Validation** - Use `npx eva-css validate` to check your configuration
✅ **Cleaner SCSS** - No configuration clutter in your stylesheets
✅ **Better DX** - Easier to maintain and update design system values
✅ **Reusability** - Share configuration across different build processes

### When to Use

Use JSON configuration when:
- You have **multiple SCSS files** that need the same EVA settings
- You want **centralized design system** management
- You need **configuration validation** before building
- Your project uses a **build pipeline** (Webpack, Vite, etc.)

### When NOT to Use

Stick with SCSS variables (`@use ... with ()`) when:
- You have a **simple project** with one SCSS file
- You want the **quickest setup** possible
- You prefer **no build scripts**
- You're **learning EVA CSS** and want simplicity

## How It Works

### The Problem

SCSS cannot execute JavaScript during compilation. When you write:

```scss
@use 'eva-css-fluid';
```

SCSS has no way to read `eva.config.cjs` and load those values.

### The Solution

A **build script** that:

1. **Reads** your `eva.config.cjs` (JavaScript)
2. **Converts** the config to SCSS variables
3. **Injects** those variables into your SCSS
4. **Compiles** the final CSS with Sass

```
eva.config.cjs  →  Build Script  →  SCSS Variables  →  Sass  →  CSS
```

### Why EVA's `npm run build` Doesn't Work for Your Project

The `npm run build` script in the EVA CSS package is designed to **build the framework itself**, not user projects. It expects:

- EVA's internal file structure
- Output to EVA's `dist/` folder
- EVA's package configuration

That's why you need to create your own build script adapted to your project structure.

## Setup Guide

### Quick Setup (5 minutes)

#### 1. Copy the Build Script Template

```bash
# From your project root
mkdir -p scripts

# Copy from node_modules (if you installed eva-css-fluid)
cp node_modules/eva-css-fluid/examples/user-scripts/build-with-config.js scripts/

# OR download from GitHub
curl -o scripts/build-with-config.js https://raw.githubusercontent.com/nkdeus/eva/main/examples/user-scripts/build-with-config.js
chmod +x scripts/build-with-config.js
```

#### 2. Create Your Configuration File

Create `eva.config.cjs` in your project root:

```javascript
// eva.config.cjs
module.exports = {
  // Your design sizes from Figma/design system
  sizes: [4, 8, 16, 32, 64, 128],

  // Your font sizes
  fontSizes: [14, 16, 20, 24, 32],

  // Generate utility classes
  buildClass: true,

  // Optional: Debug mode
  debug: false
};
```

#### 3. Update Your SCSS Files

Change from:

```scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 128,
  $font-sizes: 14, 16, 20, 24, 32,
  $build-class: true
);
```

To:

```scss
@use 'eva-css-fluid';
```

#### 4. Add Build Scripts to package.json

```json
{
  "scripts": {
    "build:css": "node scripts/build-with-config.js styles/main.scss dist/main.css",
    "watch:css": "nodemon --watch styles --watch eva.config.cjs --ext scss,cjs --exec 'npm run build:css'"
  },
  "devDependencies": {
    "sass": "^1.70.0",
    "nodemon": "^3.0.0"
  }
}
```

#### 5. Build Your CSS

```bash
# One-time build
npm run build:css

# Watch mode (auto-rebuild on changes)
npm run watch:css
```

Done! Your CSS is now built with JSON configuration.

## Configuration Options

### Core Options

```javascript
// eva.config.cjs
module.exports = {
  // REQUIRED: Size values (must include 16 as base unit)
  sizes: [4, 8, 16, 32, 64, 128],

  // Font sizes
  fontSizes: [14, 16, 20, 24, 32],

  // Generate utility classes (true) or variables only (false)
  buildClass: true,

  // Add px/rem static values for debugging
  pxRemSuffix: false,

  // Use size values in variable names
  nameBySize: true,

  // Show configuration during build
  debug: false
};
```

### Custom Class Mode

Generate only specific classes to reduce CSS size:

```javascript
module.exports = {
  sizes: [24, 50, 100],
  customClass: true,
  classConfig: {
    w: [50, 100],    // Only .w-50 and .w-100
    px: [24],        // Only .px-24
    g: [24, 50]      // Only .g-24 and .g-50
  }
};
```

Available properties:
- **Width/Height:** `w`, `mw`, `h`, `mh`
- **Padding:** `p`, `px`, `py`, `pt`, `pb`, `pr`, `pl`
- **Margin:** `m`, `mx`, `my`, `mt`, `mb`, `mr`, `ml`
- **Gap:** `g`, `gap`
- **Border radius:** `br`
- **Font:** `fs`, `lh`

### Theme Configuration

```javascript
module.exports = {
  sizes: [4, 8, 16, 32, 64],

  theme: {
    name: 'myapp',

    colors: {
      // HEX colors (auto-converted to OKLCH)
      brand: '#ff5733',
      accent: '#7300ff',
      extra: '#ffe500',

      // Or OKLCH format
      dark: { lightness: 20, chroma: 0.05, hue: 200 },
      light: { lightness: 95, chroma: 0.01, hue: 200 }
    },

    lightMode: {
      lightness: 96.4,  // Light background
      darkness: 6.4     // Dark text
    },

    darkMode: {
      lightness: 5,     // Dark background
      darkness: 95      // Light text
    },

    // Auto-switch based on system preference
    autoSwitch: false
  }
};
```

### Purge Configuration

Reduce CSS file size by removing unused classes:

```javascript
module.exports = {
  sizes: [16, 24, 32],

  purge: {
    enabled: true,
    content: ['src/**/*.{html,js,jsx,tsx,vue}'],
    css: 'dist/eva.css',
    output: 'dist/eva-purged.css',
    safelist: ['theme-', 'current-', 'toggle-']
  }
};
```

## Advanced Usage

### Configuration Validation

Validate your configuration before building:

```bash
npx eva-css validate
```

Example output:

```
✅ Configuration is valid

📋 Configuration Summary:
  - Sizes: 4, 8, 16, 32, 64, 128 (6 values)
  - Font sizes: 14, 16, 20, 24, 32 (5 values)
  - Build class: true
  - Custom class mode: false
```

### Multiple SCSS Files

Your configuration is automatically shared across all SCSS files:

```
project/
├── eva.config.cjs          ← Single config file
├── scripts/
│   └── build-with-config.js
└── styles/
    ├── main.scss           ← @use 'eva-css-fluid';
    ├── components.scss     ← @use 'eva-css-fluid';
    └── utilities.scss      ← @use 'eva-css-fluid';
```

Build each file:

```json
{
  "scripts": {
    "build:main": "node scripts/build-with-config.js styles/main.scss dist/main.css",
    "build:components": "node scripts/build-with-config.js styles/components.scss dist/components.css"
  }
}
```

### package.json Configuration (Alternative)

Instead of `eva.config.cjs`, you can use `package.json`:

```json
{
  "name": "my-project",
  "eva": {
    "sizes": [4, 8, 16, 32, 64],
    "fontSizes": [16, 24, 32],
    "buildClass": true
  }
}
```

The build script automatically detects this format.

### Generating SCSS Variables

Generate standalone SCSS variables from your config:

```bash
npx eva-css generate
```

This creates `src/_config-generated.scss`:

```scss
$sizes: 4, 8, 16, 32, 64, 128;
$font-sizes: 14, 16, 20, 24, 32;
$build-class: true;
```

## Integration Examples

### Complete Project Examples

#### VuePress Documentation Site

Perfect for documentation sites with consistent design system.

```
vuepress-docs/
├── eva.config.cjs          ← Centralized config
├── scripts/
│   └── build-eva.js        ← Build script
├── docs/
│   ├── .vuepress/
│   │   ├── config.js
│   │   └── styles/
│   │       └── index.scss  ← Simplified (no config)
│   └── README.md
└── package.json
```

**eva.config.cjs:**
```javascript
module.exports = {
  sizes: [4, 8, 16, 24, 32, 48, 64],
  fontSizes: [14, 16, 18, 20, 24, 32, 40],
  buildClass: true,
  theme: {
    name: 'docs',
    colors: {
      brand: '#3eaf7c',      // VuePress green
      accent: '#2c3e50',     // Dark text
      extra: '#42b983'       // Bright green
    },
    lightMode: { lightness: 98, darkness: 10 },
    darkMode: { lightness: 12, darkness: 95 }
  }
};
```

**docs/.vuepress/styles/index.scss:**
```scss
// Clean import - config from eva.config.cjs
@use 'eva-css-fluid';

// Custom VuePress overrides
.theme-default-content {
  padding: var(--32);
  max-width: var(--800);

  h1 { font-size: var(--40); }
  h2 { font-size: var(--32); }
  p { font-size: var(--16); }
}
```

**package.json:**
```json
{
  "scripts": {
    "build:css": "node scripts/build-eva.js docs/.vuepress/styles/index.scss docs/.vuepress/public/eva.css",
    "dev": "npm run build:css && vuepress dev docs",
    "build": "npm run build:css && vuepress build docs"
  }
}
```

#### Next.js Application

Modern React app with global styles and component-level styling.

```
nextjs-app/
├── eva.config.cjs          ← Shared config
├── scripts/
│   └── build-eva.js
├── styles/
│   ├── globals.scss        ← Global EVA styles
│   └── components.scss     ← Component styles
├── pages/
│   └── _app.js
└── package.json
```

**eva.config.cjs:**
```javascript
module.exports = {
  // Design system from Figma
  sizes: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48, 64],
  buildClass: true,

  theme: {
    name: 'app',
    colors: {
      brand: '#0070f3',      // Next.js blue
      accent: '#7928ca',     // Purple
      extra: '#ff0080'       // Pink
    },
    autoSwitch: true  // Auto dark mode
  },

  // Production optimization
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['pages/**/*.{js,jsx}', 'components/**/*.{js,jsx}'],
    css: 'styles/globals.css',
    output: 'public/eva-optimized.css'
  }
};
```

**styles/globals.scss:**
```scss
@use 'eva-css-fluid';

// Global resets and variables available everywhere
body {
  padding: var(--0);
  margin: var(--0);
  font-size: var(--16);
  background: var(--light);
  color: var(--dark);
}
```

**pages/_app.js:**
```javascript
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <div className="current-theme theme-app">
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
```

**package.json:**
```json
{
  "scripts": {
    "prebuild": "npm run build:css",
    "build:css": "node scripts/build-eva.js styles/globals.scss styles/globals.css",
    "dev": "npm run build:css && next dev",
    "build": "next build"
  }
}
```

#### React + Vite SPA

Fast development with HMR and optimized production builds.

```
react-vite-app/
├── eva.config.cjs
├── scripts/
│   └── build-eva.js
├── src/
│   ├── main.jsx
│   └── styles/
│       ├── main.scss       ← Entry point
│       ├── components.scss
│       └── utilities.scss
├── vite.config.js
└── package.json
```

**eva.config.cjs:**
```javascript
module.exports = {
  sizes: [4, 8, 16, 24, 32, 48, 64],
  fontSizes: [14, 16, 20, 24, 32],
  buildClass: true,
  customClass: false,  // Full utilities for rapid prototyping

  theme: {
    name: 'vite',
    colors: {
      brand: '#646cff',      // Vite purple
      accent: '#42b883',     // Vue green
      extra: '#ffc107'       // Amber
    }
  }
};
```

**vite.config.js (with auto-rebuild):**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'eva-css-build',
      buildStart() {
        console.log('Building EVA CSS...');
        execSync('node scripts/build-eva.js src/styles/main.scss src/styles/main.css');
      }
    }
  ]
});
```

**src/main.jsx:**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <div className="current-theme theme-vite">
    <App />
  </div>
);
```

### Framework-Specific Integrations

#### Vite Integration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { execSync } from 'child_process';

export default defineConfig({
  plugins: [
    {
      name: 'eva-css-build',
      buildStart() {
        // Build EVA CSS on Vite startup
        execSync('node scripts/build-with-config.js styles/main.scss public/main.css');
      }
    }
  ]
});
```

#### Webpack Integration

```javascript
// webpack.config.js
const { execSync } = require('child_process');

module.exports = {
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tap('EvaCssBuild', () => {
          execSync('node scripts/build-with-config.js styles/main.scss dist/main.css');
        });
      }
    }
  ]
};
```

#### Nuxt.js Integration

```javascript
// nuxt.config.js
export default {
  hooks: {
    build: {
      before() {
        const { execSync } = require('child_process');
        execSync('node scripts/build-eva.js assets/styles/main.scss static/eva.css');
      }
    }
  },
  css: ['~/static/eva.css']
};
```

#### Astro Integration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { execSync } from 'child_process';

export default defineConfig({
  integrations: [
    {
      name: 'eva-css',
      hooks: {
        'astro:build:start': () => {
          execSync('node scripts/build-eva.js src/styles/main.scss public/eva.css');
        }
      }
    }
  ]
});
```

### npm Scripts for CI/CD

```json
{
  "scripts": {
    "prebuild": "npm run build:css",
    "build": "vite build",
    "build:css": "node scripts/build-with-config.js styles/main.scss dist/main.css",
    "validate:css": "npx eva-css validate",
    "test": "npm run validate:css && npm run build"
  }
}
```

### Monorepo Setup

Perfect for design systems shared across multiple apps:

```
monorepo/
├── eva.config.cjs          ← Shared by all apps
├── scripts/
│   └── build-eva.js
├── apps/
│   ├── landing/
│   │   └── styles/main.scss
│   ├── dashboard/
│   │   └── styles/main.scss
│   └── docs/
│       └── styles/main.scss
└── package.json
```

**Root package.json:**
```json
{
  "scripts": {
    "build:css:landing": "node scripts/build-eva.js apps/landing/styles/main.scss apps/landing/dist/main.css",
    "build:css:dashboard": "node scripts/build-eva.js apps/dashboard/styles/main.scss apps/dashboard/dist/main.css",
    "build:css:docs": "node scripts/build-eva.js apps/docs/styles/main.scss apps/docs/dist/main.css",
    "build:css:all": "npm run build:css:landing && npm run build:css:dashboard && npm run build:css:docs"
  }
}
```

All apps share the same `eva.config.cjs` = consistent design system! 🎨

## Troubleshooting

### Config Not Being Applied

**Symptom:** Your sizes from `eva.config.cjs` don't appear in the generated CSS.

**Solutions:**

1. Check config file location (must be in project root)
2. Verify file name: `eva.config.cjs` or `eva.config.js`
3. Check exports: `module.exports = {...}` (not `export default`)
4. Enable debug mode to see what's loaded:

```javascript
module.exports = {
  sizes: [4, 8, 16, 32],
  debug: true  // ← Shows config during build
};
```

### Build Script Not Found

**Symptom:** `Error: Cannot find module './scripts/build-with-config.js'`

**Solution:** Verify script location and path in package.json:

```bash
# Check script exists
ls scripts/build-with-config.js

# Verify package.json path matches
cat package.json | grep "build:css"
```

### Sass Compilation Errors

**Symptom:** `Error: Cannot find module 'eva-css-fluid'`

**Solution:** Install dependencies:

```bash
npm install eva-css-fluid sass
```

### Variables Not Matching Config

**Symptom:** CSS has default sizes, not your custom sizes.

**Cause:** Your SCSS file has inline `@use ... with ()` configuration that overrides the JSON config.

**Solution:** Remove inline configuration:

```scss
// ❌ Remove this
@use 'eva-css-fluid' with (
  $sizes: 10, 20, 30
);

// ✅ Use this
@use 'eva-css-fluid';
```

### Watch Mode Not Rebuilding

**Symptom:** Changes to `eva.config.cjs` don't trigger rebuild.

**Solution:** Make sure `nodemon` watches the config file:

```json
{
  "scripts": {
    "watch:css": "nodemon --watch styles --watch eva.config.cjs --ext scss,cjs --exec 'npm run build:css'"
  }
}
```

## Migration from SCSS Variables

Switching from SCSS variables to JSON config is straightforward:

### Before (SCSS Variables)

```scss
// styles/main.scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 128,
  $font-sizes: 14, 16, 20, 24, 32,
  $build-class: true
);
```

```json
{
  "scripts": {
    "build": "npx sass styles/main.scss:dist/main.css"
  }
}
```

### After (JSON Config)

```javascript
// eva.config.cjs (NEW FILE)
module.exports = {
  sizes: [4, 8, 16, 32, 64, 128],
  fontSizes: [14, 16, 20, 24, 32],
  buildClass: true
};
```

```scss
// styles/main.scss (SIMPLIFIED)
@use 'eva-css-fluid';
```

```json
{
  "scripts": {
    "build": "node scripts/build-with-config.js styles/main.scss dist/main.css"
  }
}
```

**Generated CSS is identical!** Only the workflow changes.

## Best Practices

### 1. Keep Config Simple

Start with minimal configuration:

```javascript
module.exports = {
  sizes: [4, 8, 16, 32, 64],  // Only sizes you actually use
  fontSizes: [16, 24, 32]
};
```

Add more options only when needed.

### 2. Validate Before Building

Add validation to your CI/CD:

```json
{
  "scripts": {
    "prebuild": "npx eva-css validate && npm run build:css",
    "build": "vite build"
  }
}
```

### 3. Use Debug Mode During Development

Enable debug to see what's being generated:

```javascript
module.exports = {
  sizes: [4, 8, 16, 32],
  debug: process.env.NODE_ENV === 'development'
};
```

### 4. Document Your Design Sizes

Add comments to explain where sizes come from:

```javascript
module.exports = {
  // Extracted from Figma: Components -> Spacing
  sizes: [
    4,   // Micro spacing (icon gaps)
    8,   // Small gaps (inline elements)
    16,  // Standard padding (cards, buttons)
    32,  // Section spacing
    64,  // Page margins
    128  // Hero sections
  ],

  // Typography scale
  fontSizes: [
    14,  // Small text (captions)
    16,  // Body text
    24,  // Subheadings
    32,  // Headings
    48   // Hero titles
  ]
};
```

## Next Steps

- See [WORKFLOWS.md](./WORKFLOWS.md) for comparison with SCSS variables
- Check [EXAMPLES.md](./EXAMPLES.md) for complete project examples
- Read the [main README](../README.md) for full EVA CSS documentation

## Need Help?

- GitHub Issues: https://github.com/nkdeus/eva/issues
- Documentation: https://eva-css.xyz/
- Build script template: `examples/user-scripts/build-with-config.js`
