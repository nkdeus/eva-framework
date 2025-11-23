/**
 * EVA CSS Configuration Schema
 *
 * Defines and validates the structure of eva.config.js and package.json "eva" configuration
 */

/**
 * Default configuration values
 */
const defaults = {
  sizes: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48],
  buildClass: true,
  pxRemSuffix: false,
  nameBySize: true,
  customClass: false,
  classConfig: {},
  debug: false,
  theme: {
    name: 'eva',
    colors: {
      brand: { lightness: 80, chroma: 0.1924, hue: 169 },
      accent: { lightness: 80, chroma: 0.1924, hue: 10 },
      extra: { lightness: 80, chroma: 0.1924, hue: 200 },
      dark: { lightness: 20, chroma: 0.05, hue: 200 },
      light: { lightness: 95, chroma: 0.01, hue: 200 }
    },
    lightMode: {
      lightness: 96.4,
      darkness: 6.4
    },
    darkMode: {
      lightness: 5,
      darkness: 95
    },
    autoSwitch: false
  },
  purge: {
    enabled: false,
    content: ['**/*.{html,js,jsx,tsx,vue,svelte}'],
    css: 'dist/eva.css',
    output: 'dist/eva-purged.css',
    safelist: ['theme-', 'current-', 'toggle-theme', 'all-grads']
  }
};

/**
 * Available property keys for classConfig
 */
const availableProperties = [
  'w', 'mw', 'h', 'mh',
  'p', 'px', 'py', 'pt', 'pb', 'pr', 'pl',
  'm', 'mx', 'my', 'mt', 'mb', 'mr', 'ml',
  'g', 'gap', 'br',
  'fs', 'lh'
];

/**
 * Validation errors
 */
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Validate configuration object
 *
 * @param {Object} config - Configuration object to validate
 * @param {string} source - Source of config ('eva.config.js' or 'package.json')
 * @returns {Object} Validated configuration
 * @throws {ValidationError} If configuration is invalid
 */
function validateConfig(config, source = 'config file') {
  if (!config || typeof config !== 'object') {
    throw new ValidationError(
      `Configuration must be an object, received ${typeof config}`,
      'root'
    );
  }

  const errors = [];
  const warnings = [];

  // Validate sizes
  if (config.sizes !== undefined) {
    if (!Array.isArray(config.sizes)) {
      errors.push('sizes: Must be an array of numbers');
    } else if (config.sizes.length === 0) {
      errors.push('sizes: Array cannot be empty');
    } else if (!config.sizes.every(s => typeof s === 'number' && s > 0)) {
      errors.push('sizes: All values must be positive numbers');
    } else if (!config.sizes.includes(16)) {
      errors.push('sizes: Must include 16 as a base size (required by EVA CSS)');
    }
  }

  // Validate fontSizes
  if (config.fontSizes !== undefined) {
    if (!Array.isArray(config.fontSizes)) {
      errors.push('fontSizes: Must be an array of numbers');
    } else if (config.fontSizes.length === 0) {
      errors.push('fontSizes: Array cannot be empty');
    } else if (!config.fontSizes.every(s => typeof s === 'number' && s > 0)) {
      errors.push('fontSizes: All values must be positive numbers');
    }
  }

  // Validate boolean flags
  const booleanFlags = ['buildClass', 'pxRemSuffix', 'nameBySize', 'customClass', 'debug'];
  booleanFlags.forEach(flag => {
    if (config[flag] !== undefined && typeof config[flag] !== 'boolean') {
      errors.push(`${flag}: Must be a boolean (true or false)`);
    }
  });

  // Validate classConfig
  if (config.classConfig !== undefined) {
    if (typeof config.classConfig !== 'object' || Array.isArray(config.classConfig)) {
      errors.push('classConfig: Must be an object mapping properties to size arrays');
    } else {
      // Check if customClass is enabled when classConfig is provided
      if (config.customClass === false && Object.keys(config.classConfig).length > 0) {
        warnings.push('classConfig: Setting classConfig has no effect when customClass is false');
      }

      // Validate each property in classConfig
      Object.entries(config.classConfig).forEach(([prop, sizes]) => {
        if (!availableProperties.includes(prop)) {
          errors.push(
            `classConfig.${prop}: Unknown property. Available properties: ${availableProperties.join(', ')}`
          );
        }

        if (!Array.isArray(sizes)) {
          errors.push(`classConfig.${prop}: Must be an array of size values`);
        } else if (sizes.length === 0) {
          errors.push(`classConfig.${prop}: Array cannot be empty`);
        } else {
          // Validate that all sizes in classConfig exist in the main sizes array
          const mainSizes = config.sizes || defaults.sizes;
          sizes.forEach(size => {
            if (!mainSizes.includes(size)) {
              errors.push(
                `classConfig.${prop}: Size ${size} is not in the main sizes array [${mainSizes.join(', ')}]`
              );
            }
          });
        }
      });
    }
  }

  // Validate theme configuration
  if (config.theme !== undefined) {
    if (typeof config.theme !== 'object' || Array.isArray(config.theme)) {
      errors.push('theme: Must be an object');
    } else {
      // Validate theme name
      if (config.theme.name !== undefined) {
        if (typeof config.theme.name !== 'string' || config.theme.name.trim() === '') {
          errors.push('theme.name: Must be a non-empty string');
        }
      }

      // Validate colors
      if (config.theme.colors !== undefined) {
        if (typeof config.theme.colors !== 'object' || Array.isArray(config.theme.colors)) {
          errors.push('theme.colors: Must be an object');
        } else {
          const validColorNames = ['brand', 'accent', 'extra', 'dark', 'light'];

          Object.entries(config.theme.colors).forEach(([colorName, colorValue]) => {
            if (!validColorNames.includes(colorName)) {
              errors.push(
                `theme.colors.${colorName}: Unknown color. Valid colors: ${validColorNames.join(', ')}`
              );
            }

            // Validate color value (HEX string or OKLCH object)
            if (typeof colorValue === 'string') {
              // HEX format
              if (!/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
                errors.push(
                  `theme.colors.${colorName}: Invalid HEX color "${colorValue}". Must be format #RRGGBB`
                );
              }
            } else if (typeof colorValue === 'object' && !Array.isArray(colorValue)) {
              // OKLCH format
              if (typeof colorValue.lightness !== 'number' || colorValue.lightness < 0 || colorValue.lightness > 100) {
                errors.push(
                  `theme.colors.${colorName}.lightness: Must be a number between 0 and 100`
                );
              }
              if (typeof colorValue.chroma !== 'number' || colorValue.chroma < 0 || colorValue.chroma > 0.4) {
                errors.push(
                  `theme.colors.${colorName}.chroma: Must be a number between 0 and 0.4`
                );
              }
              if (typeof colorValue.hue !== 'number' || colorValue.hue < 0 || colorValue.hue > 360) {
                errors.push(
                  `theme.colors.${colorName}.hue: Must be a number between 0 and 360`
                );
              }
            } else {
              errors.push(
                `theme.colors.${colorName}: Must be a HEX string (#RRGGBB) or OKLCH object {lightness, chroma, hue}`
              );
            }
          });
        }
      }

      // Validate lightMode
      if (config.theme.lightMode !== undefined) {
        if (typeof config.theme.lightMode !== 'object' || Array.isArray(config.theme.lightMode)) {
          errors.push('theme.lightMode: Must be an object with lightness and darkness properties');
        } else {
          if (typeof config.theme.lightMode.lightness !== 'number' || config.theme.lightMode.lightness < 0 || config.theme.lightMode.lightness > 100) {
            errors.push('theme.lightMode.lightness: Must be a number between 0 and 100');
          }
          if (typeof config.theme.lightMode.darkness !== 'number' || config.theme.lightMode.darkness < 0 || config.theme.lightMode.darkness > 100) {
            errors.push('theme.lightMode.darkness: Must be a number between 0 and 100');
          }
        }
      }

      // Validate darkMode
      if (config.theme.darkMode !== undefined) {
        if (typeof config.theme.darkMode !== 'object' || Array.isArray(config.theme.darkMode)) {
          errors.push('theme.darkMode: Must be an object with lightness and darkness properties');
        } else {
          if (typeof config.theme.darkMode.lightness !== 'number' || config.theme.darkMode.lightness < 0 || config.theme.darkMode.lightness > 100) {
            errors.push('theme.darkMode.lightness: Must be a number between 0 and 100');
          }
          if (typeof config.theme.darkMode.darkness !== 'number' || config.theme.darkMode.darkness < 0 || config.theme.darkMode.darkness > 100) {
            errors.push('theme.darkMode.darkness: Must be a number between 0 and 100');
          }
        }
      }

      // Validate autoSwitch
      if (config.theme.autoSwitch !== undefined && typeof config.theme.autoSwitch !== 'boolean') {
        errors.push('theme.autoSwitch: Must be a boolean');
      }
    }
  }

  // Validate purge configuration
  if (config.purge !== undefined) {
    if (typeof config.purge !== 'object' || Array.isArray(config.purge)) {
      errors.push('purge: Must be an object');
    } else {
      if (config.purge.enabled !== undefined && typeof config.purge.enabled !== 'boolean') {
        errors.push('purge.enabled: Must be a boolean');
      }

      if (config.purge.content !== undefined) {
        if (!Array.isArray(config.purge.content)) {
          errors.push('purge.content: Must be an array of glob patterns');
        } else if (config.purge.content.length === 0) {
          errors.push('purge.content: Array cannot be empty');
        }
      }

      if (config.purge.css !== undefined && typeof config.purge.css !== 'string') {
        errors.push('purge.css: Must be a string (path to CSS file)');
      }

      if (config.purge.output !== undefined && typeof config.purge.output !== 'string') {
        errors.push('purge.output: Must be a string (output path)');
      }

      if (config.purge.safelist !== undefined && !Array.isArray(config.purge.safelist)) {
        errors.push('purge.safelist: Must be an array of strings or patterns');
      }
    }
  }

  // Throw if there are errors
  if (errors.length > 0) {
    const errorMessage = [
      `Invalid EVA CSS configuration in ${source}:`,
      '',
      ...errors.map(e => `  ❌ ${e}`),
      '',
      'See documentation: https://eva-css.xyz/configuration'
    ].join('\n');

    throw new ValidationError(errorMessage, 'validation');
  }

  // Display warnings
  if (warnings.length > 0) {
    console.warn(`\n⚠️  EVA CSS configuration warnings in ${source}:`);
    warnings.forEach(w => console.warn(`  ${w}`));
    console.warn('');
  }

  return config;
}

/**
 * Merge user configuration with defaults
 *
 * @param {Object} userConfig - User provided configuration
 * @returns {Object} Merged configuration
 */
function mergeWithDefaults(userConfig) {
  const config = { ...defaults };

  // Merge top-level properties
  Object.keys(userConfig).forEach(key => {
    if (key === 'purge' && typeof userConfig.purge === 'object') {
      // Deep merge purge configuration
      config.purge = {
        ...defaults.purge,
        ...userConfig.purge
      };
    } else if (key === 'theme' && typeof userConfig.theme === 'object') {
      // Deep merge theme configuration
      config.theme = {
        ...defaults.theme,
        ...userConfig.theme,
        colors: {
          ...defaults.theme.colors,
          ...(userConfig.theme.colors || {})
        },
        lightMode: {
          ...defaults.theme.lightMode,
          ...(userConfig.theme.lightMode || {})
        },
        darkMode: {
          ...defaults.theme.darkMode,
          ...(userConfig.theme.darkMode || {})
        }
      };
    } else if (key === 'classConfig' && typeof userConfig.classConfig === 'object') {
      // Replace classConfig entirely (no merge)
      config.classConfig = userConfig.classConfig;
    } else {
      config[key] = userConfig[key];
    }
  });

  return config;
}

/**
 * Convert JavaScript config to SCSS variable format
 *
 * @param {Object} config - Configuration object
 * @returns {string} SCSS variable declarations
 */
function toScssVariables(config) {
  const lines = [];

  // Sizes
  if (config.sizes) {
    lines.push(`$sizes: ${config.sizes.join(', ')};`);
  }

  // Font sizes
  if (config.fontSizes) {
    lines.push(`$font-sizes: ${config.fontSizes.join(', ')};`);
  }

  // Boolean flags
  lines.push(`$build-class: ${config.buildClass};`);
  lines.push(`$px-rem-suffix: ${config.pxRemSuffix};`);
  lines.push(`$name-by-size: ${config.nameBySize};`);
  lines.push(`$custom-class: ${config.customClass};`);
  lines.push(`$debug: ${config.debug};`);

  // Class config (convert to SCSS map)
  if (config.customClass && Object.keys(config.classConfig).length > 0) {
    lines.push('$class-config: (');
    Object.entries(config.classConfig).forEach(([prop, sizes], index, arr) => {
      const isLast = index === arr.length - 1;
      // Handle single-item arrays with trailing comma for SCSS
      const sizesList = sizes.length === 1 ? `${sizes[0]},` : sizes.join(', ');
      lines.push(`  ${prop}: (${sizesList})${isLast ? '' : ','}`);
    });
    lines.push(');');
  } else {
    lines.push('$class-config: ();');
  }

  // Theme configuration
  if (config.theme) {
    lines.push('');
    lines.push('// Theme configuration');
    lines.push(`$theme-name: '${config.theme.name}';`);
    lines.push(`$auto-theme-switch: ${config.theme.autoSwitch};`);

    // Light and dark mode settings
    lines.push(`$light-mode-lightness: ${config.theme.lightMode.lightness}%;`);
    lines.push(`$light-mode-darkness: ${config.theme.lightMode.darkness}%;`);
    lines.push(`$dark-mode-lightness: ${config.theme.darkMode.lightness}%;`);
    lines.push(`$dark-mode-darkness: ${config.theme.darkMode.darkness}%;`);

    // Colors map
    lines.push('$theme-colors: (');
    const colorEntries = Object.entries(config.theme.colors);
    colorEntries.forEach(([colorName, colorValue], index) => {
      const isLast = index === colorEntries.length - 1;
      lines.push(`  '${colorName}': (${colorValue.lightness}% ${colorValue.chroma} ${colorValue.hue})${isLast ? '' : ','}`);
    });
    lines.push(');');
  }

  return lines.join('\n');
}

/**
 * Normalize config from package.json format to standard format
 * Handles camelCase vs kebab-case conversions
 *
 * @param {Object} config - Configuration from package.json or eva.config.js
 * @returns {Object} Normalized configuration
 */
function normalizeConfig(config) {
  const normalized = {};

  // Map camelCase to internal format
  const keyMap = {
    fontSizes: 'fontSizes',
    buildClass: 'buildClass',
    pxRemSuffix: 'pxRemSuffix',
    nameBySize: 'nameBySize',
    customClass: 'customClass',
    classConfig: 'classConfig'
  };

  Object.entries(config).forEach(([key, value]) => {
    // Use mapped key if it exists, otherwise use original key
    const normalizedKey = keyMap[key] || key;
    normalized[normalizedKey] = value;
  });

  return normalized;
}

module.exports = {
  defaults,
  availableProperties,
  ValidationError,
  validateConfig,
  mergeWithDefaults,
  toScssVariables,
  normalizeConfig
};
