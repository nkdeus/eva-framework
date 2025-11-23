# EVA CSS Migration Guide

This guide helps you migrate from your internal framework to EVA CSS.

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration Changes](#configuration-changes)
- [Common Gotchas](#common-gotchas)
- [Breaking Changes](#breaking-changes)
- [Migration Examples](#migration-examples)

## Quick Start

### Installation

```bash
npm install eva-css-fluid
```

### Basic Setup

Replace your old framework import with EVA CSS:

```scss
// Before (internal framework)
@import 'internal-framework/styles';

// After (EVA CSS)
@use 'eva-css-fluid/src' as *;
```

### With Custom Configuration

```scss
@use 'eva-css-fluid/src' as * with (
  $sizes: (4, 8, 12, 16, 24, 32, 48, 64, 96, 128),
  $font-sizes: (12, 14, 16, 18, 20, 24, 32, 48)
);
```

## Configuration Changes

### Required Base Size

**Important**: EVA CSS requires size `16` to be present in your `$sizes` configuration.

```scss
// ❌ Will throw error
@use 'eva-css-fluid/src' as * with (
  $sizes: (8, 24, 32, 64)
);

// ✅ Correct
@use 'eva-css-fluid/src' as * with (
  $sizes: (8, 16, 24, 32, 64)
);
```

**Why?** Size 16 (1rem) is used as the base unit for fluid calculations.

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `$sizes` | `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` | Available size values (16 required) |
| `$font-sizes` | `12, 14, 16, 18, 20, 24, 32, 48` | Font size values |
| `$build-class` | `true` | Generate utility classes |
| `$px-rem-suffix` | `false` | Add px/rem debug values |
| `$name-by-size` | `true` | Use size values in names |
| `$custom-class` | `false` | Enable selective class generation |
| `$class-config` | `()` | Configure which classes to generate |

## Common Gotchas

### 1. Import Syntax Change

EVA CSS uses modern Sass `@use` instead of `@import`:

```scss
// ❌ Old syntax (deprecated)
@import 'eva-css-fluid/src';

// ✅ New syntax
@use 'eva-css-fluid/src' as *;
```

### 2. Custom Class Mode

When using `$custom-class: true`, you **must** provide `$class-config`:

```scss
// ❌ Will throw error
@use 'eva-css-fluid/src' as * with (
  $custom-class: true
);

// ✅ Correct
@use 'eva-css-fluid/src' as * with (
  $custom-class: true,
  $class-config: (
    w: (50, 100),
    px: (24,),     // Note: trailing comma for single-item lists
    g: (24, 50)
  )
);
```

### 3. Property Names in class-config

Only use valid property keys from the framework:

```scss
// ❌ Invalid property
$class-config: (
  width: (50, 100)  // Use 'w' not 'width'
);

// ✅ Correct
$class-config: (
  w: (50, 100)
);
```

**Available properties**: `w`, `mw`, `h`, `p`, `px`, `pr`, `py`, `br`, `mb`, `mr`, `ml`, `mt`, `pt`, `pb`, `g`, `gap`

### 4. Sizes Must Exist in $sizes

All sizes referenced in `$class-config` must exist in your `$sizes` list:

```scss
// ❌ Will throw error (999 not in $sizes)
@use 'eva-css-fluid/src' as * with (
  $sizes: (16, 24, 50, 100),
  $custom-class: true,
  $class-config: (
    w: (50, 999)
  )
);

// ✅ Correct
@use 'eva-css-fluid/src' as * with (
  $sizes: (16, 24, 50, 100),
  $custom-class: true,
  $class-config: (
    w: (50, 100)
  )
);
```

## Breaking Changes

### Version 1.1.0

#### Added

- **`$class-config` parameter**: New configuration option for custom class mode
- **Configuration validation**: Helpful error messages for invalid configurations
- **Required base size**: Size 16 is now required in `$sizes`

#### Changed

- `$custom-class` now requires `$class-config` to be set (if enabled)
- Empty `$sizes` or `$font-sizes` lists now throw errors

#### Migration Steps

1. Ensure size `16` is in your `$sizes` configuration
2. If using `$custom-class: true`, add `$class-config` parameter
3. Test compilation to catch any validation errors

## Migration Examples

### Example 1: From Internal Framework

```scss
// Before
@import 'internal-framework';

$spacing: 8px, 16px, 24px, 32px;
$colors: (
  primary: #3498db,
  secondary: #2ecc71
);

// After
@use 'eva-css-fluid/src' as * with (
  $sizes: (8, 16, 24, 32)
);

// Colors are built-in with OKLCH system
// Use: var(--brand), var(--accent), etc.
```

### Example 2: Production Build with Custom Classes

**Scenario**: You want to generate only specific classes to reduce CSS size.

```scss
// Before (generated all classes)
@use 'eva-css-fluid/src' as *;

// After (optimized)
@use 'eva-css-fluid/src' as * with (
  $sizes: (16, 24, 50, 100),
  $custom-class: true,
  $class-config: (
    w: (50, 100),      // Only width-50 and width-100
    h: (50, 100),      // Only height-50 and height-100
    px: (24,),         // Only padding-x-24
    py: (24,),         // Only padding-y-24
    g: (24, 50),       // Only gap-24 and gap-50
    br: (16,)          // Only border-radius-16
  )
);
```

**Result**: Significantly smaller CSS output, perfect for production.

### Example 3: Development Mode

**Scenario**: You're in development and want CSS variables only (no classes).

```scss
@use 'eva-css-fluid/src' as * with (
  $build-class: false,    // Don't generate utility classes
  $px-rem-suffix: true    // Add debug values
);
```

Then use in your CSS:

```scss
.my-component {
  width: var(--64);
  padding: var(--16);
  border-radius: var(--8);

  // Debug values available:
  // var(--64-px)  → pixel value
  // var(--64-rem) → rem value
}
```

### Example 4: Gradual Migration

**Scenario**: You want to migrate gradually, keeping both frameworks.

```scss
// Load EVA CSS with custom namespace
@use 'eva-css-fluid/src' as eva with (
  $sizes: (16, 24, 32, 48, 64)
);

// Keep your old framework temporarily
@import 'old-framework';

// Now you can use both:
.new-component {
  padding: var(--eva-16);
}

.old-component {
  padding: $old-spacing-md;
}
```

## Troubleshooting

### Error: "Size 16 is required as a base size"

**Solution**: Add `16` to your `$sizes` list:

```scss
@use 'eva-css-fluid/src' as * with (
  $sizes: (4, 8, 16, 24, 32, 48, 64)  // Add 16 here
);
```

### Error: "Unknown property 'xyz' in $class-config"

**Solution**: Use valid property abbreviations. Check the list of available properties in [Common Gotchas](#3-property-names-in-class-config).

### Error: "When $custom-class is true, $class-config must be a map"

**Solution**: Provide a valid `$class-config` map:

```scss
@use 'eva-css-fluid/src' as * with (
  $custom-class: true,
  $class-config: (
    w: (50, 100),
    px: (24,)
  )
);
```

### Compilation is Slow

**Solutions**:

1. Use `$custom-class: true` to reduce generated classes
2. Use `$build-class: false` if you only need CSS variables
3. Disable `$px-rem-suffix` in production

### CSS Output is Too Large

**Solutions**:

1. Enable custom class mode:
   ```scss
   @use 'eva-css-fluid/src' as * with (
     $custom-class: true,
     $class-config: (
       // Only include what you need
     )
   );
   ```

2. Use the `eva-purge` package to remove unused classes:
   ```bash
   npm install @eva-css/eva-purge
   eva-purge input.css output.css --html "**/*.html"
   ```

## Getting Help

- **Documentation**: [eva-css.xyz](https://eva-css.xyz)
- **GitHub Issues**: [github.com/nkdeus/eva/issues](https://github.com/nkdeus/eva/issues)
- **Examples**: See `demo/` folder in the repository

## Next Steps

1. ✅ Complete the migration
2. 📚 Read the [full documentation](./README.md)
3. 🎨 Explore the [OKLCH color system](./README.md#-oklch-color-system)
4. ⚡ Optimize your build with [custom classes](./README.md#custom-class-mode-custom-class-true)
