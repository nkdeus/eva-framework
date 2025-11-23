# EVA CSS - Monorepo Example

This example demonstrates how to use EVA CSS in a monorepo with multiple applications sharing a single configuration file.

## 📁 Project Structure

```
monorepo/
├── eva.config.cjs              # ✨ Shared configuration for all apps
├── package.json                # Scripts for building all apps
├── scripts/
│   └── build-with-config.js    # Shared build script
└── apps/
    ├── landing/                # App 1: Landing page
    │   ├── index.html
    │   ├── styles/main.scss
    │   └── dist/main.css
    ├── dashboard/              # App 2: Dashboard
    │   ├── index.html
    │   ├── styles/main.scss
    │   └── dist/main.css
    └── docs/                   # App 3: Documentation
        ├── index.html
        ├── styles/main.scss
        └── dist/main.css
```

## 🎯 Key Benefits

### Single Source of Truth
- **One configuration file** (`eva.config.cjs`) for all applications
- Changes propagate to all apps when you rebuild
- Ensures design consistency across your entire product

### Independent Builds
- Build all apps at once: `npm run build`
- Or build individually: `npm run build:landing`, `npm run build:dashboard`, etc.
- Each app can have unique styles while sharing design tokens

### Validation
- Validate configuration before building: `npm run validate`
- Catches configuration errors early
- Prevents build failures

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build All Apps

```bash
npm run build
```

This builds CSS for all three apps:
- `apps/landing/dist/main.css`
- `apps/dashboard/dist/main.css`
- `apps/docs/dist/main.css`

### 3. Open the Apps

Open the HTML files in your browser:
- `apps/landing/index.html` - Marketing landing page
- `apps/dashboard/index.html` - Admin dashboard
- `apps/docs/index.html` - Documentation site

Or use the dev scripts:
```bash
npm run dev:landing    # Opens on http://localhost:8010
npm run dev:dashboard  # Opens on http://localhost:8020
npm run dev:docs       # Opens on http://localhost:8030
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build all apps |
| `npm run build:landing` | Build landing page only |
| `npm run build:dashboard` | Build dashboard only |
| `npm run build:docs` | Build documentation only |
| `npm run watch` | Watch mode - rebuilds on changes |
| `npm run validate` | Validate eva.config.cjs |
| `npm run dev:landing` | Build and serve landing |
| `npm run dev:dashboard` | Build and serve dashboard |
| `npm run dev:docs` | Build and serve docs |

## ⚙️ Configuration

The shared `eva.config.cjs` contains all design tokens:

```javascript
module.exports = {
  // Shared spacing scale
  sizes: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128],

  // Shared typography scale
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 40, 48, 64],

  // Generate utility classes
  buildClass: true,

  // Theme configuration
  theme: {
    name: 'eva',
    lightMode: { lightness: 96.4, darkness: 6.4 },
    darkMode: { lightness: 5, darkness: 95 }
  }
};
```

### Customizing Configuration

1. Edit `eva.config.cjs` with your design tokens
2. Run `npm run validate` to check configuration
3. Run `npm run build` to rebuild all apps with new config

## 🏗️ How It Works

### 1. Shared Configuration

All apps import EVA CSS without inline configuration:

```scss
// apps/landing/styles/main.scss
@use 'eva-css/index';
```

No `with ()` needed - configuration comes from `eva.config.cjs`.

### 2. Build Script

The `scripts/build-with-config.js` script:
1. Loads `eva.config.cjs` from monorepo root
2. Converts JSON to SCSS variables
3. Injects variables into `@use` statements
4. Compiles SCSS to CSS

### 3. Each App's SCSS

Each app can have unique styles while using shared tokens:

```scss
// Using shared tokens
.hero {
  padding: var(--64);           // From sizes config
  font-size: var(--48);         // From fontSizes config
  color: var(--brand);          // From theme config
}
```

## 🎨 Apps Overview

### Landing (`apps/landing/`)
Marketing landing page featuring:
- Hero section with CTA buttons
- Feature grid showcasing EVA CSS benefits
- Responsive navbar
- Automatic dark mode

### Dashboard (`apps/dashboard/`)
Admin dashboard featuring:
- Sidebar navigation
- Metrics cards with stats
- Data table with badges
- Chart placeholder

### Documentation (`apps/docs/`)
Technical documentation featuring:
- Sidebar with search and navigation
- Formatted code blocks
- API reference sections
- Note and warning boxes

## 🔄 Adding New Apps

To add a new app to the monorepo:

1. **Create app directory**:
   ```bash
   mkdir -p apps/my-app/{styles,dist}
   ```

2. **Create SCSS file** (`apps/my-app/styles/main.scss`):
   ```scss
   @use 'eva-css/index';

   // Your custom styles
   ```

3. **Create HTML file** (`apps/my-app/index.html`):
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <link rel="stylesheet" href="dist/main.css">
   </head>
   <body class="current-theme theme-eva all-grads _bg-light _c-dark_">
     <!-- Your content -->
   </body>
   </html>
   ```

4. **Add build script** to `package.json`:
   ```json
   {
     "scripts": {
       "build:my-app": "node scripts/build-with-config.js apps/my-app/styles/main.scss apps/my-app/dist/main.css"
     }
   }
   ```

5. **Build**:
   ```bash
   npm run build:my-app
   ```

## 🎯 Use Cases

This monorepo setup is ideal for:

- **SaaS products** with multiple frontends (landing, app, admin, docs)
- **Design systems** shared across multiple projects
- **White-label applications** needing consistent theming
- **Marketing sites** with multiple campaign pages
- **Multi-tenant applications** with per-tenant theming

## 📚 Learn More

- [Main README](../../../packages/eva-css/README.md) - EVA CSS documentation
- [JSON Config Guide](../../../packages/eva-css/docs/JSON-CONFIG.md) - Detailed config reference
- [Workflows Guide](../../../packages/eva-css/docs/WORKFLOWS.md) - Compare different approaches
- [Simple SCSS Example](../simple-scss/) - Inline configuration example
- [JSON Config Example](../json-config/) - Single-app JSON config

## 💡 Tips

### Production Optimization

For production, consider:

1. **CSS Purging** - Remove unused classes:
   ```javascript
   // eva.config.cjs
   module.exports = {
     // ... existing config
     purge: {
       enabled: true,
       content: ['apps/**/*.html'],
       css: 'apps/*/dist/main.css'
     }
   };
   ```

2. **CSS Minification** - Compress output:
   ```bash
   npx sass --style=compressed
   ```

3. **Build Caching** - Use tools like Turborepo:
   ```bash
   npx turbo build
   ```

### Team Collaboration

When working in a team:

1. **Document token changes** in pull requests
2. **Validate before committing**: Add pre-commit hook
3. **Version config changes** in CHANGELOG
4. **Test all apps** after config changes

## 🐛 Troubleshooting

### Build fails for one app

```bash
# Rebuild just that app
npm run build:landing
```

### Config changes not reflected

```bash
# Clear any caches and rebuild
rm -rf apps/*/dist
npm run build
```

### Styles look different across apps

- Ensure all apps use `theme-eva` class
- Check that all apps import `eva-css/index` (not `eva-css-fluid`)
- Verify no hardcoded colors in SCSS files

## 📄 License

MIT
