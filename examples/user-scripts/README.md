# EVA CSS Build Script for User Projects

This directory contains a ready-to-use build script template for using JSON configuration in your own projects.

## What is this for?

SCSS cannot directly load JavaScript configuration files like `eva.config.cjs`. This script bridges that gap by:

1. Reading your `eva.config.cjs` configuration
2. Converting it to SCSS variables
3. Injecting those variables into your SCSS
4. Compiling the final CSS

## Quick Setup

### 1. Copy the script to your project

```bash
# From your project root
mkdir -p scripts
cp node_modules/eva-css-fluid/examples/user-scripts/build-with-config.js scripts/
```

Or download directly:

```bash
curl -o scripts/build-with-config.js https://raw.githubusercontent.com/nkdeus/eva/main/examples/user-scripts/build-with-config.js
chmod +x scripts/build-with-config.js
```

### 2. Create your EVA configuration

Create `eva.config.cjs` in your project root:

```javascript
// eva.config.cjs
module.exports = {
  sizes: [4, 8, 16, 32, 64, 128],
  fontSizes: [14, 16, 20, 24, 32],
  buildClass: true,
  pxRemSuffix: false
};
```

### 3. Simplify your SCSS

Your SCSS can now be super clean:

```scss
// styles/main.scss
@use 'eva-css-fluid';

// Your custom styles here
```

### 4. Add build script to package.json

```json
{
  "scripts": {
    "build:css": "node scripts/build-with-config.js styles/main.scss dist/main.css",
    "watch:css": "nodemon --watch styles --watch eva.config.cjs --ext scss,cjs --exec 'npm run build:css'"
  },
  "devDependencies": {
    "sass": "^1.70.0",
    "nodemon": "^3.0.0"
  }
}
```

### 5. Build your CSS

```bash
npm run build:css
```

## Usage

### Basic Usage

```bash
node scripts/build-with-config.js <input.scss> <output.css>
```

### Examples

```bash
# Build main stylesheet
node scripts/build-with-config.js styles/main.scss dist/main.css

# Build multiple files
node scripts/build-with-config.js src/app.scss public/css/app.css
```

## Configuration

The script automatically looks for configuration in this order:

1. `eva.config.cjs` (recommended)
2. `eva.config.js`
3. `package.json` (in the `"eva"` key)

If no configuration is found, EVA CSS uses default values.

### Example: package.json configuration

```json
{
  "eva": {
    "sizes": [4, 8, 16, 32, 64],
    "fontSizes": [16, 24, 32],
    "buildClass": true
  }
}
```

## Watch Mode

For development, use `nodemon` to rebuild automatically when files change:

```bash
npm install --save-dev nodemon
```

Add to package.json:

```json
{
  "scripts": {
    "watch:css": "nodemon --watch styles --watch eva.config.cjs --ext scss,cjs --exec 'npm run build:css'"
  }
}
```

Run:

```bash
npm run watch:css
```

## Supported Configuration Options

All EVA CSS configuration options are supported:

- `sizes` - Array of size values
- `fontSizes` - Array of font size values
- `buildClass` - Generate utility classes (true) or variables only (false)
- `pxRemSuffix` - Add px/rem static values for debugging
- `nameBySize` - Use size values in variable names
- `customClass` - Enable custom class filtering
- `classConfig` - Map of properties to sizes for custom classes
- `debug` - Show configuration summary during compilation

See the main [EVA CSS README](../../packages/eva-css/README.md) for full documentation.

## Troubleshooting

### Error: "Input file not found"

Make sure your input SCSS file path is correct relative to where you run the command.

```bash
# ✅ Correct
node scripts/build-with-config.js styles/main.scss dist/main.css

# ❌ Incorrect (if styles folder doesn't exist in current directory)
node scripts/build-with-config.js main.scss main.css
```

### Error: "npx: command not found"

Install Node.js and npm. The script requires Node.js to run.

### Config not being applied

1. Verify `eva.config.cjs` is in your project root (not in a subdirectory)
2. Check that the config file exports correctly with `module.exports = {...}`
3. Enable debug mode to see what's being loaded:

```javascript
// eva.config.cjs
module.exports = {
  sizes: [4, 8, 16, 32],
  debug: true  // Shows configuration during build
};
```

### SCSS import not found

Make sure `eva-css-fluid` is installed:

```bash
npm install eva-css-fluid
```

## Alternative: SCSS Variables (Simpler)

If you find this script too complex for your needs, you can use SCSS variables directly:

```scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 128,
  $font-sizes: 14, 16, 20, 24, 32,
  $build-class: true
);
```

Compile with:

```bash
npx sass --load-path=node_modules styles/main.scss:dist/main.css
```

**Pros:** Simpler, works immediately
**Cons:** Config duplicated if you have multiple SCSS files

## License

MIT - Same as EVA CSS framework
