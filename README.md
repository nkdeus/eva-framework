# EVA CSS - Fluid Design Framework

> Transform static designs into responsive fluid systems with perceptually uniform OKLCH colors

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

EVA CSS is a revolutionary CSS framework that converts your static Figma/Sketch designs into **fully responsive fluid systems** using modern CSS `clamp()` and the **OKLCH color space**. Say goodbye to manual breakpoints and hello to truly fluid, accessible design.

## 🎯 Why EVA CSS?

### The Problem with Traditional Responsive Design

Traditional CSS frameworks force you into arbitrary breakpoints:

```css
/* ❌ The old way - Manual breakpoints everywhere */
.title {
  font-size: 24px;
  @media (min-width: 768px) { font-size: 32px; }
  @media (min-width: 1024px) { font-size: 48px; }
  @media (min-width: 1440px) { font-size: 64px; }
}
```

**Problems:**
- Rigid device categories (mobile/tablet/desktop)
- Dozens of media queries to maintain
- Breaks user zoom for accessibility
- Design proportions lost between breakpoints

### The EVA Solution: Fluid Everything

EVA CSS generates **continuous fluid scaling** from your design sizes:

```scss
// ✅ The EVA way - Extract sizes from Figma, done!
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 120,  // YOUR sizes from design
  $font-sizes: 16, 24, 48, 64      // YOUR font sizes
);
```

```html
<!-- Automatically fluid across ALL screen sizes -->
<h1 class="fs-64">Perfect scaling</h1>
<div class="w-120 h-120 p-16">Fluid box</div>
```

**Result:** All values scale smoothly from mobile to desktop, maintaining perfect proportions. No media queries needed!

## ✨ Key Features

- 🎨 **Automatic Fluid Scaling** - CSS `clamp()` generates responsive sizes from your design
- 🌈 **OKLCH Colors** - Perceptually uniform color system (better than HSL)
- 📐 **Design-to-Code Bridge** - Extract Figma sizes → paste into config → done
- 🎯 **Two Workflows** - SCSS variables (simple) or JSON config (scalable)
- ⚡ **Zero JavaScript** - Pure CSS/SCSS solution
- 🗜️ **Smart Purging** - Removes 60-90% unused CSS in production
- 🎭 **Built-in Themes** - Dark/light mode with smooth transitions
- ♿ **Accessibility First** - Perfect browser zoom support

## 📦 Packages

This monorepo contains 4 packages published to npm:

| Package | Description | NPM |
|---------|-------------|-----|
| **[eva-css-fluid](./packages/eva-css)** | Core framework - Fluid sizing & OKLCH colors | [![npm](https://img.shields.io/npm/v/eva-css-fluid)](https://www.npmjs.com/package/eva-css-fluid) |
| **[eva-colors](./packages/eva-colors)** | OKLCH color utilities & CLI tools | [![npm](https://img.shields.io/npm/v/eva-colors)](https://www.npmjs.com/package/eva-colors) |
| **[eva-css-purge](./packages/eva-purge)** | Intelligent CSS optimization | [![npm](https://img.shields.io/npm/v/eva-css-purge)](https://www.npmjs.com/package/eva-css-purge) |
| **[create-eva-css](./packages/create-eva-css)** | Project scaffolding tool | [![npm](https://img.shields.io/npm/v/create-eva-css)](https://www.npmjs.com/package/create-eva-css) |

## 🚀 Quick Start

### Option 1: Scaffold a New Project (Fastest)

```bash
npm init eva-css my-project
cd my-project
npm install
npm run dev
```

**Includes:** Full EVA setup, examples, build scripts, and theme switching!

### Option 2: Add to Existing Project

```bash
npm install eva-css-fluid
```

```scss
// styles/main.scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64,        // Extract from your design
  $font-sizes: 14, 16, 20, 24, 32,
  $build-class: true
);
```

```bash
npx sass styles/main.scss:dist/main.css
```

```html
<!-- Use generated utility classes -->
<div class="w-64 h-64 p-16 _bg-brand">
  <h1 class="fs-32 _c-light">Hello EVA!</h1>
</div>
```

**That's it!** Everything scales fluidly. ✨

## 💡 How It Works

### 1. Extract Sizes from Your Design

Analyze your Figma/Sketch and note ALL sizes used:
- Gaps: `4px`, `8px`
- Paddings: `16px`, `32px`
- Widths/Heights: `64px`, `120px`, `141px`
- Font sizes: `16px`, `24px`, `64px`

### 2. Configure EVA with YOUR Sizes

```scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 120, 141,  // All spacing/sizing
  $font-sizes: 16, 24, 64               // All typography
);
```

### 3. EVA Generates Fluid Utilities

```css
/* Automatically generated: */
.w-141 { width: var(--141); }
.fs-64 { font-size: var(--64); }

/* Where --141 and --64 are fluid clamp() values! */
:root {
  --141: clamp(4.92rem, 4.92vw + 4.44rem, 9.81rem);
  --64: clamp(2.22rem, 2.22vw + 2rem, 4.44rem);
}
```

### 4. Use in HTML or Custom CSS

```html
<!-- Utility classes -->
<div class="w-141 h-141 p-16 g-8">
  <h1 class="fs-64">Fluid title</h1>
</div>
```

```scss
// Or custom CSS with variables
.hero {
  width: var(--141);
  padding: var(--16);
  font-size: var(--64);
}
```

**Magic:** All sizes scale proportionally across viewports!

## 🌈 OKLCH Color System

EVA uses **OKLCH** (perceptually uniform color space) instead of RGB/HSL:

```javascript
// eva.config.cjs
module.exports = {
  theme: {
    name: 'myapp',
    colors: {
      brand: '#3b82f6',    // Auto-converted to OKLCH
      accent: '#22c55e',
      extra: '#a855f7'
    }
  }
};
```

**Benefits:**
- Perceptually uniform (what you see = what you get)
- Better gradients (no muddy colors)
- Consistent lightness/darkness
- Easy opacity modifiers: `var(--brand_)`, `var(--brand__)`, `var(--brand___)`

## 📚 Documentation

### Core Framework
- [eva-css-fluid README](./packages/eva-css/README.md) - Complete framework docs
- [JSON Config Guide](./packages/eva-css/docs/JSON-CONFIG.md) - Advanced configuration
- [Workflows Guide](./packages/eva-css/docs/WORKFLOWS.md) - SCSS vs JSON comparison
- [Migration Guide](./packages/eva-css/MIGRATION.md) - Migrating from v1.x

### Tools & Utilities
- [eva-colors README](./packages/eva-colors/README.md) - Color conversion tools
- [eva-purge README](./packages/eva-purge/README.md) - CSS optimization
- [create-eva-css README](./packages/create-eva-css/README.md) - Scaffolding

### Examples
- [Simple SCSS](./examples/projects/simple-scss/) - Quickest setup
- [JSON Config](./examples/projects/json-config/) - Production-ready
- [Monorepo](./examples/projects/monorepo/) - Multi-app design system
- [User Scripts](./examples/user-scripts/) - Reusable build scripts

### Live Demo
- [eva-css.xyz](https://eva-css.xyz/) - Interactive documentation
- [Demo site](./demo/) - Local demo with all features

## 🎯 Complete Workflow: Figma → Production

```bash
# 1. Analyze Figma design and extract sizes
# Gaps: 4, 8
# Paddings: 16, 32
# Widths: 64, 120, 141
# Fonts: 16, 24, 64

# 2. Install EVA
npm install eva-css-fluid

# 3. Configure with YOUR sizes
# styles/main.scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 120, 141,
  $font-sizes: 16, 24, 64
);

# 4. Compile
npx sass styles/main.scss:dist/main.css

# 5. Use in HTML
<div class="w-141 h-141 p-16 g-8">
  <h1 class="fs-64">Fluid from Figma!</h1>
</div>

# 6. Optimize for production
npm install --save-dev eva-css-purge
npx eva-purge --css dist/main.css --content "src/**/*.html"
# Result: 60-90% size reduction!
```

## 🛠️ Monorepo Development

This is a **pnpm workspace** monorepo. To contribute or develop:

```bash
# Install pnpm globally
npm install -g pnpm

# Install all dependencies
pnpm install

# Build all packages
pnpm run build

# Develop with watch mode
cd packages/eva-css
pnpm run watch

# Test examples
cd examples/projects/json-config
pnpm install
pnpm run dev
```

**See [README-MONOREPO.md](./README-MONOREPO.md) for detailed development guide.**

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Make your changes
4. Test locally: `pnpm install && pnpm run build`
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing`)
7. Open a Pull Request

**Guidelines:**
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

## 📝 License

MIT © [Michaël Tati](https://ulysse-2029.com/)

## 👨‍💻 Author

**Michaël Tati** - Full Stack Developer & Designer

- 🌐 Portfolio: [ulysse-2029.com](https://ulysse-2029.com/)
- 💼 LinkedIn: [linkedin.com/in/mtati](https://www.linkedin.com/in/mtati/)
- 🎨 EVA CSS: [eva-css.xyz](https://eva-css.xyz/)
- 📦 GitHub: [@nkdeus](https://github.com/nkdeus)

---

## 🌟 Why Choose EVA CSS?

### Traditional Framework (e.g., Tailwind)
```html
<!-- Manual breakpoints for every element -->
<div class="text-2xl md:text-4xl lg:text-6xl xl:text-8xl">Title</div>
<div class="p-4 md:p-6 lg:p-8 xl:p-12">Content</div>
```
❌ Manual breakpoints everywhere
❌ Inconsistent scaling
❌ Hard to maintain

### EVA CSS
```html
<!-- Automatic fluid scaling from your design -->
<div class="fs-64">Title</div>
<div class="p-16">Content</div>
```
✅ One class, scales everywhere
✅ Maintains design proportions
✅ Easy to maintain

**The Result:**
- **Traditional:** 2000+ lines, 300+ media queries, manual breakpoint hell
- **EVA CSS:** Auto-generated from 7 design sizes, zero media queries

---

**Ready to build fluid, accessible designs?**

```bash
npm init eva-css my-fluid-project
```

**Questions?** Check the [documentation](./packages/eva-css/README.md) or [open an issue](https://github.com/nkdeus/eva/issues)!
