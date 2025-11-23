# create-eva-css

Scaffolding tool for EVA CSS projects. Get started with a fully configured EVA CSS project in seconds.

## Quick Start

```bash
# Using npm
npm init eva-css my-project

# Using npx
npx create-eva-css my-project

# Using pnpm
pnpm create eva-css my-project

# Using yarn
yarn create eva-css my-project
```

## Interactive Setup

The CLI will guide you through:

1. **Template Selection** - Choose from 3 presets:
   - **Minimal**: Variables only, no utility classes
   - **Utility**: Full utility classes mode
   - **Full**: Everything + examples + theme switching

2. **Design Sizes** - Enter your design system sizes (from Figma, etc.)

3. **Font Sizes** - Enter your font size scale

4. **Package Manager** - Choose npm, pnpm, or yarn

5. **Dependency Installation** - Automatically install dependencies

## CLI Options

For non-interactive usage:

```bash
npx create-eva-css my-project \
  --preset utility \
  --sizes "16,24,32,64,128" \
  --font-sizes "16,24,32,48" \
  --package-manager pnpm
```

### Options

| Option | Description | Values |
|--------|-------------|--------|
| `--preset` | Project template | `minimal`, `utility`, `full` |
| `--sizes` | Comma-separated size values | e.g. `"16,24,32,64"` |
| `--font-sizes` | Comma-separated font sizes | e.g. `"16,24,32"` |
| `--package-manager` | Package manager to use | `npm`, `pnpm`, `yarn` |
| `--help` | Show help message | - |

## What Gets Generated

```
my-project/
├── eva.config.cjs      # EVA CSS configuration
├── package.json        # Project dependencies
├── .gitignore          # Git ignore rules
├── README.md           # Project documentation
├── index.html          # Demo page
└── styles/
    └── main.scss       # Main stylesheet
```

## Generated Scripts

The scaffolded project includes these npm scripts:

```json
{
  "build": "sass styles/main.scss:styles/main.css",
  "build:watch": "sass --watch styles/main.scss:styles/main.css",
  "build:purge": "sass ... && eva-purge ...",
  "dev": "npm run build:watch"
}
```

## Next Steps After Generation

```bash
# Navigate to project
cd my-project

# Start development (watch mode)
npm run dev

# Open index.html in your browser

# Build for production (with purge)
npm run build:purge
```

## Template Presets

### Minimal

Perfect for custom component libraries:

- Variables only mode (`@use 'eva-css-fluid/variables'`)
- No utility classes generated
- Minimal CSS output
- Full access to fluid size variables

### Utility

Best for rapid prototyping:

- Full utility class system
- All EVA CSS features enabled
- Pre-configured theme
- Example HTML with utility classes

### Full

Complete starter with examples:

- Everything from Utility preset
- Theme switching demo
- Gradient examples
- Component patterns
- Comprehensive documentation

## Configuration

All projects include `eva.config.cjs` for easy customization:

```javascript
module.exports = {
  sizes: [16, 24, 32, 64],        // Your design sizes
  fontSizes: [16, 24, 32],        // Your font scale
  buildClass: true,               // Generate utilities
  purge: {
    enabled: false,               // Enable for production
    content: ['**/*.html'],
    // ... more options
  }
};
```

## Examples

### From Figma Design

```bash
# Extract sizes from your Figma design: 8, 16, 24, 32, 48, 64, 96
# Extract font sizes: 14, 16, 20, 24, 32, 48

npx create-eva-css my-figma-project \
  --preset utility \
  --sizes "8,16,24,32,48,64,96" \
  --font-sizes "14,16,20,24,32,48"
```

### Quick Prototype

```bash
npx create-eva-css prototype --preset full
cd prototype
npm run dev
# Open index.html
```

### Component Library

```bash
npx create-eva-css my-components --preset minimal
cd my-components
npm install
npm run dev
```

## Troubleshooting

### Permission Errors

```bash
# If you get permission errors on Windows:
npx create-eva-css my-project

# On Linux/Mac:
sudo npm init eva-css my-project
```

### Package Manager Issues

The tool auto-detects your package manager, but you can force one:

```bash
npx create-eva-css my-project --package-manager pnpm
```

## Resources

- [EVA CSS Documentation](https://eva-css.xyz/)
- [GitHub Repository](https://github.com/nkdeus/eva)
- [Migration Guide](https://github.com/nkdeus/eva/blob/main/packages/eva-css/MIGRATION.md)
- [eva-css-fluid Package](https://www.npmjs.com/package/eva-css-fluid)
- [eva-css-purge Package](https://www.npmjs.com/package/eva-css-purge)

## License

MIT © [Michaël Tati](https://ulysse-2029.com/)
