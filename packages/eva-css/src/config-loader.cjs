/**
 * EVA CSS Configuration Loader
 *
 * Loads configuration from eva.config.js or package.json
 * Supports both CommonJS and ES Modules
 */

const fs = require('fs');
const path = require('path');
const {
  validateConfig,
  mergeWithDefaults,
  normalizeConfig,
  toScssVariables
} = require('./config-schema.cjs');

// Import eva-colors for HEX to OKLCH conversion
let hexToOklch;
try {
  const evaColors = require('eva-colors');
  hexToOklch = evaColors.hexToOklch;
} catch (error) {
  // Fallback if eva-colors is not installed
  hexToOklch = null;
}

/**
 * Find configuration file in the current working directory
 *
 * Priority:
 * 1. eva.config.js
 * 2. eva.config.cjs
 * 3. eva.config.mjs
 * 4. package.json (under "eva" key)
 *
 * @param {string} cwd - Current working directory
 * @returns {Object|null} { path: string, source: string, type: string } or null
 */
function findConfigFile(cwd = process.cwd()) {
  const configFiles = [
    { name: 'eva.config.js', type: 'module' },
    { name: 'eva.config.cjs', type: 'commonjs' },
    { name: 'eva.config.mjs', type: 'module' },
    { name: 'package.json', type: 'package' }
  ];

  for (const { name, type } of configFiles) {
    const filePath = path.join(cwd, name);
    if (fs.existsSync(filePath)) {
      return {
        path: filePath,
        source: name,
        type
      };
    }
  }

  return null;
}

/**
 * Load configuration from a file (CommonJS)
 *
 * @param {string} filePath - Path to config file
 * @param {string} source - Source file name
 * @returns {Object} Configuration object
 */
function loadConfigFromFile(filePath, source) {
  try {
    // Clear require cache to ensure fresh load
    delete require.cache[require.resolve(filePath)];

    if (source === 'package.json') {
      const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!packageJson.eva) {
        return null;
      }
      return normalizeConfig(packageJson.eva);
    }

    // For .js, .cjs, .mjs files
    const config = require(filePath);

    // Handle ES module default export
    const rawConfig = config.default || config;

    return normalizeConfig(rawConfig);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        `Failed to load config from ${source}: Missing dependencies. ` +
        `Run 'npm install' to install required packages.`
      );
    }

    if (error instanceof SyntaxError) {
      throw new Error(
        `Failed to parse config from ${source}: ${error.message}\n` +
        `Check for syntax errors in your configuration file.`
      );
    }

    throw new Error(`Failed to load config from ${source}: ${error.message}`);
  }
}

/**
 * Normalize theme colors - Convert HEX to OKLCH if needed
 *
 * @param {Object} theme - Theme configuration
 * @returns {Object} Theme with normalized colors
 */
function normalizeThemeColors(theme) {
  if (!theme || !theme.colors) return theme;

  const normalized = { ...theme };
  normalized.colors = {};

  for (const [colorName, colorValue] of Object.entries(theme.colors)) {
    if (typeof colorValue === 'string') {
      // HEX color - convert to OKLCH
      if (!hexToOklch) {
        throw new Error(
          'eva-colors package is required to convert HEX colors to OKLCH. ' +
          'Run: npm install eva-colors'
        );
      }

      const oklch = hexToOklch(colorValue);
      if (!oklch) {
        throw new Error(`Invalid HEX color "${colorValue}" for theme.colors.${colorName}`);
      }

      normalized.colors[colorName] = {
        lightness: oklch.l,
        chroma: oklch.c,
        hue: oklch.h
      };
    } else if (typeof colorValue === 'object') {
      // Already in OKLCH format
      normalized.colors[colorName] = colorValue;
    }
  }

  return normalized;
}

/**
 * Load and validate EVA CSS configuration
 *
 * @param {Object} options - Options
 * @param {string} options.cwd - Current working directory
 * @param {boolean} options.silent - Suppress console output
 * @returns {Object|null} Validated and merged configuration, or null if no config found
 */
function loadConfig(options = {}) {
  const { cwd = process.cwd(), silent = false } = options;

  // Find config file
  const configFile = findConfigFile(cwd);

  if (!configFile) {
    if (!silent) {
      console.log('ℹ️  No EVA CSS config file found, using SCSS variables');
    }
    return null;
  }

  if (!silent) {
    console.log(`📋 Loading EVA CSS config from ${configFile.source}...`);
  }

  // Load config
  const userConfig = loadConfigFromFile(configFile.path, configFile.source);

  if (!userConfig) {
    if (!silent) {
      console.log('ℹ️  No EVA CSS config found in package.json');
    }
    return null;
  }

  // Normalize theme colors (HEX → OKLCH)
  if (userConfig.theme && userConfig.theme.colors) {
    try {
      userConfig.theme = normalizeThemeColors(userConfig.theme);
      if (!silent) {
        const hexColors = Object.entries(userConfig.theme.colors).filter(([_, v]) =>
          typeof v === 'object' && v.lightness !== undefined
        );
        if (hexColors.length > 0) {
          console.log(`🎨 Converted ${hexColors.length} HEX colors to OKLCH`);
        }
      }
    } catch (error) {
      throw new Error(`Theme color conversion failed: ${error.message}`);
    }
  }

  // Validate config
  const validatedConfig = validateConfig(userConfig, configFile.source);

  // Merge with defaults
  const finalConfig = mergeWithDefaults(validatedConfig);

  if (!silent) {
    console.log('✅ Configuration loaded and validated successfully');
    if (finalConfig.debug) {
      console.log('\n📊 Configuration:');
      console.log(`   Sizes: ${finalConfig.sizes.join(', ')}`);
      console.log(`   Font sizes: ${finalConfig.fontSizes.join(', ')}`);
      console.log(`   Build classes: ${finalConfig.buildClass}`);
      console.log(`   Custom class mode: ${finalConfig.customClass}`);
      console.log('');
    }
  }

  return {
    config: finalConfig,
    source: configFile.source,
    path: configFile.path
  };
}

/**
 * Generate SCSS file from config
 *
 * @param {Object} config - Configuration object
 * @param {string} outputPath - Path to output SCSS file
 */
function generateScssConfig(config, outputPath) {
  const scssContent = [
    '// AUTO-GENERATED FROM eva.config.js or package.json',
    '// Do not edit this file directly - it will be overwritten',
    '// Edit your eva.config.js or package.json instead',
    '',
    toScssVariables(config),
    ''
  ].join('\n');

  fs.writeFileSync(outputPath, scssContent, 'utf8');
}

/**
 * CLI command to validate configuration
 */
function validateConfigCommand() {
  try {
    console.log('🔍 Validating EVA CSS configuration...\n');

    const result = loadConfig({ silent: false });

    if (!result) {
      console.log('\n⚠️  No configuration file found');
      console.log('   Create eva.config.js or add "eva" key to package.json');
      console.log('   See: https://eva-css.xyz/configuration\n');
      process.exit(0);
    }

    console.log('\n✅ Configuration is valid!\n');
    console.log('Configuration summary:');
    console.log(`  Source: ${result.source}`);
    console.log(`  Sizes: ${result.config.sizes.length} values`);
    console.log(`  Font sizes: ${result.config.fontSizes.length} values`);
    console.log(`  Build mode: ${result.config.buildClass ? 'utility classes' : 'variables only'}`);

    if (result.config.customClass && Object.keys(result.config.classConfig).length > 0) {
      console.log(`  Custom classes: ${Object.keys(result.config.classConfig).length} properties configured`);
    }

    if (result.config.purge && result.config.purge.enabled) {
      console.log(`  Purge: enabled`);
    }

    console.log('');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ ${error.message}\n`);
    process.exit(1);
  }
}

/**
 * CLI command to generate SCSS from config
 */
function generateScssCommand(outputPath = 'src/_config-generated.scss') {
  try {
    console.log('🔧 Generating SCSS configuration...\n');

    const result = loadConfig({ silent: false });

    if (!result) {
      console.log('\n⚠️  No configuration file found');
      console.log('   Using default SCSS variables instead\n');
      process.exit(1);
    }

    const fullOutputPath = path.resolve(process.cwd(), outputPath);
    generateScssConfig(result.config, fullOutputPath);

    console.log(`\n✅ SCSS configuration generated: ${fullOutputPath}\n`);
    console.log('You can now import this in your SCSS:');
    console.log(`  @use '${outputPath}';`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  findConfigFile,
  loadConfig,
  generateScssConfig,
  validateConfigCommand,
  generateScssCommand
};
