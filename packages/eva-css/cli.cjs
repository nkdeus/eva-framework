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
  init           Initialize EVA CSS in existing project (creates eva.config.cjs)
  setup          Complete project setup with workflow choice (SCSS vs JSON)
  validate       Validate eva.config.js or package.json configuration
  generate       Generate SCSS variables from config file
  help           Show this help message

Examples:
  eva-css init              # Initialize eva.config.cjs interactively
  eva-css setup             # Complete setup with file generation
  eva-css validate          # Validate configuration
  eva-css generate output.scss

Getting Started:
  For new projects:         eva-css setup
  For existing projects:    eva-css init

Documentation:
  https://github.com/nkdeus/eva/blob/main/packages/eva-css/README.md
`);
}

switch (command) {
  case 'init':
    initCommand();
    break;

  case 'setup':
    setupCommand();
    break;

  case 'validate':
    validateConfigCommand();
    break;

  case 'generate':
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
