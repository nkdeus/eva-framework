#!/usr/bin/env node

/**
 * Build EVA CSS with configuration file support
 *
 * This script:
 * 1. Loads configuration from eva.config.js or package.json
 * 2. Generates SCSS variables from config
 * 3. Compiles SCSS to CSS
 * 4. Optionally runs purge if enabled
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadConfig, generateScssConfig } = require('../src/config-loader.cjs');

const args = process.argv.slice(2);
const isMinified = args.includes('--min') || args.includes('--minify');
const isPurge = args.includes('--purge');

async function build() {
  try {
    console.log('🔧 EVA CSS Build Process\n');

    // Step 1: Load configuration
    const configResult = loadConfig({ silent: false });

    let scssConfigPath = null;

    let entryFile = 'src/index.scss';

    if (configResult) {
      // Step 2: Generate SCSS config from JSON
      scssConfigPath = path.join(__dirname, '../src/_config-generated.scss');
      generateScssConfig(configResult.config, scssConfigPath);
      console.log(`✅ Generated SCSS configuration from ${configResult.source}\n`);

      // Create a wrapper entry file that imports config first
      const wrapperPath = path.join(__dirname, '../src/_build-entry.scss');

      // Build the @use statement with all config variables
      let useStatement = [
        '// Auto-generated build entry file',
        '// DO NOT EDIT - This file is temporary',
        '',
        '// Load generated config variables',
        '@use "config-generated" as cfg;',
        '',
        '// Import _colors.scss with theme config',
        '@use "colors" with ('
      ];

      // Add theme variables if theme is configured
      if (configResult.config.theme) {
        useStatement.push('  $theme-name: cfg.$theme-name,');
        useStatement.push('  $auto-theme-switch: cfg.$auto-theme-switch,');
        useStatement.push('  $theme-colors: cfg.$theme-colors,');
        useStatement.push('  $light-mode-lightness: cfg.$light-mode-lightness,');
        useStatement.push('  $light-mode-darkness: cfg.$light-mode-darkness,');
        useStatement.push('  $dark-mode-lightness: cfg.$dark-mode-lightness,');
        useStatement.push('  $dark-mode-darkness: cfg.$dark-mode-darkness');
      }

      useStatement.push(');');
      useStatement.push('');
      useStatement.push('// Import main framework with config');
      useStatement.push('@use "index" with (');
      useStatement.push('  $sizes: cfg.$sizes,');
      useStatement.push('  $font-sizes: cfg.$font-sizes,');
      useStatement.push('  $build-class: cfg.$build-class,');
      useStatement.push('  $px-rem-suffix: cfg.$px-rem-suffix,');
      useStatement.push('  $name-by-size: cfg.$name-by-size,');
      useStatement.push('  $custom-class: cfg.$custom-class,');
      useStatement.push('  $class-config: cfg.$class-config,');
      useStatement.push('  $debug: cfg.$debug');
      useStatement.push(');');

      const wrapperContent = useStatement.join('\n');

      fs.writeFileSync(wrapperPath, wrapperContent, 'utf8');
      entryFile = 'src/_build-entry.scss';
    } else {
      console.log('ℹ️  Using SCSS variables (no config file found)\n');
    }

    // Step 3: Compile SCSS to CSS
    const outputStyle = isMinified ? 'compressed' : 'expanded';
    const outputFile = isMinified ? 'dist/eva.min.css' : 'dist/eva.css';

    console.log(`📦 Compiling SCSS to ${outputFile}...`);

    try {
      execSync(
        `sass ${entryFile} ${outputFile} --style=${outputStyle}`,
        { stdio: 'inherit', cwd: path.join(__dirname, '..') }
      );
      console.log('✅ CSS compiled successfully\n');
    } catch (error) {
      console.error('❌ Failed to compile SCSS');
      process.exit(1);
    }

    // Step 4: Run purge if enabled
    if (configResult && configResult.config.purge && configResult.config.purge.enabled) {
      console.log('🗜️  Purge is enabled in config, running CSS optimization...');

      try {
        const CSSPurger = require('../../eva-purge/src/purge.js');
        const purgeConfig = {
          ...configResult.config.purge,
          css: outputFile,
          output: configResult.config.purge.output || outputFile.replace('.css', '-purged.css')
        };

        const purger = new CSSPurger(purgeConfig);
        await purger.purge();
      } catch (error) {
        console.warn('⚠️  Purge failed:', error.message);
        console.warn('   Continuing without purge...\n');
      }
    } else if (isPurge) {
      console.log('🗜️  Running manual purge (--purge flag)...');

      try {
        const CSSPurger = require('../../eva-purge/src/purge.js');
        const purger = new CSSPurger({
          css: outputFile,
          output: outputFile.replace('.css', '-purged.css')
        });
        await purger.purge();
      } catch (error) {
        console.warn('⚠️  Purge failed:', error.message);
        console.warn('   eva-purge package may not be installed\n');
      }
    }

    // Step 5: Cleanup generated files
    if (scssConfigPath && fs.existsSync(scssConfigPath)) {
      fs.unlinkSync(scssConfigPath);
    }

    const wrapperPath = path.join(__dirname, '../src/_build-entry.scss');
    if (fs.existsSync(wrapperPath)) {
      fs.unlinkSync(wrapperPath);
    }

    console.log('✅ Build completed successfully!\n');

    // Show file size
    if (fs.existsSync(outputFile)) {
      const stats = fs.statSync(outputFile);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`📊 Output file size: ${sizeKB} KB`);
    }

    console.log('');

  } catch (error) {
    console.error(`\n❌ Build failed: ${error.message}\n`);
    process.exit(1);
  }
}

// Run build
build().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
