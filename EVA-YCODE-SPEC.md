# @eva-css/ycode — Package Specification

> Fluid design tokens bridge for yCode. Converts static Tailwind arbitrary values (`text-[32px]`, `p-[24px]`) into fluid `clamp()` values using eva-css calculations.

## What this package does

yCode (visual website builder) stores Tailwind classes like `text-[32px]`, `gap-[48px]`, `pt-[100px]` in a database per layer. These are static pixel values.

This package generates a **bridge CSS file** that overrides those Tailwind arbitrary classes with eva-css fluid `clamp()` values — making every pixel value automatically responsive.

The user configures their Figma design tokens (sizes), chooses a fluid intensity, and gets a CSS file that plugs into yCode. No changes needed to the yCode editor workflow.

---

## Architecture

```
Figma tokens (sizes: [4, 8, 16, 24, 32, 48, 64, 96, 100, 120, 140])
        │
        ▼
  @eva-css/ycode generate
        │
        ▼
  bridge.css
    ├── :root CSS vars (clamp) — 5 intensities per size
    ├── TW arbitrary class overrides (default intensity)
    └── [data-eva] intensity selectors (per-section override)
        │
        ▼
  yCode loads bridge.css after Tailwind
        │
        ▼
  .text-[32px] → font-size: var(--32) → clamp(1.56rem, 1.33vw + 1.22rem, 2.67rem)
```

---

## Package structure

```
packages/eva-ycode/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Public API: generateBridge(config)
│   ├── generator.ts      # Core CSS generation logic
│   ├── clamp.ts          # Clamp math (ported from _eva.scss)
│   └── types.ts          # EvaYcodeConfig interface
├── cli.ts                # CLI entrypoint
├── dist/                 # Build output
└── README.md
```

### package.json

```json
{
  "name": "@eva-css/ycode",
  "version": "1.0.0",
  "description": "Fluid design tokens bridge for yCode — converts Tailwind pixel values to clamp()",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "bin": {
    "eva-ycode": "dist/cli.js"
  },
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "keywords": ["eva-css", "ycode", "tailwind", "fluid", "clamp", "responsive"],
  "license": "MIT"
}
```

Zero runtime dependencies. Pure CSS string generation.

---

## Config type

```typescript
interface EvaYcodeConfig {
  /** Spacing sizes in px from Figma tokens */
  sizes: number[];
  /** Font sizes in px from Figma tokens */
  fontSizes: number[];
  /** Reference screen width (default: 1440) */
  screen?: number;
  /** Spacing ratio multiplier — phi (default: 1.618) */
  phi?: number;
  /** Font ratio multiplier (default: 1.3) */
  fontPhi?: number;
  /** Min fluid factor (default: 0.5) */
  min?: number;
  /** Max fluid factor (default: 1) */
  max?: number;
  /** Default intensity: "max" | "strong" | "normal" | "soft" | "min" (default: "normal") */
  defaultIntensity?: Intensity;
}

type Intensity = 'max' | 'strong' | 'normal' | 'soft' | 'min';
```

---

## Generated CSS — 3 sections

### Section A — CSS custom properties

For each size in `config.sizes` and `config.fontSizes`, generate 5 intensity variants.

```css
:root {
  /* ---- 4px ---- */
  --4--: clamp(...);
  --4-:  clamp(...);
  --4:   clamp(...);
  --4_:  clamp(...);
  --4__: clamp(...);

  /* ---- 32px ---- */
  --32--: clamp(1.11rem, 2.22vw + 0.56rem, 4.44rem);  /* max fluid */
  --32-:  clamp(1.33rem, 1.78vw + 0.89rem, 3.56rem);  /* strong */
  --32:   clamp(1.56rem, 1.33vw + 1.22rem, 2.67rem);  /* normal */
  --32_:  clamp(1.67rem, 0.89vw + 1.44rem, 2.22rem);  /* soft */
  --32__: clamp(1.78rem, 0.44vw + 1.67rem, 2rem);     /* minimal */

  /* ---- 48px ---- */
  --48--: clamp(...);
  --48-:  clamp(...);
  --48:   clamp(...);
  --48_:  clamp(...);
  --48__: clamp(...);

  /* ... repeat for every size and fontSize */
}
```

**Intensity naming map:**

| Intensity | CSS var suffix | `data-eva` value | Description |
|-----------|---------------|------------------|-------------|
| Max fluid | `--` | `max` | Biggest range, most responsive |
| Strong | `-` | `strong` | |
| Normal | *(none)* | *(default)* | Balanced |
| Soft | `_` | `soft` | |
| Minimal | `__` | `min` | Smallest range, near-static |

**Critical**: The clamp() math must match exactly what `_eva.scss` produces. Port the formulas from `getVW()`, `getFinalMinRem()`, `getMaxRem()` in `packages/eva-css/src/_eva.scss`.

```typescript
// src/clamp.ts — pseudo-code
function generateClamp(
  sizePx: number,
  screen: number,    // 1440
  phi: number,       // 1.618 for spacing, 1.3 for fonts
  min: number,       // 0.5
  max: number,       // 1.0
  intensity: Intensity
): string {
  const percent = (sizePx / screen) * 100;

  // Apply intensity modifier using phi ratio
  // Port exact logic from _eva.scss here
  // Each intensity adjusts the min/max bounds differently

  const minRem = round2(/* ... */);
  const vw = round2(/* ... */);
  const offset = round2(/* ... */);
  const maxRem = round2(/* ... */);

  return `clamp(${minRem}rem, ${vw}vw + ${offset}rem, ${maxRem}rem)`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
```

### Section B — Tailwind arbitrary class overrides

For each configured size, generate overrides mapping TW arbitrary pixel classes to the default intensity CSS var.

The properties yCode uses in arbitrary values:

```typescript
const PROPERTY_MAP = {
  // Typography
  'text':       'font-size',

  // Sizing
  'h':          'height',
  'w':          'width',
  'min-h':      'min-height',
  'min-w':      'min-width',
  'max-w':      'max-width',
  'max-h':      'max-height',

  // Padding
  'p':          'padding',
  'px':         'padding-inline',
  'py':         'padding-block',
  'pt':         'padding-top',
  'pr':         'padding-right',
  'pb':         'padding-bottom',
  'pl':         'padding-left',

  // Margin
  'm':          'margin',
  'mx':         'margin-inline',
  'my':         'margin-block',
  'mt':         'margin-top',
  'mr':         'margin-right',
  'mb':         'margin-bottom',
  'ml':         'margin-left',

  // Layout
  'gap':        'gap',

  // Borders
  'rounded':    'border-radius',
};
```

Generated output example for size `32`:

```css
/* ---- 32px ---- */
.text-\[32px\]    { font-size: var(--32) }
.h-\[32px\]       { height: var(--32) }
.w-\[32px\]       { width: var(--32) }
.min-h-\[32px\]   { min-height: var(--32) }
.min-w-\[32px\]   { min-width: var(--32) }
.max-w-\[32px\]   { max-width: var(--32) }
.max-h-\[32px\]   { max-height: var(--32) }
.p-\[32px\]       { padding: var(--32) }
.px-\[32px\]      { padding-inline: var(--32) }
.py-\[32px\]      { padding-block: var(--32) }
.pt-\[32px\]      { padding-top: var(--32) }
.pr-\[32px\]      { padding-right: var(--32) }
.pb-\[32px\]      { padding-bottom: var(--32) }
.pl-\[32px\]      { padding-left: var(--32) }
.m-\[32px\]       { margin: var(--32) }
.mx-\[32px\]      { margin-inline: var(--32) }
.my-\[32px\]      { margin-block: var(--32) }
.mt-\[32px\]      { margin-top: var(--32) }
.mr-\[32px\]      { margin-right: var(--32) }
.mb-\[32px\]      { margin-bottom: var(--32) }
.ml-\[32px\]      { margin-left: var(--32) }
.gap-\[32px\]     { gap: var(--32) }
.rounded-\[32px\] { border-radius: var(--32) }
```

**Also handle `rem` values** — yCode sometimes generates rem-based arbitrary values. Map them to the closest size:

```css
/* 1rem = 16px → --16 */
.gap-\[1rem\]   { gap: var(--16) }
.px-\[1rem\]    { padding-inline: var(--16) }

/* 3rem = 48px → --48 */
.py-\[3rem\]    { padding-block: var(--48) }
```

Only generate overrides for sizes that exist in the config. Unknown pixel values pass through unchanged.

**Also handle responsive prefixes** — yCode uses `max-md:` for mobile:

```css
.max-md\:text-\[36px\]   { @media (width < 48rem) { font-size: var(--36) } }
.max-md\:grid-cols-1      { /* not a size — skip, TW handles it */ }
```

Only override responsive classes where the value is a configured size.

### Section C — Per-section intensity selectors

Allow overriding intensity on any element or ancestor via `data-eva` attribute.

```css
/* ---- Max fluid (--) ---- */
[data-eva="max"] .text-\[32px\]   { font-size: var(--32--) }
[data-eva="max"] .h-\[32px\]      { height: var(--32--) }
[data-eva="max"] .p-\[32px\]      { padding: var(--32--) }
[data-eva="max"] .pt-\[32px\]     { padding-top: var(--32--) }
[data-eva="max"] .pr-\[32px\]     { padding-right: var(--32--) }
[data-eva="max"] .pb-\[32px\]     { padding-bottom: var(--32--) }
[data-eva="max"] .pl-\[32px\]     { padding-left: var(--32--) }
[data-eva="max"] .gap-\[32px\]    { gap: var(--32--) }
[data-eva="max"] .rounded-\[32px\] { border-radius: var(--32--) }
/* ... all properties × all sizes */

/* ---- Strong fluid (-) ---- */
[data-eva="strong"] .text-\[32px\] { font-size: var(--32-) }
/* ... all properties × all sizes */

/* ---- Normal = default, no selector needed (Section B) ---- */

/* ---- Soft fluid (_) ---- */
[data-eva="soft"] .text-\[32px\]  { font-size: var(--32_) }
/* ... all properties × all sizes */

/* ---- Minimal fluid (__) ---- */
[data-eva="min"] .text-\[32px\]   { font-size: var(--32__) }
/* ... all properties × all sizes */
```

**Specificity note**: `[data-eva] .class` (0,1,1) beats `.class` (0,1,0). No `!important` needed.

**Inheritance**: `data-eva` on a `<section>` affects all descendant classes. User can set it on any ancestor.

```html
<!-- Hero: max fluid -->
<section data-eva="max" class="pt-[140px] pb-[140px]">
  <h1 class="text-[56px]">...</h1>  <!-- uses --56-- -->
</section>

<!-- Features: soft fluid -->
<section data-eva="soft" class="pt-[100px] pb-[100px]">
  <p class="text-[16px]">...</p>    <!-- uses --16_ -->
</section>

<!-- Footer: default (normal) -->
<footer class="pt-[48px] pb-[48px]">
  <p class="text-[14px]">...</p>    <!-- uses --14 -->
</footer>
```

---

## CLI

```bash
# Initialize config file
npx @eva-css/ycode init
# → creates eva-ycode.config.cjs:
# module.exports = {
#   sizes: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
#   fontSizes: [12, 14, 16, 18, 20, 24, 32, 48],
#   screen: 1440,
#   defaultIntensity: 'normal',
# };

# Generate bridge.css from config
npx @eva-css/ycode generate
# → writes bridge.css to current directory

# Generate to stdout (for piping or API usage)
npx @eva-css/ycode generate --stdout

# Generate with inline sizes (for programmatic use by yCode)
npx @eva-css/ycode generate --sizes="4,8,16,24,32,48,64,96,100,120,140" --font-sizes="12,14,16,18,20,24,32,48,56" --intensity=normal --stdout
```

---

## Public API

```typescript
import { generateBridge } from '@eva-css/ycode';
import type { EvaYcodeConfig } from '@eva-css/ycode';

const config: EvaYcodeConfig = {
  sizes: [4, 8, 16, 24, 32, 48, 64, 96, 100, 120, 140],
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48, 56],
  screen: 1440,
  defaultIntensity: 'normal',
};

const css: string = generateBridge(config);
// → Complete CSS string ready to inject or write to file
```

---

## How yCode will consume this

### Installation

```bash
npm install @eva-css/ycode
```

### Integration point 1 — Editor canvas

yCode generates CSS client-side using `@tailwindcss/browser` in a hidden iframe. The bridge CSS is appended as a `<style>` block after Tailwind processes, so the overrides take effect.

### Integration point 2 — Published pages

The bridge CSS is stored in the database (alongside `published_css`) and injected as a `<style id="eva-bridge">` tag on every published page, after the Tailwind `<style>`.

### Integration point 3 — Editor UI

yCode will add a "Fluid intensity" dropdown in the layer attributes panel. It sets `data-eva="max|strong|soft|min"` on the selected layer's HTML element. This is immediately testable in the canvas preview because the bridge CSS is loaded.

### Integration point 4 — App settings

yCode has an apps/integrations system at `/ycode/integrations/apps`. Eva CSS will appear as an app where users can:
1. Enter their sizes (from Figma tokens)
2. Choose default intensity
3. Click "Generate" → calls `generateBridge()` → stores CSS in database
4. Toggle fluid on/off globally

---

## Size estimation

For a config with 12 sizes × 23 properties × 5 intensities:
- Section A (vars): ~60 lines
- Section B (default overrides): ~276 lines
- Section C (4 intensity overrides): ~1104 lines
- **Total: ~1440 lines / ~35KB raw / ~6KB gzipped**

---

## Tests to write

1. **Clamp accuracy** — For each size + intensity, compare TS output against known SCSS reference values from `_eva.scss`. They must match exactly.
2. **CSS validity** — Parse generated CSS string, ensure no syntax errors.
3. **Class coverage** — Ensure every TW arbitrary pattern that yCode uses has an override.
4. **Selector specificity** — Verify `[data-eva] .class` beats `.class` without `!important`.
5. **Round-trip** — Given a config, `generateBridge()` → parse → verify all vars and overrides present.
6. **Rem mapping** — `gap-[1rem]` correctly maps to `--16`, `py-[3rem]` to `--48`.
7. **Edge cases** — Size `4` (very small), size `140` (very large), empty config.

---

## Checklist

- [ ] Create `packages/eva-ycode/` in monorepo
- [ ] `src/types.ts` — `EvaYcodeConfig`, `Intensity` types
- [ ] `src/clamp.ts` — Port clamp math from `_eva.scss` to TypeScript
  - [ ] `generateClamp(sizePx, screen, phi, min, max, intensity)` → string
  - [ ] Match SCSS output exactly (write comparison tests first)
- [ ] `src/generator.ts` — Main CSS generation
  - [ ] Section A: `:root` vars (5 intensities × all sizes)
  - [ ] Section B: TW arbitrary class overrides (default intensity)
  - [ ] Section C: `[data-eva]` intensity selectors (4 non-default × all)
  - [ ] Handle `px` and `rem` arbitrary values
  - [ ] Handle `max-md:` responsive prefix overrides
- [ ] `src/index.ts` — Export `generateBridge()` and types
- [ ] `cli.ts` — `init` and `generate` commands
- [ ] Tests (clamp accuracy, CSS validity, class coverage)
- [ ] Build config (tsup: CJS + ESM + types)
- [ ] `package.json` with correct exports, bin, files
- [ ] `README.md` with usage examples
- [ ] Publish `@eva-css/ycode` to npm
