# EVA CSS - Custom Sizes Example

Shows how to extract sizes from your design system (e.g., Figma) and use them directly in EVA CSS.

## 📄 Files

- `main.scss` - Configuration with design-specific measurements

## 🎨 The Design Story

This example is based on a real Figma design with these specific measurements:

- **4px** - Small gap between color swatches
- **8px** - Spacing for color gaps
- **16px** - Standard padding
- **32px** - Section spacing
- **64px** - Hero section padding
- **120px** - Hero heading font size
- **141px** - Circle avatar dimensions

Instead of forcing your design into a predefined scale (like 8, 16, 24, 32...), EVA CSS lets you use your exact measurements.

## 🚀 Usage

Compile with Sass:

```bash
npx sass --load-path=../../../packages main.scss output.css
```

Or from the monorepo root:

```bash
npx sass --load-path=packages examples/scss/custom-sizes/main.scss examples/scss/custom-sizes/output.css
```

## 📦 What You Get

### CSS Variables
All your design sizes as fluid variables:
- `var(--4)` - Small gap
- `var(--8)` - Color gap
- `var(--16)` - Standard padding
- `var(--32)` - Section spacing
- `var(--64)` - Hero padding
- `var(--120)` - Heading size
- `var(--141)` - Circle dimensions

### Utility Classes
Generated from your custom sizes:
- `.w-4`, `.w-8`, `.w-16`, `.w-32`, `.w-64`, `.w-120`, `.w-141`
- `.h-*`, `.p-*`, `.m-*`, `.g-*`, `.br-*` variants
- All with the same custom sizes

### Font Classes
- `.fs-16` - Body text
- `.fs-120` - Hero heading

## 💡 How to Use This Approach

1. **Extract Sizes from Your Design**
   - Open your Figma/Sketch/Adobe XD file
   - Note all unique spacing values
   - Note all font sizes
   - List them in order

2. **Add to EVA CSS**
   ```scss
   @use 'eva-css/index' with (
     $sizes: (4, 8, 16, 32, 64, 120, 141),  // Your extracted sizes
     $font-sizes: (16, 120),                 // Your font scale
     $build-class: true
   );
   ```

3. **Use in Your Code**
   ```scss
   .hero {
     padding: var(--64);
     font-size: var(--120);
   }

   .section {
     padding: var(--32);
   }

   .avatar {
     width: var(--141);
     height: var(--141);
     border-radius: 50%;
   }
   ```

## ✨ Benefits

### Pixel-Perfect Implementation
- No rounding or approximation
- Exact match to design specs
- Designers happy, developers happy

### Still Fluid
- Even though you use exact pixel values from design
- EVA CSS converts them to fluid `clamp()` functions
- Responsive without media queries

### No Mental Math
- `var(--141)` is clearer than `var(--9)`
- Self-documenting code
- Easy to maintain

## 🎯 When to Use

This approach is perfect for:

- ✅ Implementing specific designs (Figma, Sketch, etc.)
- ✅ Design systems with defined measurements
- ✅ Client projects with strict design specs
- ✅ Teams with designers and developers

## 🔄 Alternative Approach

If you prefer semantic names over numbers:

```scss
@use 'eva-css/index' with (
  $sizes: (
    4,    // xs-gap
    8,    // sm-gap
    16,   // padding
    32,   // section
    64,   // hero
    120,  // heading
    141   // avatar
  )
);

// Then document the mapping in comments
```

## 📚 Next Steps

- Try [custom-class](../custom-class/) to minimize CSS output
- See [basic](../basic/) for a simpler starting point
- Check [../../projects/](../../projects/) for complete projects
