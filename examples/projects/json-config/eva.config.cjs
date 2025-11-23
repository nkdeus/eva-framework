/**
 * EVA CSS Configuration - JSON Config Example
 *
 * This configuration file is shared across all SCSS files in this project.
 * Changes here affect all generated CSS.
 */

module.exports = {
  // Design sizes - extracted from design system
  // These become: --4, --8, --16, --32, --64, --128
  sizes: [4, 8, 16, 32, 64, 128],

  // Font sizes
  // These become: --14, --16, --20, --24, --32, --48
  fontSizes: [14, 16, 20, 24, 32, 48],

  // Generate utility classes (.w-64, .p-16, .fs-24, etc.)
  buildClass: true,

  // Show configuration during build (useful for debugging)
  debug: true,

  // Add px/rem static values for debugging (optional)
  pxRemSuffix: false,

  // Theme configuration
  theme: {
    name: 'eva',
    colors: {
      // Using EVA default theme colors
      // These will be available as --brand, --accent, --extra, --dark, --light
    },

    lightMode: {
      lightness: 96.4,  // Light background
      darkness: 6.4     // Dark text
    },

    darkMode: {
      lightness: 5,     // Dark background
      darkness: 95      // Light text
    },

    // Auto-switch based on system preference
    // Set to true for automatic dark mode
    autoSwitch: false
  }

  // Optional: CSS purging for production
  // Uncomment to reduce file size by 60-90%
  /*
  purge: {
    enabled: true,
    content: ['*.html', 'src/**\/*.{js,jsx,tsx,vue}'],
    css: 'dist/main.css',
    output: 'dist/main-purged.css',
    safelist: ['theme-', 'current-', 'toggle-']
  }
  */
};
