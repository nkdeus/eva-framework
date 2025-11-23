/**
 * EVA CSS Demo Configuration
 *
 * This demonstrates the HEX to OKLCH theme color conversion
 */

module.exports = {
  // Size system from Figma
  sizes: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128],

  // Font sizes with fluid scaling
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48, 64],

  // Build configuration
  buildClass: true,
  pxRemSuffix: false,
  nameBySize: true,
  customClass: false,
  classConfig: {},
  debug: false,

  // Theme configuration with HEX colors
  theme: {
    name: 'demo',

    // HEX colors that will be auto-converted to OKLCH
    colors: {
      brand: '#ff5733',    // Vibrant orange-red
      accent: '#7300ff',   // Deep purple
      extra: '#ffe500',    // Bright yellow
      dark: '#1a1a2e',     // Dark blue-grey
      light: '#f8f9fa'     // Light grey
    },

    // Light mode settings
    lightMode: {
      lightness: 96.4,
      darkness: 6.4
    },

    // Dark mode settings
    darkMode: {
      lightness: 5,
      darkness: 95
    },

    // Manual theme switching with .toggle-theme class
    autoSwitch: false
  }
};
