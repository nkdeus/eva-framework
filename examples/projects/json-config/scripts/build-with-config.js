#!/usr/bin/env node
/**
 * EVA CSS Build Script - User Project Template
 *
 * This script allows you to use eva.config.cjs in your own project.
 *
 * USAGE:
 *   node build-with-config.js <input.scss> <output.css>
 *
 * SETUP:
 *   1. Copy this file to your project's scripts/ folder
 *   2. Create eva.config.cjs in your project root
 *   3. Add to package.json scripts:
 *      "build:css": "node scripts/build-with-config.js styles/main.scss dist/main.css"
 *   4. Run: npm run build:css
 *
 * REQUIREMENTS:
 *   - eva-css-fluid installed in your project
 *   - sass installed (npm install --save-dev sass)
 *   - eva.config.cjs in your project root
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Load EVA configuration from eva.config.cjs or package.json
 */
function loadConfig() {
  const configPaths = [
    path.join(process.cwd(), 'eva.config.cjs'),
    path.join(process.cwd(), 'eva.config.js'),
  ];

  // Try to load from dedicated config files
  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      console.log(`📋 Loading config from: ${path.basename(configPath)}`);
      delete require.cache[require.resolve(configPath)];
      return require(configPath);
    }
  }

  // Try package.json "eva" key
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson.eva) {
      console.log('📋 Loading config from: package.json ("eva" key)');
      return packageJson.eva;
    }
  }

  console.log('⚠️  No eva.config.cjs, eva.config.js, or package.json "eva" key found');
  console.log('💡 EVA CSS will use default configuration');
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

  if (typeof config.nameBySize === 'boolean') {
    params.push(`$name-by-size: ${config.nameBySize}`);
  }

  if (typeof config.customClass === 'boolean') {
    params.push(`$custom-class: ${config.customClass}`);
  }

  if (typeof config.debug === 'boolean') {
    params.push(`$debug: ${config.debug}`);
  }

  // Handle classConfig for custom class mode
  if (config.classConfig && typeof config.classConfig === 'object') {
    const classConfigStr = Object.entries(config.classConfig)
      .map(([prop, sizes]) => `${prop}: (${sizes.join(', ')})`)
      .join(', ');
    params.push(`$class-config: (${classConfigStr})`);
  }

  return params.join(',\n  ');
}

/**
 * Build CSS from SCSS with optional configuration injection
 */
function buildCss(inputScss, outputCss, config) {
  // Validate input file exists
  if (!fs.existsSync(inputScss)) {
    console.error(`❌ Input file not found: ${inputScss}`);
    process.exit(1);
  }

  // Create output directory if it doesn't exist
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

    // If config exists, inject it into @use statements
    if (config) {
      const params = generateScssWithParams(config);

      if (params) {
        // Replace simple @use 'eva-css-fluid' or 'eva-css/index' with parameterized version
        output = content.replace(
          /@use\s+['"]eva-css-fluid['"];?/g,
          `@use 'eva-css-fluid' with (\n  ${params}\n);`
        );

        output = output.replace(
          /@use\s+['"]eva-css\/index['"];?/g,
          `@use 'eva-css/index' with (\n  ${params}\n);`
        );

        // Also handle @use 'eva-css-fluid/src' variants
        output = output.replace(
          /@use\s+['"]eva-css-fluid\/src['"](\s+as\s+\*)?;?/g,
          `@use 'eva-css-fluid/src' as * with (\n  ${params}\n);`
        );

        console.log('✅ Config injected into SCSS');
      }
    }

    // Write temporary file
    fs.writeFileSync(tempPath, output);

    // Compile with Sass
    console.log('🔨 Compiling SCSS...');
    try {
      // For examples in eva-framework repo, use packages load-path
      const loadPath = fs.existsSync(path.join(process.cwd(), '../../../packages'))
        ? '../../../packages'
        : 'node_modules';

      execSync(
        `npx sass --load-path=${loadPath} ${tempPath}:${outputCss}`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      console.error('❌ Sass compilation failed');
      throw error;
    }

    // Check output file size
    if (fs.existsSync(outputCss)) {
      const stats = fs.statSync(outputCss);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✅ CSS compiled successfully: ${outputCss} (${sizeKB} KB)`);
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up temporary file
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

  // Validate arguments
  if (!input || !output) {
    console.log('❌ Missing arguments\n');
    console.log('Usage: node build-with-config.js <input.scss> <output.css>\n');
    console.log('Examples:');
    console.log('  node build-with-config.js styles/main.scss dist/main.css');
    console.log('  node build-with-config.js src/app.scss public/css/app.css\n');
    process.exit(1);
  }

  console.log('🚀 EVA CSS Build Script\n');
  console.log(`📥 Input:  ${input}`);
  console.log(`📤 Output: ${output}\n`);

  const config = loadConfig();
  buildCss(input, output, config);

  console.log('\n✨ Build complete!\n');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { loadConfig, generateScssWithParams, buildCss };
