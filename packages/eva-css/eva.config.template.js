/**
 * EVA CSS Configuration Template
 *
 * Copy this file to your project root as eva.config.js
 * or add the "eva" key to your package.json
 */

module.exports = {
  /**
   * Size values for spacing utilities (padding, margin, gap, width, height, etc.)
   * Extract these from your Figma design or design system
   *
   * @type {number[]}
   * @required Must include 16 as a base size
   */
  sizes: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128],

  /**
   * Font size values
   * These will be converted to fluid clamp() values
   *
   * @type {number[]}
   */
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48],

  /**
   * Generate utility classes (true) or only CSS variables (false)
   *
   * @type {boolean}
   * @default true
   */
  buildClass: true,

  /**
   * Add static px/rem values alongside fluid values for debugging
   *
   * @type {boolean}
   * @default false
   */
  pxRemSuffix: false,

  /**
   * Use size values in variable names (e.g., var(--16) instead of var(--size-4))
   *
   * @type {boolean}
   * @default true
   */
  nameBySize: true,

  /**
   * Enable custom class filtering mode
   * When true, only generate classes specified in classConfig
   *
   * @type {boolean}
   * @default false
   */
  customClass: false,

  /**
   * Configuration for custom class mode
   * Specify which properties and sizes to generate
   *
   * @type {Object<string, number[]>}
   *
   * Available properties:
   * - w, mw, h, mh (width, max-width, height, max-height)
   * - p, px, py, pt, pb, pr, pl (padding)
   * - m, mx, my, mt, mb, mr, ml (margin)
   * - g, gap, br (gap, border-radius)
   * - fs, lh (font-size, line-height)
   *
   * @example
   * classConfig: {
   *   w: [50, 100],           // Only .w-50 and .w-100
   *   px: [24],               // Only .px-24 (note: single value, no trailing comma needed in JS)
   *   g: [24, 50]             // Only .g-24 and .g-50
   * }
   */
  classConfig: {
    // w: [50, 100],
    // px: [24],
    // g: [24, 50]
  },

  /**
   * Show configuration summary during compilation
   *
   * @type {boolean}
   * @default false
   */
  debug: false,

  /**
   * Theme configuration
   * Define your color palette with HEX or OKLCH values
   *
   * @type {Object}
   */
  theme: {
    /**
     * Theme name (used in CSS class .theme-{name})
     *
     * @type {string}
     */
    name: 'myproject',

    /**
     * Theme colors
     * Use HEX colors (auto-converted to OKLCH) or OKLCH objects
     *
     * @type {Object<string, string|Object>}
     *
     * @example
     * colors: {
     *   brand: '#ff5733',  // HEX format
     *   accent: { lightness: 51.7, chroma: 0.293, hue: 289.66 }  // OKLCH format
     * }
     */
    colors: {
      // Use HEX colors from your design (Figma, etc.)
      brand: '#ff5733',
      accent: '#7300ff',
      extra: '#ffe500',

      // Or use OKLCH values directly
      dark: { lightness: 20, chroma: 0.05, hue: 200 },
      light: { lightness: 95, chroma: 0.01, hue: 200 }
    },

    /**
     * Light mode configuration
     *
     * @type {Object}
     */
    lightMode: {
      lightness: 96.4,
      darkness: 6.4
    },

    /**
     * Dark mode configuration
     *
     * @type {Object}
     */
    darkMode: {
      lightness: 5,
      darkness: 95
    },

    /**
     * Auto switch theme based on prefers-color-scheme
     * false = manual switching with .toggle-theme class
     *
     * @type {boolean}
     */
    autoSwitch: false
  },

  /**
   * Purge/tree-shaking configuration
   * Remove unused CSS classes in production builds
   *
   * @type {Object}
   */
  purge: {
    /**
     * Enable purging
     *
     * @type {boolean}
     * @default false
     */
    enabled: false,

    /**
     * Content files to scan for used classes
     * Glob patterns supported
     *
     * @type {string[]}
     */
    content: [
      '**/*.html',
      '**/*.js',
      '**/*.jsx',
      '**/*.tsx',
      '**/*.vue',
      '**/*.svelte'
    ],

    /**
     * Input CSS file to purge
     *
     * @type {string}
     */
    css: 'dist/eva.css',

    /**
     * Output path for purged CSS
     *
     * @type {string}
     */
    output: 'dist/eva-purged.css',

    /**
     * Classes/patterns to always keep (never purge)
     * Supports string prefixes or regex patterns
     *
     * @type {(string|RegExp)[]}
     */
    safelist: [
      'theme-',         // Keep all theme classes
      'current-',       // Keep current- prefixed classes
      'toggle-theme',   // Keep theme toggle
      'all-grads'       // Keep gradient classes
    ]
  }
};
