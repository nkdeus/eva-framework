# eva-css-for-tailwind

> Fluid design tokens bridge for Tailwind CSS 4 — converts static arbitrary values (`text-[32px]`, `p-[24px]`) into fluid `clamp()` values using eva-css calculations.

## Features

- **Zero runtime dependencies** — pure CSS string generation
- **Modular API** — use only what you need, compose freely
- **Exact match** with eva-css SCSS clamp calculations
- **4 fluid intensities** — extreme (`__`), strong (`_`), normal, light (`-`)
- **Per-property intensity** — `p-[32px]__` for extreme padding, `gap-[16px]-` for light gap
- **Spacing + font-size** — separate phi ratios, separate CSS vars (`--{size}` / `--fs-{size}`)
- **TW4 @theme support** — native utilities (`p-32`) via `generateTheme()`
- **CLI + programmatic API**

## Installation

```bash
npm install eva-css-for-tailwind
```

## API

### `generateVars(config)`

Generate all CSS custom properties. Always complete — these vars are used by the nocode UI.

```typescript
import { generateVars } from 'eva-css-for-tailwind';

const css = generateVars({
  sizes: [4, 8, 16, 24, 32, 48, 64, 96],
  fontSizes: [12, 14, 16, 18, 24, 32, 48],
});
```

```css
:root {
  --32__: clamp(0.5rem, 3.16vw - 1.11rem, 2.22rem);   /* extreme */
  --32_:  clamp(0.69rem, 1.67vw + 0.5rem, 2.22rem);    /* strong */
  --32:   clamp(1.11rem, 1.11vw + 1rem, 2.22rem);       /* normal */
  --32-:  clamp(1.8rem, 0.56vw + 1.5rem, 2.22rem);      /* light */

  --fs-32__: clamp(0.85rem, 1.67vw + 0.5rem, 2.22rem);
  --fs-32_:  clamp(1.11rem, 1.11vw + 1rem, 2.22rem);
  --fs-32:   clamp(1.44rem, 0.56vw + 1.5rem, 2.22rem);
}
```

### `generateClassOverrides(classes)`

Generate CSS overrides for specific Tailwind arbitrary classes. Each class gets all its intensity variants. Only generates what you need.

```typescript
import { generateClassOverrides } from 'eva-css-for-tailwind';

const css = generateClassOverrides([
  'p-[32px]',
  'text-[48px]',
  'gap-[16px]',
]);
```

```css
/* Default + intensity variants per class */
.p-\[32px\]   { padding: var(--32) }
.p-\[32px\]__ { padding: var(--32__) }
.p-\[32px\]_  { padding: var(--32_) }
.p-\[32px\]-  { padding: var(--32-) }

.text-\[48px\]   { font-size: var(--fs-48) }
.text-\[48px\]__ { font-size: var(--fs-48__) }
.text-\[48px\]_  { font-size: var(--fs-48_) }

.gap-\[16px\]   { gap: var(--16) }
.gap-\[16px\]__ { gap: var(--16__) }
.gap-\[16px\]_  { gap: var(--16_) }
.gap-\[16px\]-  { gap: var(--16-) }
```

Per-property intensity control directly in the class name:

```html
<section class="pt-[140px]__ pb-[140px] gap-[32px]-">
  <!--  pt = extreme | pb = normal | gap = light  -->
  <h1 class="text-[48px]_">Strong fluid font</h1>
</section>
```

### `generateTheme(config)`

Generate a TW4 `@theme` block mapping native utilities to eva vars. Use this if your project uses named utilities (`p-32`) instead of arbitrary values (`p-[32px]`).

```typescript
import { generateTheme } from 'eva-css-for-tailwind';

const css = generateTheme({
  sizes: [16, 32, 48],
  fontSizes: [16, 32],
});
```

```css
@theme {
  --spacing-16: var(--16);
  --spacing-32: var(--32);
  --spacing-48: var(--48);

  --font-size-16: var(--fs-16);
  --font-size-32: var(--fs-32);
}
```

### `generateClamp(size, type, intensity)`

Generate a single `clamp()` value. Useful for the nocode UI (preview, inspector...).

```typescript
import { generateClamp } from 'eva-css-for-tailwind';

generateClamp(32, 'spacing');
// → "clamp(1.11rem, 1.11vw + 1rem, 2.22rem)"

generateClamp(32, 'spacing', '__');
// → "clamp(0.5rem, 3.16vw - 1.11rem, 2.22rem)"

generateClamp(16, 'font');
// → "clamp(0.73rem, 0.28vw + 0.75rem, 1.11rem)"
```

### `parseClass(className)`

Parse a Tailwind arbitrary class into its components.

```typescript
import { parseClass } from 'eva-css-for-tailwind';

parseClass('pt-[140px]');
// → { prefix: 'pt', property: 'padding-top', size: 140, unit: 'px', type: 'spacing' }

parseClass('text-[48px]');
// → { prefix: 'text', property: 'font-size', size: 48, unit: 'px', type: 'font' }
```

### `generateBridge(config)`

All-in-one shortcut — generates vars + theme + class overrides. Used by the CLI.

```typescript
import { generateBridge } from 'eva-css-for-tailwind';

// Full bridge (vars + @theme)
const css = generateBridge({
  sizes: [4, 8, 16, 24, 32, 48],
  fontSizes: [12, 16, 24, 32, 48],
});

// With specific classes (vars + class overrides only)
const css = generateBridge({
  sizes: [4, 8, 16, 24, 32, 48],
  fontSizes: [12, 16, 24, 32, 48],
  classes: ['p-[32px]', 'text-[48px]', 'gap-[16px]'],
});
```

## Configuration

```javascript
// eva-tw.config.cjs
module.exports = {
  sizes: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48],
  screen: 1440,
  defaultIntensity: '',
};
```

| Option | Default | Description |
|--------|---------|-------------|
| `sizes` | — | Spacing sizes in px (from Figma tokens) |
| `fontSizes` | — | Font sizes in px (from Figma tokens) |
| `screen` | `1440` | Reference screen width |
| `phi` | `1.618` | Golden ratio for spacing |
| `fontPhi` | `1.3` | Ratio for font scaling |
| `min` | `0.5` | Min fluid factor for spacing |
| `fontMin` | `0.5` | Min fluid factor for fonts |
| `max` | `1` | Max fluid factor |
| `ez` | `142.4` | Extreme intensity factor |
| `defaultIntensity` | `''` | Default: `__`, `_`, `''`, or `-` |

## Intensity Levels

| Suffix | Fluid behavior |
|--------|----------------|
| `__` | Extreme — most responsive, biggest min/max range |
| `_` | Strong |
| *(none)* | Normal — balanced (default) |
| `-` | Light — near-static, smallest range |

Spacing uses all 4 levels. Font-sizes use 3 levels (`__`, `_`, default).

## CLI

```
eva-css-for-tailwind init                        Create eva-tw.config.cjs
eva-css-for-tailwind generate                    Write bridge.css
eva-css-for-tailwind generate --stdout           Output to stdout
eva-css-for-tailwind generate --out=custom.css   Custom output path
eva-css-for-tailwind generate --sizes="4,8,16"   Override sizes inline
eva-css-for-tailwind generate --font-sizes="16"  Override font sizes inline
eva-css-for-tailwind generate --intensity=_      Set default intensity
```

## License

MIT

## Author

EVA CSS Framework

## Links

- [eva-css](https://www.npmjs.com/package/eva-css-fluid) — Core fluid framework
- [eva-colors](https://www.npmjs.com/package/eva-colors) — OKLCH color utilities
- [eva-purge](https://www.npmjs.com/package/eva-css-purge) — CSS optimization
