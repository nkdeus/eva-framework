# EVA CSS - Basic Example

The simplest possible EVA CSS setup with minimal configuration.

## 📄 Files

- `main.scss` - Basic EVA CSS configuration

## 🚀 Usage

Compile with Sass:

```bash
npx sass --load-path=../../../packages main.scss output.css
```

Or from the monorepo root:

```bash
npx sass --load-path=packages examples/scss/basic/main.scss examples/scss/basic/output.css
```

## 📦 What's Included

This basic setup gives you:

### CSS Variables
- `var(--8)` through `var(--64)` - Fluid spacing scale
- `var(--brand)`, `var(--accent)`, `var(--light)`, `var(--dark)` - Color system
- All with automatic OKLCH dark mode inversion

### Utility Classes
- `.w-*` - Width (e.g., `.w-64`)
- `.h-*` - Height (e.g., `.h-48`)
- `.p-*` - Padding (e.g., `.p-16`)
- `.px-*`, `.py-*` - Padding inline/block
- `.m-*`, `.mx-*`, `.my-*` - Margin variants
- `.g-*` - Gap for flex/grid
- `.br-*` - Border radius
- And more...

### Font Classes
- `.fs-14` through `.fs-32` - Fluid font sizes

## 💡 When to Use

This basic configuration is perfect for:

- ✅ Learning EVA CSS
- ✅ Quick prototypes
- ✅ Small projects
- ✅ Testing the framework

## 📝 Customizing

Edit the configuration in `main.scss`:

```scss
@use 'eva-css/index' with (
  $sizes: (8, 16, 24, 32, 48, 64),  // Your custom sizes
  $font-sizes: (14, 16, 20, 24, 32), // Your font scale
  $build-class: true
);
```

## 📚 Next Steps

- Add your own custom styles after the `@use` statement
- Try [custom-sizes](../custom-sizes/) for design-specific measurements
- See [custom-class](../custom-class/) to optimize bundle size
- Check [../../projects/](../../projects/) for complete project examples
