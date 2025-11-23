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

## 🚦 Which Configuration Method Should I Use?

EVA CSS can be configured in two ways. **Choose based on your project needs:**

### For Quick Start / Learning
👉 **Use SCSS Variables** - Everything in one file, works immediately

### For Production Projects
Choose based on your needs:

| You want... | Use... |
|-------------|--------|
| Simplicity, no build scripts | **SCSS Variables** (`@use ... with ()`) |
| Centralized config, multiple SCSS files | **JSON Config** (requires custom build script) |
| Watch mode without complexity | **SCSS Variables** |
| Config validation, better DX | **JSON Config** (requires custom build script) |

💡 **You can start with SCSS variables and migrate to JSON later - the generated CSS is identical!**

### Option Comparison

| Feature | SCSS Variables | JSON Config |
|---------|----------------|-------------|
| **Setup complexity** | ⭐ Simple | ⭐⭐⭐ Requires script |
| **Works with `npx sass`** | ✅ Yes, immediately | ⚠️ No, needs custom script |
| **Config location** | Inside SCSS file | Separate `eva.config.cjs` |
| **Multiple SCSS files** | ⚠️ Config duplicated | ✅ Shared config |
| **Validation** | ❌ No | ✅ `npx eva-css validate` |
| **Generated CSS** | ✅ Identical output | ✅ Identical output |

**See detailed workflows below** for implementation examples.

## 🚀 Quick Start

### New Project (Recommended)

Get started instantly with a fully configured project:

```bash
npm init eva-css my-project
cd my-project
npm install
npm run dev
```

This scaffolds a complete EVA CSS project with:
- ✅ Pre-configured `eva.config.cjs`
- ✅ Example HTML and SCSS files
- ✅ Build scripts with purge support
- ✅ Ready to customize with your design sizes

**Choose from 3 templates:**
- **Minimal** - Variables only, no utilities
- **Utility** - Full utility classes (recommended)
- **Full** - Everything + examples + theme switching

### Using Pre-built CSS

```html
<link rel="stylesheet" href="node_modules/eva-css-fluid/dist/eva.css">
```

### Using SCSS with Default Configuration

**Simple import** (Sass automatically finds the package in node_modules):

```scss
@use 'eva-css-fluid';
```

**Or with explicit path** (if needed):

```scss
@use 'eva-css-fluid/src' as *;
```

**Compilation** (no --load-path needed!):

```bash
# Simple - Sass finds the package automatically
npx sass styles/main.scss:styles/main.css

# Or with older Sass versions
npx sass --load-path=node_modules styles/main.scss:styles/main.css
```

### Using SCSS with Custom Configuration

**This is the main feature of EVA CSS!** Extract sizes from your design and configure EVA to generate only what you need.

#### Option 1: SCSS Variables (Recommended for Beginners)

**Direct configuration in your SCSS file** - Works immediately with `npx sass`:

```scss
// Example: Sizes extracted from Figma design
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 128,        // 👈 Change these to YOUR design sizes!
  $font-sizes: 14, 16, 20, 24, 32,      // 👈 Change these to YOUR font sizes!
  $build-class: true,
  $px-rem-suffix: false
);
```

**Compile immediately:**

```bash
npx sass --load-path=node_modules styles/main.scss:styles/main.css
```

✅ **Advantages:**
- Works immediately with standard Sass compilation
- No additional build scripts needed
- Perfect for watch mode: `npx sass --watch ...`
- Great for learning and simple projects

⚠️ **Note:** If you import EVA in multiple SCSS files, you'll need to duplicate the configuration.

#### Option 2: JSON Configuration (Advanced - Requires Build Script)

**Centralized configuration file** - Better for complex projects with multiple SCSS files:

Create `eva.config.cjs` in your project root:

```javascript
// eva.config.cjs
module.exports = {
  sizes: [4, 8, 16, 32, 64, 128],        // 👈 Change these to YOUR design sizes!
  fontSizes: [14, 16, 20, 24, 32],       // 👈 Change these to YOUR font sizes!
  buildClass: true,
  pxRemSuffix: false
};
```

Then in your SCSS:

```scss
@use 'eva-css-fluid';
```

⚠️ **IMPORTANT:** JSON configuration requires a **custom build script** to work. SCSS cannot execute JavaScript directly.

**You have two choices:**

**A) Use the EVA package's build script** (for building EVA itself):
```bash
# This is only for building the EVA CSS package itself, NOT for your project
cd node_modules/eva-css-fluid
npm run build
```

**B) Create your own build script** (recommended for user projects):

1. Copy the build script template:
   ```bash
   # Download the template (see examples/ folder for ready-to-use script)
   curl -o scripts/build-eva.js https://raw.githubusercontent.com/nkdeus/eva/main/examples/user-scripts/build-with-config.js
   ```

2. Add npm script to your `package.json`:
   ```json
   {
     "scripts": {
       "build:css": "node scripts/build-eva.js styles/main.scss dist/main.css"
     }
   }
   ```

3. Build your CSS:
   ```bash
   npm run build:css
   ```

✅ **Advantages:**
- Single config file shared across multiple SCSS files
- Config validation with `npx eva-css validate`
- Cleaner SCSS files
- Better for large projects

⚠️ **Disadvantages:**
- Requires custom build script setup
- More complex workflow
- Not compatible with standard `npx sass` command

💡 **New to EVA CSS?** Start with **Option 1 (SCSS Variables)** and migrate to JSON config later if needed!

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

## ❓ FAQ - Configuration

### Q: Why doesn't `@use 'eva-css-fluid'` automatically load `eva.config.cjs`?

**A:** SCSS cannot execute JavaScript during compilation. The `eva.config.cjs` file must be read **before** SCSS compilation and transformed into SCSS variables.

**Solutions:**
- **Simple:** Use `@use ... with ()` directly in your SCSS (no script needed)
- **Advanced:** Create a build script that reads the config and injects it into SCSS (see Option 2 above)

### Q: What's the difference between "JSON config" and "SCSS variables"?

**A:** The generated CSS is **100% identical**. It's only a matter of workflow organization:

| Method | Configuration Location | Compilation Command |
|--------|----------------------|---------------------|
| SCSS Variables | Inside SCSS file with `@use ... with ()` | `npx sass styles.scss` |
| JSON Config | Separate `eva.config.cjs` file | Custom script required |

**Choose based on your workflow:**
- **Simple projects:** SCSS variables (quick and easy)
- **Complex projects with multiple SCSS files:** JSON config (shared configuration)

### Q: Can I use the `scripts/build-with-config.cjs` from the eva-css package?

**A:** That script is designed to **build EVA CSS itself** (the framework), not your project.

For your project, you need to:
1. Create your own build script (see template in `examples/user-scripts/`)
2. Or use SCSS variables with `@use ... with ()` instead

### Q: Which option should I use for my project?

**A:** Follow this decision tree:

```
Do you have multiple SCSS files that need the same EVA config?
├─ NO  → Use SCSS Variables (simpler)
└─ YES → Do you want config validation and centralized settings?
    ├─ YES → Use JSON Config (requires build script setup)
    └─ NO  → Use SCSS Variables (simpler, just duplicate config)
```

### Q: Can I migrate from SCSS variables to JSON config later?

**A:** Yes! Since both methods generate identical CSS, you can switch at any time:

1. Create `eva.config.cjs` with your settings
2. Set up a build script (see examples/)
3. Update your SCSS from `@use ... with ()` to `@use 'eva-css-fluid'`
4. Update your build command

No CSS changes needed!

## 🎨 Configuration Options

### JSON Configuration (eva.config.cjs or package.json)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sizes` | `number[]` | `[4, 8, 12, 16, ...]` | Available fluid size values (must include 16) |
| `fontSizes` | `number[]` | `[12, 14, 16, ...]` | Available font sizes |
| `buildClass` | `boolean` | `true` | Generate utility classes or variables only |
| `pxRemSuffix` | `boolean` | `false` | Add px/rem static values for debugging |
| `nameBySize` | `boolean` | `true` | Use size values in variable names |
| `customClass` | `boolean` | `false` | Enable custom class filtering |
| `classConfig` | `object` | `{}` | Map of properties to sizes for custom classes |
| `debug` | `boolean` | `false` | Show configuration summary during compilation |
| **`theme.name`** | `string` | `'eva'` | Theme name (CSS class: `.theme-{name}`) |
| **`theme.colors`** | `object` | See below | Theme colors (HEX or OKLCH) |
| **`theme.lightMode`** | `object` | `{lightness:96.4, darkness:6.4}` | Light mode configuration |
| **`theme.darkMode`** | `object` | `{lightness:5, darkness:95}` | Dark mode configuration |
| **`theme.autoSwitch`** | `boolean` | `false` | Auto-switch based on prefers-color-scheme |
| `purge.enabled` | `boolean` | `false` | Enable CSS purging/tree-shaking |
| `purge.content` | `string[]` | `['**/*.{html,js,...}']` | Files to scan for used classes |
| `purge.css` | `string` | `'dist/eva.css'` | Input CSS file to purge |
| `purge.output` | `string` | `'dist/eva-purged.css'` | Output path for purged CSS |
| `purge.safelist` | `string[]` | `['theme-', ...]` | Classes/patterns to always keep |

#### Theme Colors Configuration

Define your theme colors in HEX (auto-converted to OKLCH) or OKLCH format:

```javascript
// eva.config.cjs
module.exports = {
  theme: {
    name: 'myapp',
    colors: {
      // HEX format (from Figma, design tools, etc.)
      brand: '#ff5733',    // Automatically converted to OKLCH
      accent: '#7300ff',
      extra: '#ffe500',

      // Or OKLCH format (for precise control)
      dark: { lightness: 20, chroma: 0.05, hue: 200 },
      light: { lightness: 95, chroma: 0.01, hue: 200 }
    },
    lightMode: {
      lightness: 96.4,   // Light background
      darkness: 6.4      // Dark text
    },
    darkMode: {
      lightness: 5,      // Dark background
      darkness: 95       // Light text
    },
    autoSwitch: false    // Manual toggle with .toggle-theme class
  }
};
```

**Available colors:** `brand`, `accent`, `extra`, `dark`, `light`

**Color formats:**
- **HEX**: `"#ff5733"` - Automatically converted via eva-colors
- **OKLCH**: `{ lightness: 68, chroma: 0.21, hue: 33.69 }`

**Usage in HTML:**

```html
<body class="current-theme theme-myapp">
  <h1 class="_c-brand">Hello World</h1>

  <button onclick="document.body.classList.toggle('toggle-theme')">
    Toggle Dark Mode
  </button>
</body>
```

**Configuration Priority:**
1. JSON config file (`eva.config.cjs` or `eva.config.js`)
2. package.json `"eva"` key
3. SCSS `@use ... with ()` variables

### SCSS Variables (when using @use with)

| Variable | Default | Description |
|----------|---------|-------------|
| `$sizes` | `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` | Available fluid size values |
| `$font-sizes` | `12, 14, 16, 18, 20, 24, 32, 48` | Available font sizes |
| `$build-class` | `true` | Generate utility classes (`true`) or variables only (`false`) |
| `$px-rem-suffix` | `false` | Add px/rem static values for debugging |
| `$name-by-size` | `true` | Use size values in variable names |
| `$custom-class` | `false` | Enable custom class filtering |
| `$class-config` | `()` | Map of properties to sizes when `$custom-class: true` |
| `$debug` | `false` | Show class generation summary during compilation |

### CLI Commands

```bash
# Validate your configuration
npx eva-css validate

# Generate SCSS variables from JSON config
npx eva-css generate

# Get help
npx eva-css help
```

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

### Pre-configured Entry Points

EVA CSS provides multiple entry points for different use cases:

```scss
// Full framework (default) - Everything included
@use 'eva-css-fluid';

// Variables only - Just CSS variables, no utility classes
@use 'eva-css-fluid/variables';

// Core framework - Variables + reset + typography, no utilities
@use 'eva-css-fluid/core';

// Colors only - Just the OKLCH color system
@use 'eva-css-fluid/colors';
```

**When to use each:**
- **Default** (`eva-css-fluid`): Full-featured projects with utility classes
- **Variables** (`eva-css-fluid/variables`): Building custom components
- **Core** (`eva-css-fluid/core`): Foundation + custom utilities
- **Colors** (`eva-css-fluid/colors`): Adding EVA colors to existing projects

### Debug Mode

Enable debug mode to see a summary of your configuration during compilation:

```scss
@use 'eva-css-fluid' with (
  $sizes: (16, 24, 50, 100),
  $debug: true  // ← Shows configuration summary
);
```

**Output example:**
```
╔══════════════════════════════════════════════════════════════
║ EVA CSS - Configuration Summary
╠══════════════════════════════════════════════════════════════
║ Sizes: 16, 24, 50, 100
║ Total sizes: 4
║ Font sizes: 16, 24
║ Total font sizes: 2
╠══════════════════════════════════════════════════════════════
║ Build Configuration:
║   - Build classes: true
║   - Custom class mode: false
║   - Px/Rem suffix: false
║   - Name by size: true
╠══════════════════════════════════════════════════════════════
║ Estimated Utility Classes:
║   - Size properties: ~256 classes
║   - Available properties: w, mw, h, p, px, pr, py, br, mb, mr, ml, mt, pt, pb, g, gap
╚══════════════════════════════════════════════════════════════
```

Perfect for understanding what's being generated and optimizing your configuration!

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

## 🗜️ Production Optimization (Tree-shaking)

EVA CSS includes automatic CSS purging to remove unused classes in production builds.

### Enable in Configuration

```javascript
// eva.config.cjs
module.exports = {
  sizes: [16, 24, 32, 64],
  fontSizes: [16, 24, 32],
  purge: {
    enabled: true,                          // Enable purging
    content: ['src/**/*.{html,js,jsx,tsx}'], // Files to scan
    css: 'dist/eva.css',                    // Input CSS
    output: 'dist/eva-purged.css',          // Output CSS
    safelist: ['theme-', 'current-']        // Classes to keep
  }
};
```

### Build with Purge

```bash
# Build with purge (if enabled in config)
npm run build

# Or force purge via CLI flag
npm run build:purge
```

**Results:** Typically reduces CSS file size by 60-90% depending on usage.

### Manual Purge with eva-purge

For more control, use the standalone `eva-purge` package:

```bash
# Install
npm install --save-dev eva-css-purge

# Run purge
npx eva-purge --css dist/eva.css --content "src/**/*.html"

# Or use eva.config.cjs
npx eva-purge --config eva.config.cjs
```

See [eva-purge documentation](https://www.npmjs.com/package/eva-css-purge) for more options.

## 🛠️ Build from Source

```bash
cd packages/eva-css
npm run build        # Build with config (includes purge if enabled)
npm run build:min    # Build minified CSS
npm run build:purge  # Build with purge (force)
npm run build:sass   # Build without config (pure SCSS)
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
