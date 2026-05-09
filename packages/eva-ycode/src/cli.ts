import { writeFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { generateBridge } from './generator.js';
import type { EvaYcodeConfig, Intensity } from './types.js';

const DEFAULT_CONFIG = `module.exports = {
  sizes: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48],
  screen: 1440,
  defaultIntensity: '',
};
`;

function parseArgs(args: string[]): Record<string, string | boolean> {
  const parsed: Record<string, string | boolean> = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, ...rest] = arg.slice(2).split('=');
      parsed[key] = rest.length > 0 ? rest.join('=') : true;
    }
  }
  return parsed;
}

function loadConfig(cwd: string): EvaYcodeConfig | null {
  const candidates = [
    'eva-tw.config.cjs',
    'eva-tw.config.js',
  ];

  for (const name of candidates) {
    const configPath = resolve(cwd, name);
    if (existsSync(configPath)) {
      return require(configPath);
    }
  }
  return null;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const flags = parseArgs(args.slice(1));
  const cwd = process.cwd();

  if (!command || command === '--help' || command === '-h') {
    console.log(`
eva-css-for-tailwind — Fluid design tokens bridge for Tailwind CSS 4

Commands:
  init        Create eva-tw.config.cjs with defaults
  generate    Generate bridge.css from config

Options (generate):
  --sizes="4,8,16,24,32,48"        Override sizes
  --font-sizes="12,14,16,18,24"    Override font sizes
  --intensity=<suffix>             Default intensity (__,_,,-)
  --stdout                         Output to stdout instead of file
  --out=<path>                     Output file path (default: bridge.css)
`);
    return;
  }

  if (command === 'init') {
    const configPath = join(cwd, 'eva-tw.config.cjs');
    if (existsSync(configPath)) {
      console.log('eva-tw.config.cjs already exists.');
      return;
    }
    writeFileSync(configPath, DEFAULT_CONFIG, 'utf-8');
    console.log('Created eva-tw.config.cjs');
    return;
  }

  if (command === 'generate') {
    let config = loadConfig(cwd);

    // CLI overrides
    if (flags['sizes'] && typeof flags['sizes'] === 'string') {
      const sizes = flags['sizes'].split(',').map(Number);
      config = { ...config, sizes, fontSizes: config?.fontSizes ?? [] };
    }
    if (flags['font-sizes'] && typeof flags['font-sizes'] === 'string') {
      const fontSizes = flags['font-sizes'].split(',').map(Number);
      config = { ...config, sizes: config?.sizes ?? [], fontSizes };
    }
    if (flags['intensity'] !== undefined && typeof flags['intensity'] === 'string') {
      config = {
        ...config,
        sizes: config?.sizes ?? [],
        fontSizes: config?.fontSizes ?? [],
        defaultIntensity: flags['intensity'] as Intensity,
      };
    }

    if (!config) {
      console.error('No config found. Run "eva-css-for-tailwind init" first, or pass --sizes and --font-sizes.');
      process.exit(1);
    }

    const css = generateBridge(config);

    if (flags['stdout']) {
      process.stdout.write(css);
    } else {
      const outPath = typeof flags['out'] === 'string'
        ? resolve(cwd, flags['out'])
        : join(cwd, 'bridge.css');
      writeFileSync(outPath, css, 'utf-8');
      console.log(`Generated ${outPath}`);
    }
    return;
  }

  console.error(`Unknown command: ${command}. Use --help for usage.`);
  process.exit(1);
}

main();
