/**
 * eva-css-for-tailwind — API
 *
 * Modular API for eva-css fluid calculations.
 * Each method is independent — compose as needed.
 */

import { generateSpacingClamp, generateFontClamp } from './clamp.js';
import {
  PROPERTY_MAP,
  FONT_PROPERTY_MAP,
  SPACING_INTENSITIES,
  FONT_INTENSITIES,
  resolveConfig,
} from './types.js';
import type {
  EvaYcodeConfig,
  ResolvedConfig,
  Intensity,
  FontIntensity,
} from './types.js';

// ─── parseClass ─────────────────────────────────────────────────

export interface ParsedClass {
  /** Original class string, e.g. "pt-[140px]" */
  raw: string;
  /** TW prefix, e.g. "pt" */
  prefix: string;
  /** CSS property, e.g. "padding-top" */
  property: string;
  /** Size in px, e.g. 140 */
  size: number;
  /** Original unit: "px" or "rem" */
  unit: 'px' | 'rem';
  /** "spacing" or "font" */
  type: 'spacing' | 'font';
}

/**
 * Parse a Tailwind arbitrary class into its components.
 *
 * @example
 * parseClass('pt-[140px]')
 * // → { raw: 'pt-[140px]', prefix: 'pt', property: 'padding-top', size: 140, unit: 'px', type: 'spacing' }
 */
export function parseClass(className: string): ParsedClass | null {
  const match = className.match(/^(.+)-\[(\d+(?:\.\d+)?)(px|rem)\]$/);
  if (!match) return null;

  const [, prefix, valueStr, unit] = match;
  const value = parseFloat(valueStr);

  // Check font properties first
  if (prefix in FONT_PROPERTY_MAP) {
    const sizePx = unit === 'rem' ? value * 16 : value;
    return {
      raw: className,
      prefix,
      property: FONT_PROPERTY_MAP[prefix],
      size: sizePx,
      unit: unit as 'px' | 'rem',
      type: 'font',
    };
  }

  // Check spacing properties
  if (prefix in PROPERTY_MAP) {
    const sizePx = unit === 'rem' ? value * 16 : value;
    return {
      raw: className,
      prefix,
      property: PROPERTY_MAP[prefix],
      size: sizePx,
      unit: unit as 'px' | 'rem',
      type: 'spacing',
    };
  }

  return null;
}

// ─── generateClamp ──────────────────────────────────────────────

/**
 * Generate a single clamp() value.
 *
 * @example
 * generateClamp(32, 'spacing', '__')
 * // → "clamp(0.5rem, 3.16vw - 1.11rem, 2.22rem)"
 */
export function generateClamp(
  sizePx: number,
  type: 'spacing' | 'font',
  intensity?: Intensity | FontIntensity,
  config?: Partial<EvaYcodeConfig>
): string {
  const cfg = resolveConfig({
    sizes: [],
    fontSizes: [],
    ...config,
  });

  if (type === 'font') {
    return generateFontClamp(
      sizePx,
      cfg.screen,
      cfg.fontPhi,
      cfg.fontMin,
      cfg.max,
      (intensity ?? '') as FontIntensity
    );
  }

  return generateSpacingClamp(
    sizePx,
    cfg.screen,
    cfg.phi,
    cfg.min,
    cfg.max,
    cfg.ez,
    (intensity ?? '') as Intensity
  );
}

// ─── generateVars ───────────────────────────────────────────────

/**
 * Generate :root CSS custom properties for all configured sizes.
 * Always complete — these vars are used by the nocode UI.
 *
 * @example
 * generateVars({ sizes: [16, 32], fontSizes: [16] })
 * // → ":root { --16__: clamp(...); --16_: ...; --16: ...; --16-: ...; --fs-16__: ...; }"
 */
export function generateVars(config: EvaYcodeConfig): string {
  const cfg = resolveConfig(config);
  const lines: string[] = [':root {'];

  // Spacing vars — 4 intensities per size
  for (const size of cfg.sizes) {
    lines.push(`  /* ---- ${size}px ---- */`);
    for (const intensity of SPACING_INTENSITIES) {
      const clamp = generateSpacingClamp(
        size, cfg.screen, cfg.phi, cfg.min, cfg.max, cfg.ez, intensity
      );
      lines.push(`  --${size}${intensity}: ${clamp};`);
    }
    lines.push('');
  }

  // Font-size vars — 3 intensities per size
  for (const size of cfg.fontSizes) {
    lines.push(`  /* ---- fs-${size}px ---- */`);
    for (const intensity of FONT_INTENSITIES) {
      const clamp = generateFontClamp(
        size, cfg.screen, cfg.fontPhi, cfg.fontMin, cfg.max, intensity
      );
      lines.push(`  --fs-${size}${intensity}: ${clamp};`);
    }
    lines.push('');
  }

  lines.push('}');
  return lines.join('\n');
}

// ─── generateClassOverrides ─────────────────────────────────────

function escapeTwClass(prefix: string, value: string, suffix: string): string {
  return `.${prefix}-\\[${value}\\]${suffix}`;
}

/**
 * Generate CSS overrides for specific Tailwind arbitrary classes.
 * Each class gets its default + all intensity variants.
 *
 * @example
 * generateClassOverrides(['p-[32px]', 'text-[48px]'])
 * // → ".p-\\[32px\\] { padding: var(--32) }\n.p-\\[32px\\]__ { padding: var(--32__) }\n..."
 */
export function generateClassOverrides(
  classes: string[],
  config?: Partial<EvaYcodeConfig>
): string {
  const cfg = resolveConfig({ sizes: [], fontSizes: [], ...config });
  const lines: string[] = [];

  for (const cls of classes) {
    const parsed = parseClass(cls);
    if (!parsed) continue;

    const valueStr = parsed.unit === 'rem'
      ? `${parsed.size / 16}rem`
      : `${parsed.size}px`;

    if (parsed.type === 'font') {
      // Font: 3 intensities
      for (const intensity of FONT_INTENSITIES) {
        const varRef = `var(--fs-${parsed.size}${intensity})`;
        const selector = escapeTwClass(parsed.prefix, valueStr, intensity);
        lines.push(`${selector} { ${parsed.property}: ${varRef} }`);
      }
    } else {
      // Spacing: 4 intensities
      for (const intensity of SPACING_INTENSITIES) {
        const varRef = `var(--${parsed.size}${intensity})`;
        const selector = escapeTwClass(parsed.prefix, valueStr, intensity);
        lines.push(`${selector} { ${parsed.property}: ${varRef} }`);
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}

// ─── generateTheme ──────────────────────────────────────────────

/**
 * Generate a TW4 @theme block mapping native utilities to eva vars.
 * Use this if your project uses named utilities (p-32) instead of arbitrary values (p-[32px]).
 *
 * @example
 * generateTheme({ sizes: [16, 32], fontSizes: [16] })
 * // → "@theme { --spacing-16: var(--16); --spacing-32: var(--32); --font-size-16: var(--fs-16); }"
 */
export function generateTheme(config: EvaYcodeConfig): string {
  const cfg = resolveConfig(config);
  const lines: string[] = ['@theme {'];

  for (const size of cfg.sizes) {
    lines.push(`  --spacing-${size}: var(--${size}${cfg.defaultIntensity});`);
  }

  if (cfg.sizes.length > 0 && cfg.fontSizes.length > 0) {
    lines.push('');
  }

  const fontSuffix = cfg.defaultIntensity === '-'
    ? '' : cfg.defaultIntensity as FontIntensity;
  for (const size of cfg.fontSizes) {
    lines.push(`  --font-size-${size}: var(--fs-${size}${fontSuffix});`);
  }

  lines.push('}');
  return lines.join('\n');
}

// ─── generateBridge (all-in-one for CLI) ────────────────────────

/**
 * Generate a complete CSS bridge — vars + theme + class overrides.
 * Shortcut for CLI usage. For programmatic use, prefer individual methods.
 */
export function generateBridge(
  config: EvaYcodeConfig & { classes?: string[] }
): string {
  const sections = [
    '/* =============================================================',
    '   EVA CSS — Tailwind Fluid Bridge',
    '   Generated by eva-css-for-tailwind',
    '   ============================================================= */',
    '',
    generateVars(config),
  ];

  // @theme block if no specific classes provided (full bridge mode)
  if (!config.classes) {
    sections.push('');
    sections.push(generateTheme(config));
  }

  // Class overrides
  if (config.classes && config.classes.length > 0) {
    sections.push('');
    sections.push(generateClassOverrides(config.classes, config));
  }

  return sections.join('\n');
}
