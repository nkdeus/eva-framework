// API
export {
  generateVars,
  generateClassOverrides,
  generateTheme,
  generateClamp,
  generateBridge,
  parseClass,
} from './generator.js';

// Types
export type {
  EvaYcodeConfig,
  Intensity,
  FontIntensity,
  ResolvedConfig,
} from './types.js';
export type { ParsedClass } from './generator.js';

// Constants
export {
  resolveConfig,
  PROPERTY_MAP,
  FONT_PROPERTY_MAP,
  SPACING_INTENSITIES,
  FONT_INTENSITIES,
} from './types.js';
