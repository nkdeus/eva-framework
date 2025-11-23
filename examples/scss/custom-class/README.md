# EVA CSS - Custom Class Mode Example

Demonstrates `$custom-class` mode to generate only the utility classes you need. Perfect for production optimization!

## 📄 Files

- `main.scss` - Configuration with selective class generation

## 🎯 The Problem

By default, EVA CSS generates utility classes for ALL properties × ALL sizes:

```
4 sizes × 16 properties = 64 utility classes
```

This is great for development, but in production you might only use a handful of these classes.

## ✅ The Solution: Custom Class Mode

With `$custom-class: true`, you specify exactly which classes to generate:

```scss
@use 'eva-css/index' with (
  $sizes: (16, 24, 50, 100),
  $custom-class: true,
  $class-config: (
    w: (50, 100),      // ONLY .w-50 and .w-100
    h: (50, 100),      // ONLY .h-50 and .h-100
    px: (24,),         // ONLY .px-24
    py: (24,),         // ONLY .py-24
    g: (24, 50),       // ONLY .g-24 and .g-50
    br: (16,)          // ONLY .br-16
  )
);
```

**Result:** Only 9 utility classes instead of 64!

## 🚀 Usage

Compile with Sass:

```bash
npx sass --load-path=../../../packages main.scss output.css
```

Or from the monorepo root:

```bash
npx sass --load-path=packages examples/scss/custom-class/main.scss examples/scss/custom-class/output.css
```

## 📦 What You Get

### CSS Variables (All Sizes Still Available!)
- `var(--16)`, `var(--24)`, `var(--50)`, `var(--100)`
- You can use any size in your custom CSS
- Variables are NOT filtered by `$class-config`

### Utility Classes (Only What You Specified)
- `.w-50`, `.w-100` - Width
- `.h-50`, `.h-100` - Height
- `.px-24` - Padding inline
- `.py-24` - Padding block
- `.g-24`, `.g-50` - Gap
- `.br-16` - Border radius

### NOT Generated
- ❌ `.w-16`, `.w-24` - Not in class-config
- ❌ `.p-*` - Property not in class-config
- ❌ `.m-*` - Property not in class-config
- ❌ All other combinations

## 💡 When to Use

Custom class mode is perfect for:

- ✅ Production builds
- ✅ You know exactly which classes you need
- ✅ Optimizing bundle size (60-90% reduction)
- ✅ Style guide with limited utility classes

## 📊 Size Comparison

Example project comparison:

| Mode | Utility Classes | CSS Size |
|------|----------------|----------|
| Normal | 64 classes | ~8 KB |
| Custom Class | 9 classes | ~1.2 KB |
| **Savings** | **86% fewer** | **85% smaller** |

## 🔧 Configuration Reference

### Available Properties

You can configure these properties in `$class-config`:

- `w` - Width
- `mw` - Max-width
- `h` - Height
- `p` - Padding
- `px` - Padding inline (left/right)
- `py` - Padding block (top/bottom)
- `pt`, `pr`, `pb`, `pl` - Individual padding
- `m` - Margin
- `mx` - Margin inline
- `my` - Margin block
- `mt`, `mr`, `mb`, `ml` - Individual margin
- `g`, `gap` - Gap
- `br` - Border-radius

### Syntax Notes

Values must be lists, even for single items:

```scss
// ✅ Correct
$class-config: (
  px: (24,),      // Trailing comma makes it a list
  w: (50, 100)    // Multiple values is already a list
)

// ❌ Wrong
$class-config: (
  px: 24,         // Not a list - will error
  w: (50 100)     // Space-separated - will error
)
```

## 🎯 Best Practices

### 1. Start with Normal Mode

Develop with normal mode (`$build-class: true`) first:

```scss
// Development
@use 'eva-css/index' with (
  $sizes: (16, 24, 50, 100),
  $build-class: true
);
```

### 2. Audit Your HTML

Find which classes you actually use:

```bash
# Find all utility classes in your HTML
grep -ohr 'class="[^"]*"' . | grep -o '\.[a-z-]*-[0-9]*' | sort | uniq
```

### 3. Switch to Custom Class

Create production build with only used classes:

```scss
// Production
@use 'eva-css/index' with (
  $sizes: (16, 24, 50, 100),
  $custom-class: true,
  $class-config: (
    // Only classes you found in step 2
  )
);
```

### 4. Keep Variables Available

Even with custom class mode, you can use any size variable:

```scss
.custom-component {
  padding: var(--16);    // ✅ Works
  margin: var(--50);     // ✅ Works
  gap: var(--100);       // ✅ Works
}
```

## 🚨 Common Mistakes

### Mistake 1: Forgetting the Trailing Comma

```scss
// ❌ Wrong
px: (24)  // This is just the number 24

// ✅ Correct
px: (24,) // This is a list with one item
```

### Mistake 2: Wrong Separator

```scss
// ❌ Wrong
w: (50 100)  // Space-separated

// ✅ Correct
w: (50, 100) // Comma-separated
```

### Mistake 3: Expecting Variables to Be Filtered

```scss
// Custom class mode does NOT filter CSS variables
// Variables are ALWAYS available for all sizes
```

## 📚 Next Steps

- Use this for production optimization
- Try [basic](../basic/) for learning
- See [custom-sizes](../custom-sizes/) for design-specific measurements
- Check [../../projects/](../../projects/) for complete projects
