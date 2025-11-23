#!/usr/bin/env node

/**
 * EVA CSS CLI
 * Commands for configuration validation and management
 */

const { validateConfigCommand, generateScssCommand } = require('./src/config-loader.cjs');

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
EVA CSS - Fluid Design Framework

Usage:
  eva-css <command> [options]

Commands:
  validate       Validate eva.config.js or package.json configuration
  generate       Generate SCSS variables from config file
  help           Show this help message

Examples:
  eva-css validate
  eva-css generate src/_config-generated.scss

Configuration:
  Create eva.config.js in your project root or add "eva" key to package.json
  See: https://eva-css.xyz/configuration
`);
}

switch (command) {
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
