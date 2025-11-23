#!/usr/bin/env node
/**
 * EVA CSS Build Script - Monorepo Example
 *
 * This script builds CSS for all apps in the monorepo using
 * a shared eva.config.cjs configuration.
 *
 * USAGE:
 *   node scripts/build-with-config.js <input.scss> <output.css>
 *
 * EXAMPLE:
 *   node scripts/build-with-config.js apps/landing/styles/main.scss apps/landing/dist/main.css
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Load EVA configuration from eva.config.cjs at monorepo root
 */
function loadConfig() {
  const configPath = path.join(__dirname, '../eva.config.cjs');

  if (fs.existsSync(configPath)) {
    console.log(`📋 Loading shared config: eva.config.cjs`);
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  }

  console.log('⚠️  No eva.config.cjs found at monorepo root');
  return null;
}

/**
 * Convert configuration object to SCSS variables
 */
function generateScssWithParams(config) {
  const params = [];

  if (config.sizes) {
    params.push(`$sizes: (${config.sizes.join(', ')})`);
  }

  if (config.fontSizes) {
    params.push(`$font-sizes: (${config.fontSizes.join(', ')})`);
  }

  if (typeof config.buildClass === 'boolean') {
    params.push(`$build-class: ${config.buildClass}`);
  }

  if (typeof config.pxRemSuffix === 'boolean') {
    params.push(`$px-rem-suffix: ${config.pxRemSuffix}`);
  }

  if (typeof config.debug === 'boolean') {
    params.push(`$debug: ${config.debug}`);
  }

  return params.join(',\n  ');
}

/**
 * Build CSS from SCSS with configuration injection
 */
function buildCss(inputScss, outputCss, config) {
  if (!fs.existsSync(inputScss)) {
    console.error(`❌ Input file not found: ${inputScss}`);
    process.exit(1);
  }

  const outputDir = path.dirname(outputCss);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const inputDir = path.dirname(inputScss);
  const inputBase = path.basename(inputScss, '.scss');
  const tempPath = path.join(inputDir, `.${inputBase}-temp.scss`);

  try {
    const content = fs.readFileSync(inputScss, 'utf8');
    let output = content;

    if (config) {
      const params = generateScssWithParams(config);

      if (params) {
        output = content.replace(
          /@use\s+['"]eva-css\/index['"];?/g,
          `@use 'eva-css/index' with (\n  ${params}\n);`
        );

        console.log('✅ Config injected into SCSS');
      }
    }

    fs.writeFileSync(tempPath, output);

    console.log('🔨 Compiling SCSS...');
    const loadPath = '../../../packages';
    execSync(
      `npx sass --load-path=${loadPath} ${tempPath}:${outputCss}`,
      { stdio: 'inherit' }
    );

    if (fs.existsSync(outputCss)) {
      const stats = fs.statSync(outputCss);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✅ CSS compiled: ${outputCss} (${sizeKB} KB)`);
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

/**
 * Main execution
 */
function main() {
  const [,, input, output] = process.argv;

  if (!input || !output) {
    console.log('❌ Missing arguments\n');
    console.log('Usage: node build-with-config.js <input.scss> <output.css>');
    process.exit(1);
  }

  console.log('🚀 EVA CSS Monorepo Build\n');
  console.log(`📥 Input:  ${input}`);
  console.log(`📤 Output: ${output}\n`);

  const config = loadConfig();
  buildCss(input, output, config);

  console.log('\n✨ Build complete!\n');
}

if (require.main === module) {
  main();
}

module.exports = { loadConfig, generateScssWithParams, buildCss };
