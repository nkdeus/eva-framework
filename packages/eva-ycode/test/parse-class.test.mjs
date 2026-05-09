/**
 * parseClass coverage test
 *
 * Verifies:
 * - Every prefix in PROPERTY_MAP and FONT_PROPERTY_MAP parses correctly.
 * - rem values convert to px (1rem = 16px).
 * - Invalid classes return null.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseClass,
  PROPERTY_MAP,
  FONT_PROPERTY_MAP,
} from '../dist/index.mjs';

test('every spacing prefix parses', () => {
  for (const [prefix, property] of Object.entries(PROPERTY_MAP)) {
    const parsed = parseClass(`${prefix}-[24px]`);
    assert.ok(parsed, `${prefix}-[24px] should parse`);
    assert.equal(parsed.prefix, prefix);
    assert.equal(parsed.property, property);
    assert.equal(parsed.size, 24);
    assert.equal(parsed.unit, 'px');
    assert.equal(parsed.type, 'spacing');
  }
});

test('every font prefix parses', () => {
  for (const [prefix, property] of Object.entries(FONT_PROPERTY_MAP)) {
    const parsed = parseClass(`${prefix}-[32px]`);
    assert.ok(parsed, `${prefix}-[32px] should parse`);
    assert.equal(parsed.prefix, prefix);
    assert.equal(parsed.property, property);
    assert.equal(parsed.size, 32);
    assert.equal(parsed.type, 'font');
  }
});

test('rem values convert to px (1rem = 16px)', () => {
  const cases = [
    { cls: 'gap-[1rem]', expectedPx: 16 },
    { cls: 'p-[2rem]', expectedPx: 32 },
    { cls: 'py-[3rem]', expectedPx: 48 },
    { cls: 'text-[1.5rem]', expectedPx: 24 },
    { cls: 'mt-[0.5rem]', expectedPx: 8 },
  ];

  for (const { cls, expectedPx } of cases) {
    const parsed = parseClass(cls);
    assert.ok(parsed, `${cls} should parse`);
    assert.equal(parsed.size, expectedPx, `${cls} → ${expectedPx}px`);
    assert.equal(parsed.unit, 'rem');
  }
});

test('invalid classes return null', () => {
  const invalid = [
    'foo-[24px]',          // unknown prefix
    'p-[24em]',            // unsupported unit
    'p-[24]',              // missing unit
    'p-24',                // not arbitrary
    'grid-cols-1',         // structural utility, not a size
    '',
    'random text',
  ];

  for (const cls of invalid) {
    const parsed = parseClass(cls);
    assert.equal(parsed, null, `${cls} should not parse`);
  }
});

test('PROPERTY_MAP covers all yCode-relevant utilities', () => {
  // Sanity check: the spec lists 23 spacing/layout properties
  const expectedPrefixes = [
    'h', 'w', 'min-h', 'min-w', 'max-w', 'max-h',
    'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl',
    'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml',
    'gap',
    'rounded',
  ];
  for (const prefix of expectedPrefixes) {
    assert.ok(PROPERTY_MAP[prefix], `PROPERTY_MAP missing ${prefix}`);
  }
});

test('FONT_PROPERTY_MAP covers font utilities', () => {
  assert.equal(FONT_PROPERTY_MAP['text'], 'font-size');
});
