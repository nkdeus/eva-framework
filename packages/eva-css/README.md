# eva-css-fluid

> Revolutionary fluid design framework - Transform static Figma designs into truly responsive fluid systems

**EVA CSS** replaces traditional breakpoint-based responsive design with **automatic fluid scaling**. Instead of defining arbitrary breakpoints for every screen size, EVA converts your static pixel values from Figma into intelligent `clamp()` functions that scale smoothly across all devices.

## 💡 The Revolutionary Concept

### Why Adaptive Responsive Design is Broken

Traditional responsive design with breakpoints is fundamentally flawed:
- ❌ **Arbitrary breakpoints** force designs into rigid device categories (mobile/tablet/desktop)
- ❌ **Maintenance nightmare** - dozens of media queries for every component
- ❌ **Breaks user zoom** - layouts break when users need to zoom for accessibility
- ❌ **Inconsistent scaling** - elements don't maintain proportional relationships
- ❌ **Design intent lost** - manual breakpoint adjustments compromise the original vision

### The EVA Solution: Proportion Over Size

EVA CSS introduces **proactive fluid responsiveness**:
- ✅ **Continuous scaling** - no breakpoints, smooth transitions across all screen sizes
- ✅ **Maintains proportions** - visual hierarchy and balance preserved automatically
- ✅ **Accessibility first** - works perfectly with browser zoom and user preferences
- ✅ **Design-to-code bridge** - Figma values become fluid automatically
- ✅ **One source of truth** - define sizes once, scale everywhere

```scss
// ❌ Traditional Responsive (Adaptive)
.title {
  font-size: 24px;
  @media (min-width: 768px) { font-size: 32px; }
  @media (min-width: 1024px) { font-size: 48px; }
  @media (min-width: 1440px) { font-size: 64px; }
}

// ✅ EVA Fluid (Continuous)
.title {
  font-size: var(--fs-64);
  // Automatically: clamp(2.22rem, 2.22vw + 2rem, 4.44rem)
  // Scales smoothly from mobile to desktop
}
```

## 🎯 Features

- **Automatic Fluid Conversion**: Transform static px values into intelligent clamp() functions
- **Figma-to-Code Workflow**: Extract sizes from your design, paste into config, done
- **OKLCH Colors**: Perceptually uniform color system with opacity/brightness modifiers
- **Modern Gradients**: Emmet-style syntax for ultra-compact gradient creation
- **Theme System**: Built-in dark/light mode with seamless switching
- **Two Modes**: Utility classes or CSS variables only
- **Zero JavaScript**: Pure CSS/SCSS solution
- **Accessibility Ready**: Perfect browser zoom support, respects user preferences

## 📦 Installation

```bash
npm install eva-css-fluid
# or
pnpm add eva-css-fluid
# or
yarn add eva-css-fluid
```

**Migrating from another framework?** See the [Migration Guide](./MIGRATION.md) for detailed instructions.

## 🚀 Quick Start

### Using Pre-built CSS

```html
<link rel="stylesheet" href="node_modules/eva-css-fluid/dist/eva.css">
```

### Using SCSS with Default Configuration

```scss
@use 'eva-css-fluid';
```

### Using SCSS with Custom Configuration

**This is the main feature of EVA CSS!** Simply change the `$sizes` to match your Figma design:

```scss
// Example: Sizes extracted from Figma design
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 128,        // 👈 Change these to YOUR design sizes!
  $font-sizes: 14, 16, 20, 24, 32,      // 👈 Change these to YOUR font sizes!
  $build-class: true,
  $px-rem-suffix: false
);
```

**Real example from a Figma project:**

```scss
// Extracted from Figma: gaps, paddings, widths, heights
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 120, 141,   // 4=content-gap, 8=color-gap, 16=padding,
                                         // 32=section-gap, 64=hero-gap,
                                         // 120=H1, 141=circles
  $font-sizes: 16, 120,                  // 16=body, 120=heading
  $build-class: true
);

// Now all these sizes are available as fluid variables!
// var(--4), var(--8), var(--16), var(--32), var(--64), var(--120), var(--141)
```

## 🎨 Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `$sizes` | `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` | Available fluid size values |
| `$font-sizes` | `12, 14, 16, 18, 20, 24, 32, 48` | Available font sizes |
| `$build-class` | `true` | Generate utility classes (`true`) or variables only (`false`) |
| `$px-rem-suffix` | `false` | Add px/rem static values for debugging |
| `$name-by-size` | `true` | Use size values in variable names |
| `$custom-class` | `false` | Enable custom class filtering |
| `$class-config` | `()` | Map of properties to sizes when `$custom-class: true` |

## 💡 Usage Examples

### Utility Classes Mode (`$build-class: true`)

```html
<div class="w-64 h-64 p-16 _bg-brand _c-light">
  <h1 class="fs-32 _c-accent">Hello EVA</h1>
  <p class="fs-16 _c-light_">Fluid design framework</p>
</div>
```

### Variables Mode (`$build-class: false`)

```scss
.hero {
  width: var(--64);
  padding: var(--16);
  background: var(--brand);
  color: var(--light);

  h1 {
    font-size: var(--32);
    color: var(--accent);
  }
}
```

### Custom Class Mode (`$custom-class: true`)

Generate only specific classes to reduce CSS output size:

```scss
@use 'eva-css-fluid/src' as * with (
  $sizes: (24, 50, 100),
  $custom-class: true,
  $class-config: (
    w: (50, 100),      // Only .w-50 and .w-100
    px: (24,),         // Only .px-24 (note trailing comma)
    g: (24, 50)        // Only .g-24 and .g-50
  )
);
```

This generates only the specified classes, perfect for production builds or when you need fine control over output size.

## 🎨 Fluid Scaling

EVA CSS uses modern CSS `clamp()` for fluid scaling:

```scss
// Size variables
var(--16)    // Standard fluid scaling
var(--16_)   // Reduced scaling
var(--16__)  // Extreme reduced
var(--16-)   // Extended scaling

// Font size variables
var(--24)    // Standard fluid font
var(--24_)   // Reduced scaling
var(--24__)  // Extreme reduced
```

## 🌈 OKLCH Color System

```scss
// Base colors
var(--brand)     // Base brand color
var(--accent)    // Accent color
var(--extra)     // Extra color
var(--light)     // Light color
var(--dark)      // Dark color

// Opacity modifiers
var(--brand_)    // 65% opacity
var(--brand__)   // 35% opacity
var(--brand___)  // 5% opacity

// Brightness modifiers
var(--brand-d)   // Darker
var(--brand-b)   // Brighter
var(--brand-d_)  // More darker
var(--brand-b_)  // More brighter
```

## 🎨 Gradient System

```html
<!-- Linear gradient -->
<div class="grad-linear from-brand to-accent d-r">Content</div>

<!-- Radial gradient -->
<div class="grad-radial from-extra to-transparent bg-size_">Content</div>

<!-- Gradient text -->
<h1 class="grad-linear-text from-brand to-accent d-br">Gradient Text</h1>

<!-- Animated gradient -->
<div class="grad-linear from-brand to-accent a-45 animated">Content</div>
```

## 🌓 Theme System

```html
<body class="current-theme theme-myproject">
  <!-- Content -->
  <button onclick="document.body.classList.toggle('toggle-theme')">
    Toggle Theme
  </button>
</body>
```

```scss
// Define your theme
.theme-myproject {
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;

  --accent-lightness: 51.7%;
  --accent-chroma: 0.293;
  --accent-hue: 289.66;

  --current-lightness: 96.4%;  // Light mode
  --current-darkness: 26.4%;   // Dark mode
}
```

## 📚 Documentation

- [Full Documentation](https://eva-css.xyz/)
- [GitHub Repository](https://github.com/nkdeus/eva)

## 🎨 Examples & Demo

Live examples and framework documentation:
- [https://eva-css.xyz/](https://eva-css.xyz/)

## 🎯 Quick Workflow: Figma → EVA CSS

```bash
# 1. Analyze your Figma design and extract ALL sizes used
# Look for: gaps, paddings, margins, widths, heights, font-sizes

# 2. Create your project SCSS file
# my-project.scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 120, 141,   # ALL sizes from Figma
  $font-sizes: 16, 120,                  # ALL font sizes from Figma
  $build-class: true
);

# 3. Compile
npx sass my-project.scss:my-project.css

# 4. Use in HTML with generated utility classes
<div class="w-141 h-141 p-16 g-8">...</div>

# 5. Or use CSS variables in custom CSS
.my-component {
  width: var(--141);
  padding: var(--16);
  gap: var(--8);
}
```

**The magic:** All sizes scale fluidly across viewport sizes using `clamp()` - no media queries needed!

## 🛠️ Build from Source

```bash
cd packages/eva-css
npm run build        # Build expanded CSS
npm run build:min    # Build minified CSS
npm run watch        # Watch mode for development
```

## 📄 License

MIT © [Michaël Tati](https://ulysse-2029.com/)

## 👨‍💻 Author

**Michaël Tati**
- Portfolio: [ulysse-2029.com](https://ulysse-2029.com/)
- LinkedIn: [linkedin.com/in/mtati](https://www.linkedin.com/in/mtati/)
- Website: [eva-css.xyz](https://eva-css.xyz/)

## 🔗 Related Packages

- [eva-colors](https://www.npmjs.com/package/eva-colors) - OKLCH color utilities
- [eva-css-purge](https://www.npmjs.com/package/eva-css-purge) - CSS optimization tool
