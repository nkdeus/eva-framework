/**
 * SCSS equivalence test
 *
 * Compiles _eva.scss with a fixture config, then verifies that
 * generateVars() produces the exact same clamp() values for every
 * size × intensity combination.
 *
 * SCSS is the source of truth — TS must match byte-for-byte.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateVars } from '../dist/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');
const SASS_BIN = join(REPO_ROOT, 'node_modules', 'sass', 'sass.js');
const TMP_DIR = join(__dirname, '.tmp');

mkdirSync(TMP_DIR, { recursive: true });

// Sizes intentionally include edge cases:
// - 4 (smallest typical), 16 (required base), 100 (non-power-of-2),
// - 140 (large, typical for hero padding), 256 (very large)
const SIZES = [4, 8, 16, 24, 32, 48, 64, 96, 100, 140, 256];
const FONT_SIZES = [12, 14, 16, 18, 24, 32, 48, 56];

function compileScssReference() {
  const fixture = `@use 'packages/eva-css/src/eva' with (
  $sizes: (${SIZES.join(', ')}),
  $font-sizes: (${FONT_SIZES.join(', ')}),
  $build-class: false,
  $px-rem-suffix: false
);
`;
  const fixturePath = join(TMP_DIR, 'fixture.scss');
  const outPath = join(TMP_DIR, 'fixture.css');
  writeFileSync(fixturePath, fixture, 'utf-8');

  execFileSync('node', [
    SASS_BIN,
    fixturePath,
    outPath,
    '--style=expanded',
    '--no-source-map',
    `--load-path=${REPO_ROOT}`,
  ], { stdio: 'pipe' });

  return readFileSync(outPath, 'utf-8');
}

/** Extract `--name: clamp(...)` pairs from CSS, ignoring formatting. */
function parseVars(css) {
  const out = new Map();
  const re = /--([a-zA-Z0-9_\-]+):\s*(clamp\([^)]+\));/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    out.set(m[1], m[2]);
  }
  return out;
}

test('every spacing var matches SCSS (4 intensities × all sizes)', () => {
  const scssCss = compileScssReference();
  const tsCss = generateVars({ sizes: SIZES, fontSizes: FONT_SIZES });

  const scssVars = parseVars(scssCss);
  const tsVars = parseVars(tsCss);

  const intensities = ['__', '_', '', '-'];
  const failures = [];

  for (const size of SIZES) {
    for (const intensity of intensities) {
      const name = `${size}${intensity}`;
      const scssVal = scssVars.get(name);
      const tsVal = tsVars.get(name);

      if (scssVal !== tsVal) {
        failures.push(`--${name}\n    SCSS: ${scssVal}\n    TS:   ${tsVal}`);
      }
    }
  }

  assert.equal(failures.length, 0, `Mismatched spacing vars:\n${failures.join('\n\n')}`);
});

test('every font-size var matches SCSS (3 intensities × all font sizes)', () => {
  const scssCss = compileScssReference();
  const tsCss = generateVars({ sizes: SIZES, fontSizes: FONT_SIZES });

  const scssVars = parseVars(scssCss);
  const tsVars = parseVars(tsCss);

  const intensities = ['__', '_', ''];
  const failures = [];

  for (const size of FONT_SIZES) {
    for (const intensity of intensities) {
      const name = `fs-${size}${intensity}`;
      const scssVal = scssVars.get(name);
      const tsVal = tsVars.get(name);

      if (scssVal !== tsVal) {
        failures.push(`--${name}\n    SCSS: ${scssVal}\n    TS:   ${tsVal}`);
      }
    }
  }

  assert.equal(failures.length, 0, `Mismatched font-size vars:\n${failures.join('\n\n')}`);
});

test('TS generates exactly the expected number of vars (no extras, no missing)', () => {
  const tsCss = generateVars({ sizes: SIZES, fontSizes: FONT_SIZES });
  const tsVars = parseVars(tsCss);

  // 4 spacing intensities × N sizes + 3 font intensities × M font sizes
  const expected = SIZES.length * 4 + FONT_SIZES.length * 3;
  assert.equal(tsVars.size, expected);
});
