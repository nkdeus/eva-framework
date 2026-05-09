/** Intensity levels matching eva-css SCSS convention */
export type Intensity = '__' | '_' | '' | '-';

/** Intensity levels for font-size (3 levels only, matching SCSS) */
export type FontIntensity = '__' | '_' | '';

export interface EvaYcodeConfig {
  /** Spacing sizes in px from Figma tokens */
  sizes: number[];
  /** Font sizes in px from Figma tokens */
  fontSizes: number[];
  /** Reference screen width (default: 1440) */
  screen?: number;
  /** Spacing ratio multiplier — golden ratio (default: 1.61803398875) */
  phi?: number;
  /** Font ratio multiplier (default: 1.3) */
  fontPhi?: number;
  /** Min fluid factor for spacing (default: 0.5) */
  min?: number;
  /** Min fluid factor for fonts (default: 0.5 — matches SCSS where getMinRem uses module-level $min) */
  fontMin?: number;
  /** Max fluid factor (default: 1) */
  max?: number;
  /** Extreme intensity factor (default: 142.4) */
  ez?: number;
  /** Default intensity (default: '') */
  defaultIntensity?: Intensity;
}

export interface ResolvedConfig {
  sizes: number[];
  fontSizes: number[];
  screen: number;
  phi: number;
  fontPhi: number;
  min: number;
  fontMin: number;
  max: number;
  ez: number;
  defaultIntensity: Intensity;
}

/** Map of Tailwind prefix → CSS property for spacing/layout */
export const PROPERTY_MAP: Record<string, string> = {
  // Sizing
  h: 'height',
  w: 'width',
  'min-h': 'min-height',
  'min-w': 'min-width',
  'max-w': 'max-width',
  'max-h': 'max-height',

  // Padding
  p: 'padding',
  px: 'padding-inline',
  py: 'padding-block',
  pt: 'padding-top',
  pr: 'padding-right',
  pb: 'padding-bottom',
  pl: 'padding-left',

  // Margin
  m: 'margin',
  mx: 'margin-inline',
  my: 'margin-block',
  mt: 'margin-top',
  mr: 'margin-right',
  mb: 'margin-bottom',
  ml: 'margin-left',

  // Layout
  gap: 'gap',

  // Borders
  rounded: 'border-radius',
};

/** Font property map — uses --fs-XX vars */
export const FONT_PROPERTY_MAP: Record<string, string> = {
  text: 'font-size',
};

/** All spacing intensity suffixes in order (most fluid → least fluid) */
export const SPACING_INTENSITIES: Intensity[] = ['__', '_', '', '-'];

/** All font intensity suffixes in order (most fluid → least fluid) */
export const FONT_INTENSITIES: FontIntensity[] = ['__', '_', ''];

/** data-eva attribute values mapped to intensity suffixes */
export const DATA_EVA_MAP: Record<string, Intensity> = {
  extreme: '__',
  strong: '_',
  // normal = default (no data-eva needed)
  light: '-',
};

export const DATA_EVA_FONT_MAP: Record<string, FontIntensity> = {
  extreme: '__',
  strong: '_',
  // normal = default (no data-eva needed)
};

export function resolveConfig(config: EvaYcodeConfig): ResolvedConfig {
  return {
    sizes: config.sizes,
    fontSizes: config.fontSizes,
    screen: config.screen ?? 1440,
    phi: config.phi ?? 1.61803398875,
    fontPhi: config.fontPhi ?? 1.3,
    min: config.min ?? 0.5,
    fontMin: config.fontMin ?? 0.5,
    max: config.max ?? 1,
    ez: config.ez ?? 142.4,
    defaultIntensity: config.defaultIntensity ?? '',
  };
}
