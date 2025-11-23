# EVA CSS - SCSS Examples

Simple SCSS-only examples demonstrating different EVA CSS configuration patterns. These examples use inline SCSS variables (no build script required).

## 📁 Examples

### [basic/](basic/) - Basic Configuration
The simplest possible EVA CSS setup with minimal configuration.

**Use when:**
- You're just getting started
- You want the defaults
- You need a quick prototype

### [custom-sizes/](custom-sizes/) - Custom Sizes from Design
Shows how to extract sizes from your design (e.g., Figma) and use them in EVA CSS.

**Use when:**
- You have specific design measurements
- You're implementing a design system
- You need precise control over spacing

### [custom-class/](custom-class/) - Optimized Class Generation
Demonstrates `$custom-class` mode to generate only the utility classes you need.

**Use when:**
- You want to minimize CSS bundle size
- You know exactly which classes you'll use
- You're optimizing for production

## 🚀 Quick Start

Each example is self-contained and can be compiled with:

```bash
cd basic/
npx sass main.scss output.css
```

## 📚 More Examples

For complete project examples with HTML and multiple apps:
- [../projects/simple-scss/](../projects/simple-scss/) - Complete project with SCSS variables
- [../projects/json-config/](../projects/json-config/) - JSON configuration with build script
- [../projects/monorepo/](../projects/monorepo/) - Multi-app monorepo

## 🔧 When to Use SCSS Examples vs Projects

| Use SCSS Examples | Use Projects |
|-------------------|--------------|
| Learning EVA CSS syntax | Building a real application |
| Testing configurations | Need HTML + CSS + scripts |
| Quick experiments | Production-ready setup |
| Single file testing | Multiple pages/apps |

## 📖 Documentation

- [Main README](../../packages/eva-css/README.md)
- [SCSS Variables Guide](../../packages/eva-css/docs/WORKFLOWS.md#scss-variables)
- [Configuration Reference](../../packages/eva-css/docs/JSON-CONFIG.md)
