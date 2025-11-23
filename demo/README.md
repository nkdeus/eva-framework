# EVA CSS Framework - Interactive Demo

This demo showcases the EVA CSS Framework with live theme customization using HEX to OKLCH color conversion.

## 🎨 Quick Start

1. **Open the demo**
   ```bash
   # Simply open demo/index.html in your browser
   # Or use a local server:
   npx serve demo
   ```

2. **Try the theme toggle**
   - Click the 🌓 button to switch between light/dark modes
   - Watch all colors smoothly transition

## 🎯 Customizing Colors

### Method 1: Edit the Configuration File

The demo uses `packages/eva-css/eva.config.cjs` for theme configuration:

```javascript
module.exports = {
  theme: {
    name: 'demo',
    colors: {
      // Use HEX colors from your design system
      brand: '#ff5733',    // Primary color
      accent: '#7300ff',   // Secondary color
      extra: '#ffe500',    // Tertiary color
      dark: '#1a1a2e',     // Dark backgrounds/text
      light: '#f8f9fa'     // Light backgrounds/text
    }
  }
};
```

**After changing colors:**

```bash
cd packages/eva-css
npm run build
cp dist/eva.css ../../demo/styles/demo.css
```

Refresh your browser to see the changes!

### Method 2: Use OKLCH Values Directly

For precise control, use OKLCH format:

```javascript
colors: {
  brand: {
    lightness: 68,    // 0-100 (perceived brightness)
    chroma: 0.21,     // 0-0.4 (color intensity)
    hue: 33.69        // 0-360 (color angle)
  }
}
```

## 🎨 Color Palette Examples

### Vibrant & Modern
```javascript
colors: {
  brand: '#ff5733',    // Coral red
  accent: '#7300ff',   // Electric purple
  extra: '#ffe500',    // Sunny yellow
  dark: '#1a1a2e',     // Deep navy
  light: '#f8f9fa'     // Soft white
}
```

### Professional & Elegant
```javascript
colors: {
  brand: '#2563eb',    // Royal blue
  accent: '#7c3aed',   // Purple
  extra: '#0891b2',    // Cyan
  dark: '#1e293b',     // Slate dark
  light: '#f1f5f9'     // Slate light
}
```

### Warm & Inviting
```javascript
colors: {
  brand: '#ea580c',    // Orange
  accent: '#dc2626',   // Red
  extra: '#facc15',    // Amber
  dark: '#292524',     // Stone dark
  light: '#fafaf9'     // Stone light
}
```

### Cool & Minimal
```javascript
colors: {
  brand: '#06b6d4',    // Cyan
  accent: '#8b5cf6',   // Violet
  extra: '#10b981',    // Emerald
  dark: '#18181b',     // Zinc dark
  light: '#fafafa'     // Zinc light
}
```

## 🔧 How It Works

### 1. Configuration Loading
EVA CSS reads `eva.config.cjs` and detects HEX color strings.

### 2. HEX to OKLCH Conversion
Using the `@eva/colors` package (powered by Culori), HEX colors are converted to OKLCH:

```javascript
'#ff5733' → { lightness: 68, chroma: 0.21, hue: 33.69 }
```

### 3. SCSS Generation
The build script generates SCSS variables:

```scss
$theme-colors: (
  'brand': (68% 0.21 33.69),
  'accent': (51.7% 0.293 289.66),
  // ...
);
```

### 4. CSS Output
The compiled CSS includes your theme:

```css
.theme-demo {
  --brand-lightness: 68%;
  --brand-chroma: 0.21;
  --brand-hue: 33.69;
  /* ... */
}
```

### 5. HTML Usage
Your HTML simply uses the theme class:

```html
<body class="current-theme theme-demo">
  <div class="_bg-brand _c-light">
    Styled with your custom colors!
  </div>
</body>
```

## 🎭 Theme Switching

### Manual Toggle (Default)
```javascript
// eva.config.cjs
theme: {
  autoSwitch: false  // Use .toggle-theme class
}
```

```html
<!-- Toggle button -->
<button onclick="document.body.classList.toggle('toggle-theme')">
  🌓 Toggle Theme
</button>
```

### Automatic (System Preference)
```javascript
// eva.config.cjs
theme: {
  autoSwitch: true  // Respects prefers-color-scheme
}
```

The theme will automatically match the user's system dark/light mode preference.

## 📊 Available Color Classes

### Background Colors
```html
<div class="_bg-brand">Primary background</div>
<div class="_bg-accent">Secondary background</div>
<div class="_bg-extra">Tertiary background</div>
<div class="_bg-dark">Dark background</div>
<div class="_bg-light">Light background</div>
```

### Text Colors
```html
<p class="_c-brand">Primary text</p>
<p class="_c-accent">Secondary text</p>
<p class="_c-extra">Tertiary text</p>
```

### Opacity Variations
```html
<div class="_bg-brand_">65% opacity</div>
<div class="_bg-brand__">35% opacity</div>
<div class="_bg-brand___">15% opacity</div>
```

### Brightness Variations
```html
<div class="_bg-brand-d">Darker (-5%)</div>
<div class="_bg-brand-b">Brighter (+10%)</div>
<div class="_bg-brand-d_">Much darker (-15%)</div>
<div class="_bg-brand-b_">Much brighter (+30%)</div>
```

## 🎨 Getting Colors from Figma

1. **Select your color in Figma**
2. **Copy the HEX value** (e.g., `#FF5733`)
3. **Paste it into `eva.config.cjs`**:
   ```javascript
   colors: {
     brand: '#FF5733'  // Paste directly!
   }
   ```
4. **Rebuild and refresh**

EVA automatically handles the conversion to OKLCH for perceptually uniform colors!

## 🚀 Advanced: Understanding OKLCH

OKLCH is a perceptually uniform color space that provides:

- **Better gradients**: No muddy middle colors
- **Consistent brightness**: Same lightness = same perceived brightness
- **Wider gamut**: Access to more vivid colors on modern displays
- **Accessibility**: Easier to maintain contrast ratios

### Why HEX to OKLCH?

1. **Designers use HEX** (Figma, Sketch, Adobe XD)
2. **Browsers understand OKLCH** (modern CSS)
3. **EVA bridges the gap** automatically

You get the best of both worlds: familiar HEX input, superior OKLCH output.

## 📁 Demo Structure

```
demo/
├── index.html           # Main demo page
├── styles/
│   └── demo.css        # Compiled EVA CSS (copied from packages/eva-css/dist/)
└── README.md           # This file

packages/eva-css/
├── eva.config.cjs      # Theme configuration (edit this!)
├── src/                # SCSS source files
└── dist/
    └── eva.css         # Compiled output (copy to demo/styles/)
```

## 🎯 Next Steps

1. **Experiment with colors** - Try different HEX values
2. **Test dark mode** - Click the theme toggle
3. **Explore the code** - See how EVA classes work
4. **Build your project** - Use `npm init eva-css` to start fresh

## 📖 Documentation

- [EVA CSS Documentation](../packages/eva-css/README.md)
- [Configuration Guide](../packages/eva-css/eva.config.template.js)
- [Color System Deep Dive](../packages/eva-colors/README.md)

## 💡 Tips

- **Start with your brand color** - Set `brand` first, then build around it
- **Use color theory** - Complementary colors work well for `brand` and `accent`
- **Test accessibility** - Check contrast ratios in both light and dark modes
- **Keep it simple** - 3-5 colors is usually enough

---

Made with ❤️ using EVA CSS Framework
