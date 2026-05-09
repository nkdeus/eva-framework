#!/usr/bin/env node

/**
 * EVA CSS CLI
 * Commands for configuration validation and project setup
 */

const { validateConfigCommand, generateScssCommand } = require('./src/config-loader.cjs');
const { initCommand, setupCommand } = require('./src/cli-commands.cjs');

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
EVA CSS - Fluid Design Framework

Usage:
  eva-css <command> [options]

Commands:
  init           [DEPRECATED] Initialize EVA CSS in existing project (creates eva.config.cjs)
  setup          [DEPRECATED] Complete project setup with workflow choice (SCSS vs JSON)
  validate       [DEPRECATED] Validate eva.config.js or package.json configuration
  generate       [DEPRECATED] Generate SCSS variables from config file
  help           Show this help message

Examples:
  eva-css init              # Initialize eva.config.cjs interactively
  eva-css setup             # Complete setup with file generation
  eva-css validate          # Validate configuration
  eva-css generate output.scss

Recommended workflow (SCSS-only):
  @use 'eva-css-fluid' with (
    $sizes: (4, 8, 12, 16, 24, 32, 48, 64, 96, 128),
    $font-sizes: (12, 14, 16, 18, 20, 24, 32, 48)
  );

Documentation:
  https://eva-css.xyz/framework/doc.html
`);
}

function printDeprecationWarning(command) {
  if (process.env.EVA_CSS_NO_DEPRECATION_WARNING) return;

  console.warn(`
⚠️  DEPRECATED: \`eva-css ${command}\` and the JSON config workflow will be removed in v3.0.
   Migrate to direct SCSS config:
     @use 'eva-css-fluid' with ($sizes: (...), $font-sizes: (...));
   See: https://eva-css.xyz/framework/doc.html
   (silence this warning with EVA_CSS_NO_DEPRECATION_WARNING=1)
`);
}

switch (command) {
  case 'init':
    printDeprecationWarning('init');
    initCommand();
    break;

  case 'setup':
    printDeprecationWarning('setup');
    setupCommand();
    break;

  case 'validate':
    printDeprecationWarning('validate');
    validateConfigCommand();
    break;

  case 'generate':
    printDeprecationWarning('generate');
    const outputPath = args[1] || 'src/_config-generated.scss';
    generateScssCommand(outputPath);
    break;

  case 'help':
  case '--help':
  case '-h':
  case undefined:
    printHelp();
    process.exit(0);
    break;

  default:
    console.error(`❌ Unknown command: ${command}\n`);
    printHelp();
    process.exit(1);
}
