/**
 * generateClassOverrides + generateBridge tests
 *
 * Verifies:
 * - Each input class generates 4 (spacing) or 3 (font) intensity rules.
 * - Selector escaping is correct (`\\[`, `\\]`).
 * - rem-input classes preserve their original `rem` selector but reference px-based vars.
 * - generateBridge wires vars + theme + overrides together.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  generateClassOverrides,
  generateBridge,
  generateTheme,
} from '../dist/index.mjs';

test('spacing class generates 4 intensity rules', () => {
  const css = generateClassOverrides(['p-[32px]']);
  const rules = css.trim().split('\n').filter(Boolean);

  assert.equal(rules.length, 4);
  assert.match(rules[0], /\.p-\\\[32px\\\]__\s*{\s*padding:\s*var\(--32__\)/);
  assert.match(rules[1], /\.p-\\\[32px\\\]_\s*{\s*padding:\s*var\(--32_\)/);
  assert.match(rules[2], /\.p-\\\[32px\\\]\s*{\s*padding:\s*var\(--32\)/);
  assert.match(rules[3], /\.p-\\\[32px\\\]-\s*{\s*padding:\s*var\(--32-\)/);
});

test('font class generates 3 intensity rules with --fs- prefix', () => {
  const css = generateClassOverrides(['text-[48px]']);
  const rules = css.trim().split('\n').filter(Boolean);

  assert.equal(rules.length, 3);
  assert.ok(rules.every(r => r.includes('font-size: var(--fs-48')));
});

test('rem-input class keeps rem in selector but uses px-based var', () => {
  const css = generateClassOverrides(['gap-[1rem]']);

  // Selector preserves rem (matches what TW emits to DOM)
  assert.ok(css.includes('.gap-\\[1rem\\]'));
  // But var name uses the px equivalent (1rem = 16px → --16)
  assert.ok(css.includes('var(--16)'));
});

test('unknown classes are silently skipped', () => {
  const css = generateClassOverrides([
    'p-[32px]',
    'grid-cols-1',     // not a size utility
    'foo-[10px]',      // unknown prefix
    'gap-[24px]',
  ]);

  // Only p-[32px] and gap-[24px] should produce rules
  assert.ok(css.includes('var(--32)'));
  assert.ok(css.includes('var(--24)'));
  assert.ok(!css.includes('grid-cols'));
  assert.ok(!css.includes('foo'));
});

test('generateBridge with no classes produces vars + @theme block', () => {
  const css = generateBridge({
    sizes: [16, 32],
    fontSizes: [16],
  });

  assert.ok(css.includes(':root {'));
  assert.ok(css.includes('--16:'));
  assert.ok(css.includes('--32:'));
  assert.ok(css.includes('--fs-16:'));
  assert.ok(css.includes('@theme {'));
  assert.ok(css.includes('--spacing-16:'));
  assert.ok(css.includes('--font-size-16:'));
});

test('generateBridge with classes produces vars + class overrides (no @theme)', () => {
  const css = generateBridge({
    sizes: [16, 32],
    fontSizes: [16],
    classes: ['p-[32px]'],
  });

  assert.ok(css.includes(':root {'));
  assert.ok(css.includes('.p-\\[32px\\]'));
  assert.ok(!css.includes('@theme'), 'should not include @theme when classes are provided');
});

test('generateTheme respects defaultIntensity', () => {
  const cssDefault = generateTheme({ sizes: [32], fontSizes: [16] });
  const cssExtreme = generateTheme({ sizes: [32], fontSizes: [16], defaultIntensity: '__' });

  assert.ok(cssDefault.includes('--spacing-32: var(--32)'));
  assert.ok(cssExtreme.includes('--spacing-32: var(--32__)'));
});
