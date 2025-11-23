/**
 * EVA CSS Configuration - Monorepo Example
 *
 * This configuration is SHARED across all apps in the monorepo:
 * - apps/landing/
 * - apps/dashboard/
 * - apps/docs/
 *
 * Any changes here will affect all apps when you rebuild.
 */

module.exports = {
  // Design sizes - shared design system
  sizes: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128],

  // Font sizes - consistent typography
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 40, 48, 64],

  // Generate utility classes
  buildClass: true,

  // Show configuration during build
  debug: true,

  // Theme configuration - shared across all apps
  theme: {
    name: 'eva',
    colors: {
      // Using EVA default theme colors
      // Available as: --brand, --accent, --extra, --dark, --light
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
    autoSwitch: false
  }
};
