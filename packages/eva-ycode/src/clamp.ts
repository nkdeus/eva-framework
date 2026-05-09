/**
 * Clamp math — exact port of _eva.scss
 *
 * SCSS source of truth: packages/eva-css/src/_eva.scss
 * Constants: $max=1, $Φ=1.618, $min=0.5, $ez=142.4, $screen=1440
 * Font overrides: $Φ=1.3, $min=0.6
 */

import type { Intensity, FontIntensity } from './types.js';

// ─── Utility functions (match SCSS) ─────────────────────────────

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function getPercent(size: number, screen: number, ratio = 100): number {
  return round2((size / screen) * ratio);
}

function toRem(size: number): number {
  return size / 16;
}

function getMinRem(percent: number, min: number): number {
  return round2(percent * min);
}

function getMaxRem(percent: number, max: number): number {
  return round2(percent * max);
}

function getVW(percent: number): number {
  return round2(percent);
}

function getFinalMinDiv(size: number, ratio: number): number {
  return round2(size / ratio);
}

function getFinalMinMulti(size: number, ratio: number): number {
  return round2(size * ratio);
}

// ─── Fluid expression builders (match SCSS vw-* patterns) ───────

interface FluidParts {
  vw: number;
  offset: number;
}

function vwLight(calcPercent: number, sizeRem: number): FluidParts {
  return {
    vw: round2(getVW(calcPercent) / 4),
    offset: round2(sizeRem / 1.33),
  };
}

function vwMedium(calcPercent: number, sizeRem: number): FluidParts {
  return {
    vw: round2(getVW(calcPercent) / 2),
    offset: round2(sizeRem / 2),
  };
}

function vwStrong(calcPercent: number, sizeRem: number): FluidParts {
  return {
    vw: round2(getVW(calcPercent) / 1.33),
    offset: round2(sizeRem / 4),
  };
}

function vwExtrem(calcPercentEz: number, remMin: number): FluidParts {
  return {
    vw: getVW(calcPercentEz),
    offset: round2(-remMin),
  };
}

// ─── Format clamp string ────────────────────────────────────────

function formatClamp(min: number, fluid: FluidParts, max: number): string {
  const minStr = `${round2(min)}rem`;
  const maxStr = `${round2(max)}rem`;

  const sign = fluid.offset >= 0 ? '+' : '-';
  const absOffset = round2(Math.abs(fluid.offset));
  const fluidStr = `${fluid.vw}vw ${sign} ${absOffset}rem`;

  return `clamp(${minStr}, ${fluidStr}, ${maxStr})`;
}

// ─── Public: generate clamp for spacing ─────────────────────────

export function generateSpacingClamp(
  sizePx: number,
  screen: number,
  phi: number,
  min: number,
  max: number,
  ez: number,
  intensity: Intensity
): string {
  const calcPercent = getPercent(sizePx, screen);
  const calcPercentEz = getPercent(sizePx, screen, ez);
  const sizeRem = toRem(sizePx);
  const remMin = getMinRem(calcPercent, min);
  const remMax = getMaxRem(calcPercent, max);

  switch (intensity) {
    // __ = extreme (most fluid)
    case '__': {
      const fluid = vwExtrem(calcPercentEz, remMin);
      return formatClamp(min, fluid, remMax);
    }
    // _ = strong
    case '_': {
      const finalMin = getFinalMinDiv(remMin, phi);
      const fluid = vwStrong(calcPercent, sizeRem);
      return formatClamp(finalMin, fluid, remMax);
    }
    // '' = normal (default)
    case '': {
      const fluid = vwMedium(calcPercent, sizeRem);
      return formatClamp(remMin, fluid, remMax);
    }
    // - = light (least fluid)
    case '-': {
      const finalMin = getFinalMinMulti(remMin, phi);
      const fluid = vwLight(calcPercent, sizeRem);
      return formatClamp(finalMin, fluid, remMax);
    }
  }
}

// ─── Public: generate clamp for font-size ───────────────────────
// Font-sizes use different constants: phi=1.3, min=0.6
// Only 3 intensity levels (no vw-extrem)

export function generateFontClamp(
  sizePx: number,
  screen: number,
  phi: number,
  min: number,
  max: number,
  intensity: FontIntensity
): string {
  const calcPercent = getPercent(sizePx, screen);
  const sizeRem = toRem(sizePx);
  const remMin = getMinRem(calcPercent, min);
  const remMax = getMaxRem(calcPercent, max);

  switch (intensity) {
    // __ = most fluid (uses vw-strong + min/phi)
    case '__': {
      const finalMin = getFinalMinDiv(remMin, phi);
      const fluid = vwStrong(calcPercent, sizeRem);
      return formatClamp(finalMin, fluid, remMax);
    }
    // _ = medium (uses vw-medium + remMin)
    case '_': {
      const fluid = vwMedium(calcPercent, sizeRem);
      return formatClamp(remMin, fluid, remMax);
    }
    // '' = least fluid (uses vw-light + min*phi)
    case '': {
      const finalMin = getFinalMinMulti(remMin, phi);
      const fluid = vwLight(calcPercent, sizeRem);
      return formatClamp(finalMin, fluid, remMax);
    }
  }
}
