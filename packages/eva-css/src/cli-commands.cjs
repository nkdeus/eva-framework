/**
 * EVA CSS CLI Interactive Commands
 *
 * Commands: init, setup
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// CLI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(msg) {
  console.log(msg);
}

function success(msg) {
  log(`${colors.green}✅${colors.reset} ${msg}`);
}

function info(msg) {
  log(`${colors.blue}ℹ${colors.reset}  ${msg}`);
}

function error(msg) {
  log(`${colors.red}❌${colors.reset} ${msg}`);
}

function title(msg) {
  log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`);
}

// Readline interface for prompts
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${colors.cyan}?${colors.reset} ${question} `, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function select(question, options) {
  log(`${colors.cyan}?${colors.reset} ${question}`);
  options.forEach((opt, i) => {
    const description = opt.description ? ` ${colors.dim}- ${opt.description}${colors.reset}` : '';
    log(`  ${colors.dim}${i + 1}.${colors.reset} ${opt.label}${description}`);
  });

  const answer = await prompt(`  Select (1-${options.length}):`);
  const index = parseInt(answer) - 1;

  if (index >= 0 && index < options.length) {
    return options[index].value;
  }

  error('Invalid selection, using default');
  return options[0].value;
}

async function confirm(question, defaultValue = true) {
  const defaultText = defaultValue ? 'Y/n' : 'y/N';
  const answer = await prompt(`${question} (${defaultText})`);

  if (!answer) return defaultValue;
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

/**
 * Generate eva.config.cjs template
 */
function generateEvaConfig(options) {
  const { sizes, fontSizes, buildClass, debug, workflow } = options;

  return `/**
 * EVA CSS Configuration
 *
 * This configuration file defines your design tokens.
 * Customize sizes, font sizes, and build options.
 *
 * Documentation: https://github.com/nkdeus/eva/blob/main/packages/eva-css/docs/JSON-CONFIG.md
 */

module.exports = {
  // Design sizes - extracted from your design system
  // These become CSS variables: var(--4), var(--8), var(--16), etc.
  sizes: [${sizes.join(', ')}],

  // Font sizes for typography
  // These become CSS variables: var(--14), var(--16), var(--20), etc.
  fontSizes: [${fontSizes.join(', ')}],

  // Generate utility classes (.w-64, .p-16, .fs-24, etc.)
  buildClass: ${buildClass},

  // Show configuration during build (useful for debugging)
  debug: ${debug},

  // Theme configuration
  theme: {
    name: 'eva',
    colors: {
      // Using EVA default colors
      // You can customize: brand, accent, extra
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
  }${workflow === 'json' ? `,

  // Optional: CSS purging for production
  // Uncomment to reduce file size by 60-90%
  /*
  purge: {
    enabled: true,
    content: ['*.html', 'src/**/*.{js,jsx,tsx,vue}'],
    css: 'dist/main.css',
    output: 'dist/main-purged.css',
    safelist: ['theme-', 'current-', 'toggle-']
  }
  */` : ''}
};
`;
}

/**
 * Generate build script for JSON config workflow
 */
function generateBuildScript() {
  return `#!/usr/bin/env node
/**
 * EVA CSS Build Script
 *
 * This script loads eva.config.cjs and injects it into SCSS compilation.
 *
 * USAGE:
 *   node scripts/build.js <input.scss> <output.css>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Load EVA configuration from eva.config.cjs
 */
function loadConfig() {
  const configPath = path.join(process.cwd(), 'eva.config.cjs');

  if (!fs.existsSync(configPath)) {
    console.log('⚠️  No eva.config.cjs found');
    return null;
  }

  delete require.cache[require.resolve(configPath)];
  return require(configPath);
}

/**
 * Convert configuration to SCSS variables
 */
function generateScssWithParams(config) {
  const params = [];

  if (config.sizes) {
    params.push(\`$sizes: (\${config.sizes.join(', ')})\`);
  }

  if (config.fontSizes) {
    params.push(\`$font-sizes: (\${config.fontSizes.join(', ')})\`);
  }

  if (typeof config.buildClass === 'boolean') {
    params.push(\`$build-class: \${config.buildClass}\`);
  }

  if (typeof config.debug === 'boolean') {
    params.push(\`$debug: \${config.debug}\`);
  }

  return params.join(',\\n  ');
}

/**
 * Build CSS from SCSS with configuration injection
 */
function buildCss(inputScss, outputCss, config) {
  if (!fs.existsSync(inputScss)) {
    console.error(\`❌ Input file not found: \${inputScss}\`);
    process.exit(1);
  }

  const outputDir = path.dirname(outputCss);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const inputDir = path.dirname(inputScss);
  const inputBase = path.basename(inputScss, '.scss');
  const tempPath = path.join(inputDir, \`.\${inputBase}-temp.scss\`);

  try {
    const content = fs.readFileSync(inputScss, 'utf8');
    let output = content;

    if (config) {
      const params = generateScssWithParams(config);

      if (params) {
        output = content.replace(
          /@use\\s+['"]eva-css\\/index['"];?/g,
          \`@use 'eva-css/index' with (\\n  \${params}\\n);\`
        );

        console.log('✅ Config injected into SCSS');
      }
    }

    fs.writeFileSync(tempPath, output);

    console.log('🔨 Compiling SCSS...');
    execSync(
      \`npx sass --load-path=node_modules \${tempPath}:\${outputCss}\`,
      { stdio: 'inherit' }
    );

    if (fs.existsSync(outputCss)) {
      const stats = fs.statSync(outputCss);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(\`✅ CSS compiled: \${outputCss} (\${sizeKB} KB)\`);
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
    console.log('Usage: node scripts/build.js <input.scss> <output.css>');
    process.exit(1);
  }

  console.log('🚀 EVA CSS Build\\n');
  console.log(\`📥 Input:  \${input}\`);
  console.log(\`📤 Output: \${output}\\n\`);

  const config = loadConfig();
  buildCss(input, output, config);

  console.log('\\n✨ Build complete!\\n');
}

if (require.main === module) {
  main();
}

module.exports = { loadConfig, generateScssWithParams, buildCss };
`;
}

/**
 * eva-css init command
 * Initialize EVA CSS in existing project
 */
async function initCommand() {
  try {
    title('🎨 EVA CSS Initialization');

    // Check if eva.config.cjs already exists
    const configPath = path.join(process.cwd(), 'eva.config.cjs');
    if (fs.existsSync(configPath)) {
      error('eva.config.cjs already exists!');
      const overwrite = await confirm('Overwrite?', false);
      if (!overwrite) {
        log('\nAborted.');
        process.exit(0);
      }
    }

    // Get configuration from user
    log('');
    info('Configure your design system:\n');

    const sizesInput = await prompt('Design sizes (comma-separated) [4, 8, 16, 32, 64, 128]:');
    const sizes = sizesInput ? sizesInput.split(',').map(s => parseInt(s.trim())) : [4, 8, 16, 32, 64, 128];

    const fontSizesInput = await prompt('Font sizes (comma-separated) [14, 16, 20, 24, 32, 48]:');
    const fontSizes = fontSizesInput ? fontSizesInput.split(',').map(s => parseInt(s.trim())) : [14, 16, 20, 24, 32, 48];

    const buildClass = await confirm('Generate utility classes?', true);
    const debug = await confirm('Enable debug mode?', false);

    // Generate config file
    const configContent = generateEvaConfig({
      sizes,
      fontSizes,
      buildClass,
      debug,
      workflow: 'json'
    });

    fs.writeFileSync(configPath, configContent);
    success('Created eva.config.cjs');

    // Success message
    title('✅ EVA CSS Initialized!');

    log(`${colors.bright}Next steps:${colors.reset}\n`);
    log(`  ${colors.dim}1.${colors.reset} Run ${colors.cyan}npx eva-css validate${colors.reset} to verify configuration`);
    log(`  ${colors.dim}2.${colors.reset} Import EVA CSS in your SCSS: ${colors.dim}@use 'eva-css/index';${colors.reset}`);
    log(`  ${colors.dim}3.${colors.reset} Use ${colors.cyan}eva-css setup${colors.reset} for full project setup with build scripts\n`);

    log(`${colors.dim}Documentation: https://github.com/nkdeus/eva/blob/main/packages/eva-css/README.md${colors.reset}\n`);

  } catch (err) {
    error(`Failed to initialize: ${err.message}`);
    process.exit(1);
  }
}

/**
 * eva-css setup command
 * Complete project setup with workflow choice
 */
async function setupCommand() {
  try {
    title('🚀 EVA CSS Project Setup');

    // Choose workflow
    log('');
    const workflow = await select('Choose your workflow:', [
      {
        label: 'SCSS Variables',
        value: 'scss',
        description: 'Simple, works with npx sass directly'
      },
      {
        label: 'JSON Config',
        value: 'json',
        description: 'Centralized config, requires build script'
      }
    ]);

    log('');
    info('Configure your design system:\n');

    const sizesInput = await prompt('Design sizes (comma-separated) [4, 8, 16, 32, 64, 128]:');
    const sizes = sizesInput ? sizesInput.split(',').map(s => parseInt(s.trim())) : [4, 8, 16, 32, 64, 128];

    const fontSizesInput = await prompt('Font sizes (comma-separated) [14, 16, 20, 24, 32, 48]:');
    const fontSizes = fontSizesInput ? fontSizesInput.split(',').map(s => parseInt(s.trim())) : [14, 16, 20, 24, 32, 48];

    const buildClass = await confirm('Generate utility classes?', true);
    const debug = await confirm('Enable debug mode?', false);

    log('\n📁 Setting up project files...\n');

    // Create directories
    if (!fs.existsSync('styles')) {
      fs.mkdirSync('styles', { recursive: true });
      success('Created styles/');
    }

    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
      success('Created dist/');
    }

    if (workflow === 'json') {
      // JSON Config workflow

      // 1. Create eva.config.cjs
      const configContent = generateEvaConfig({ sizes, fontSizes, buildClass, debug, workflow });
      fs.writeFileSync('eva.config.cjs', configContent);
      success('Created eva.config.cjs');

      // 2. Create build script
      if (!fs.existsSync('scripts')) {
        fs.mkdirSync('scripts', { recursive: true });
      }
      fs.writeFileSync('scripts/build.js', generateBuildScript());
      success('Created scripts/build.js');

      // 3. Create clean SCSS (no config inline)
      const scssContent = `// EVA CSS
// Configuration is loaded from eva.config.cjs

@use 'eva-css/index';

// Your custom styles here

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background 0.3s, color 0.3s;
}
`;
      fs.writeFileSync('styles/main.scss', scssContent);
      success('Created styles/main.scss');

      // 4. Update or create package.json scripts
      const packageJsonPath = 'package.json';
      let packageJson = {};

      if (fs.existsSync(packageJsonPath)) {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      } else {
        packageJson = {
          name: path.basename(process.cwd()),
          version: '1.0.0',
          private: true
        };
      }

      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.build = 'node scripts/build.js styles/main.scss dist/main.css';
      packageJson.scripts.watch = 'nodemon --watch styles --watch eva.config.cjs --ext scss,cjs --exec "npm run build"';
      packageJson.scripts.validate = 'eva-css validate';

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      success('Updated package.json scripts');

      // Success message
      title('✅ JSON Config Workflow Setup Complete!');

      log(`${colors.bright}Next steps:${colors.reset}\n`);
      log(`  ${colors.dim}1.${colors.reset} Install dependencies: ${colors.cyan}npm install --save-dev sass nodemon${colors.reset}`);
      log(`  ${colors.dim}2.${colors.reset} Validate config: ${colors.cyan}npm run validate${colors.reset}`);
      log(`  ${colors.dim}3.${colors.reset} Build CSS: ${colors.cyan}npm run build${colors.reset}`);
      log(`  ${colors.dim}4.${colors.reset} Watch mode: ${colors.cyan}npm run watch${colors.reset}\n`);

    } else {
      // SCSS Variables workflow

      // Create SCSS with inline config
      const scssContent = `// EVA CSS - SCSS Variables Configuration

@use 'eva-css/index' with (
  // Design sizes from your design system
  $sizes: (${sizes.join(', ')}),

  // Font sizes for typography
  $font-sizes: (${fontSizes.join(', ')}),

  // Generate utility classes
  $build-class: ${buildClass},

  // Show debug info during build
  $debug: ${debug}
);

// Your custom styles here

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background 0.3s, color 0.3s;
}
`;
      fs.writeFileSync('styles/main.scss', scssContent);
      success('Created styles/main.scss');

      // Update or create package.json scripts
      const packageJsonPath = 'package.json';
      let packageJson = {};

      if (fs.existsSync(packageJsonPath)) {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      } else {
        packageJson = {
          name: path.basename(process.cwd()),
          version: '1.0.0',
          private: true
        };
      }

      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.build = 'sass --load-path=node_modules styles/main.scss:dist/main.css';
      packageJson.scripts.watch = 'sass --watch --load-path=node_modules styles/main.scss:dist/main.css';

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      success('Updated package.json scripts');

      // Success message
      title('✅ SCSS Variables Workflow Setup Complete!');

      log(`${colors.bright}Next steps:${colors.reset}\n`);
      log(`  ${colors.dim}1.${colors.reset} Install Sass: ${colors.cyan}npm install --save-dev sass${colors.reset}`);
      log(`  ${colors.dim}2.${colors.reset} Build CSS: ${colors.cyan}npm run build${colors.reset}`);
      log(`  ${colors.dim}3.${colors.reset} Watch mode: ${colors.cyan}npm run watch${colors.reset}\n`);
    }

    log(`${colors.dim}Documentation: https://github.com/nkdeus/eva/blob/main/packages/eva-css/README.md${colors.reset}\n`);

  } catch (err) {
    error(`Setup failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  initCommand,
  setupCommand
};
