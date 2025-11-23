# EVA CSS Configuration Workflows

This guide compares the two configuration methods for EVA CSS: **SCSS Variables** and **JSON Configuration**.

## Quick Comparison

| Aspect | SCSS Variables | JSON Config |
|--------|----------------|-------------|
| **Setup Time** | 2 minutes | 10 minutes |
| **Complexity** | ⭐ Simple | ⭐⭐⭐ Advanced |
| **Build Command** | `npx sass` | Custom script |
| **Watch Mode** | `npx sass --watch` | `nodemon` + script |
| **Config Location** | Inside SCSS file | Separate `.cjs` file |
| **Multiple Files** | Duplicate config | Shared config |
| **Validation** | No | `npx eva-css validate` |
| **Best For** | Learning, simple projects | Production, teams |

## Workflow 1: SCSS Variables

### Overview

Configuration is defined directly in your SCSS file using Sass's `@use ... with ()` syntax.

### When to Choose This

✅ **You're learning EVA CSS** - Get started immediately without extra setup
✅ **Simple project** - One or two SCSS files
✅ **Quick prototyping** - No build script overhead
✅ **Standard Sass workflow** - Familiar if you've used Sass before
✅ **Watch mode simplicity** - Native Sass watch without extra tools

### Setup

#### 1. Install EVA CSS

```bash
npm install eva-css-fluid sass
```

#### 2. Create Your SCSS File

```scss
// styles/main.scss
@use 'eva-css-fluid' with (
  // Your design sizes from Figma
  $sizes: 4, 8, 16, 32, 64, 128,

  // Your font sizes
  $font-sizes: 14, 16, 20, 24, 32,

  // Generate utility classes
  $build-class: true
);

// Your custom styles
.hero {
  padding: var(--32);
  font-size: var(--24);
}
```

#### 3. Add Build Script

```json
{
  "scripts": {
    "build": "npx sass --load-path=node_modules styles/main.scss:dist/main.css",
    "watch": "npx sass --load-path=node_modules --watch styles/main.scss:dist/main.css"
  }
}
```

#### 4. Build Your CSS

```bash
# One-time build
npm run build

# Watch mode (rebuilds on file changes)
npm run watch
```

### Complete Example

**Project structure:**

```
my-project/
├── package.json
├── styles/
│   └── main.scss
└── dist/
    └── main.css
```

**styles/main.scss:**

```scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 128,
  $font-sizes: 14, 16, 20, 24, 32,
  $build-class: true,
  $debug: true
);

.custom-component {
  width: var(--64);
  padding: var(--16);
  gap: var(--8);
}
```

**package.json:**

```json
{
  "name": "my-project",
  "scripts": {
    "build": "npx sass --load-path=node_modules styles/main.scss:dist/main.css",
    "watch": "npx sass --load-path=node_modules --watch styles/main.scss:dist/main.css"
  },
  "devDependencies": {
    "eva-css-fluid": "^2.0.0",
    "sass": "^1.70.0"
  }
}
```

### Pros & Cons

**Advantages:**
- ✅ **Instant setup** - Works immediately after install
- ✅ **No build script** - Use standard `npx sass` command
- ✅ **Simple watch mode** - Native Sass watch works perfectly
- ✅ **Self-contained** - Configuration in the same file as usage
- ✅ **No dependencies** - Only needs Sass

**Disadvantages:**
- ⚠️ **Config duplication** - Must copy configuration across multiple SCSS files
- ⚠️ **No validation** - Typos discovered only during compilation
- ⚠️ **SCSS syntax** - Less familiar than JSON for non-developers
- ⚠️ **Harder to share** - Can't easily import config in JavaScript build tools

### Multiple Files Scenario

If you have multiple SCSS files, you need to duplicate the configuration:

```scss
// styles/main.scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64,
  $font-sizes: 16, 24, 32,
  $build-class: true
);
```

```scss
// styles/components.scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64,
  $font-sizes: 16, 24, 32,
  $build-class: true
);
```

**Workaround:** Create a config file and import it:

```scss
// styles/_config.scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64,
  $font-sizes: 16, 24, 32,
  $build-class: true
);
```

```scss
// styles/main.scss
@use 'config';
```

```scss
// styles/components.scss
@use 'config';
```

## Workflow 2: JSON Configuration

### Overview

Configuration is defined in a separate `eva.config.cjs` file and injected into SCSS via a build script.

### When to Choose This

✅ **Multiple SCSS files** - Share configuration across your project
✅ **Team collaboration** - JSON is easier for non-SCSS developers
✅ **Config validation** - Catch errors before building
✅ **Build pipeline integration** - Works with Webpack, Vite, etc.
✅ **Design system** - Centralized source of truth for design tokens

### Setup

#### 1. Install Dependencies

```bash
npm install eva-css-fluid sass
```

#### 2. Copy Build Script Template

```bash
mkdir -p scripts
cp node_modules/eva-css-fluid/examples/user-scripts/build-with-config.js scripts/
```

Or download:

```bash
curl -o scripts/build-with-config.js https://raw.githubusercontent.com/nkdeus/eva/main/examples/user-scripts/build-with-config.js
```

#### 3. Create Configuration File

```javascript
// eva.config.cjs
module.exports = {
  // Your design sizes
  sizes: [4, 8, 16, 32, 64, 128],

  // Your font sizes
  fontSizes: [14, 16, 20, 24, 32],

  // Generate utility classes
  buildClass: true,

  // Optional: Debug mode
  debug: false
};
```

#### 4. Create Your SCSS File

```scss
// styles/main.scss
@use 'eva-css-fluid';

// Your custom styles
.hero {
  padding: var(--32);
  font-size: var(--24);
}
```

#### 5. Add Build Scripts

```json
{
  "scripts": {
    "build": "node scripts/build-with-config.js styles/main.scss dist/main.css",
    "watch": "nodemon --watch styles --watch eva.config.cjs --ext scss,cjs --exec 'npm run build'",
    "validate": "npx eva-css validate"
  },
  "devDependencies": {
    "eva-css-fluid": "^2.0.0",
    "sass": "^1.70.0",
    "nodemon": "^3.0.0"
  }
}
```

#### 6. Build Your CSS

```bash
# Validate configuration
npm run validate

# One-time build
npm run build

# Watch mode
npm run watch
```

### Complete Example

**Project structure:**

```
my-project/
├── eva.config.cjs
├── package.json
├── scripts/
│   └── build-with-config.js
├── styles/
│   ├── main.scss
│   ├── components.scss
│   └── utilities.scss
└── dist/
    ├── main.css
    ├── components.css
    └── utilities.css
```

**eva.config.cjs:**

```javascript
module.exports = {
  // Design system tokens
  sizes: [4, 8, 16, 32, 64, 128],
  fontSizes: [14, 16, 20, 24, 32, 48],

  // Options
  buildClass: true,
  pxRemSuffix: false,
  debug: process.env.NODE_ENV === 'development',

  // Theme
  theme: {
    name: 'myapp',
    colors: {
      brand: '#ff5733',
      accent: '#7300ff'
    }
  }
};
```

**styles/main.scss:**

```scss
// Clean! No configuration here
@use 'eva-css-fluid';

.hero {
  padding: var(--32);
  background: var(--brand);
}
```

**styles/components.scss:**

```scss
// Same config automatically applied
@use 'eva-css-fluid';

.card {
  padding: var(--16);
  gap: var(--8);
}
```

**package.json:**

```json
{
  "name": "my-project",
  "scripts": {
    "build:all": "npm run build:main && npm run build:components",
    "build:main": "node scripts/build-with-config.js styles/main.scss dist/main.css",
    "build:components": "node scripts/build-with-config.js styles/components.scss dist/components.css",
    "watch": "nodemon --watch styles --watch eva.config.cjs --ext scss,cjs --exec 'npm run build:all'",
    "validate": "npx eva-css validate"
  },
  "devDependencies": {
    "eva-css-fluid": "^2.0.0",
    "sass": "^1.70.0",
    "nodemon": "^3.0.0"
  }
}
```

### Pros & Cons

**Advantages:**
- ✅ **Single source of truth** - One config file for entire project
- ✅ **Validation** - `npx eva-css validate` catches errors early
- ✅ **JSON format** - Familiar to all developers
- ✅ **Clean SCSS** - No configuration clutter in stylesheets
- ✅ **Better for teams** - Easier to review and maintain

**Disadvantages:**
- ⚠️ **Setup complexity** - Requires build script
- ⚠️ **Not standard Sass** - Can't use `npx sass` directly
- ⚠️ **Extra dependency** - Need `nodemon` or similar for watch mode
- ⚠️ **Learning curve** - More moving parts to understand

## Side-by-Side Comparison

### Scenario: Adding a New Size

**SCSS Variables:**

1. Edit `styles/main.scss`
2. Add `200` to `$sizes` list
3. Save file
4. Rebuild (automatic if watching)

```scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 128, 200  // ← Added 200
);
```

**JSON Config:**

1. Edit `eva.config.cjs`
2. Add `200` to `sizes` array
3. Save file
4. Rebuild (automatic if watching)

```javascript
module.exports = {
  sizes: [4, 8, 16, 32, 64, 128, 200]  // ← Added 200
};
```

**Winner:** Tie - Both equally simple

### Scenario: Multiple SCSS Files

**SCSS Variables:**

```scss
// file1.scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 128
);
```

```scss
// file2.scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64, 128  // ← Duplicated config
);
```

**JSON Config:**

```javascript
// eva.config.cjs (once)
module.exports = {
  sizes: [4, 8, 16, 32, 64, 128]
};
```

```scss
// file1.scss
@use 'eva-css-fluid';
```

```scss
// file2.scss
@use 'eva-css-fluid';  // ← Same config automatically
```

**Winner:** JSON Config - No duplication

### Scenario: Validating Configuration

**SCSS Variables:**

No validation - errors discovered during compilation:

```
Error: Expected number, was "sixty-four"
```

**JSON Config:**

```bash
$ npx eva-css validate
❌ Configuration invalid:
  - sizes[5]: Expected number, got string "sixty-four"
```

**Winner:** JSON Config - Early error detection

### Scenario: Watch Mode

**SCSS Variables:**

```bash
npx sass --watch styles:dist
```

Simple, no extra dependencies.

**JSON Config:**

```bash
nodemon --watch styles --watch eva.config.cjs --exec 'npm run build'
```

Requires `nodemon` and custom script.

**Winner:** SCSS Variables - Simpler watch mode

## Decision Tree

```
Start: I want to use EVA CSS with custom configuration

├─ Do you have more than 2 SCSS files?
│  ├─ NO
│  │  └─ Use SCSS Variables (simpler)
│  │
│  └─ YES
│     ├─ Do you want centralized design tokens?
│        ├─ YES → Use JSON Config
│        └─ NO → Use SCSS Variables (with _config.scss import pattern)

├─ Are you working in a team?
│  ├─ YES
│  │  └─ Use JSON Config (easier for non-SCSS developers)
│  │
│  └─ NO → Use SCSS Variables (simpler setup)

├─ Do you need config validation?
│  ├─ YES → Use JSON Config
│  └─ NO → Use SCSS Variables

└─ Is this your first time using EVA CSS?
   ├─ YES → Use SCSS Variables (learn EVA first, optimize later)
   └─ NO → Choose based on project needs above
```

## Migration Between Methods

### From SCSS Variables to JSON Config

**Before:**

```scss
// styles/main.scss
@use 'eva-css-fluid' with (
  $sizes: 4, 8, 16, 32, 64,
  $font-sizes: 16, 24, 32,
  $build-class: true
);
```

**After:**

1. Create `eva.config.cjs`:
   ```javascript
   module.exports = {
     sizes: [4, 8, 16, 32, 64],
     fontSizes: [16, 24, 32],
     buildClass: true
   };
   ```

2. Simplify SCSS:
   ```scss
   @use 'eva-css-fluid';
   ```

3. Set up build script (see JSON Config setup above)

4. Update `package.json` scripts

**Generated CSS is identical!**

### From JSON Config to SCSS Variables

**Before:**

```javascript
// eva.config.cjs
module.exports = {
  sizes: [4, 8, 16, 32, 64],
  fontSizes: [16, 24, 32],
  buildClass: true
};
```

**After:**

1. Copy values to SCSS:
   ```scss
   @use 'eva-css-fluid' with (
     $sizes: 4, 8, 16, 32, 64,
     $font-sizes: 16, 24, 32,
     $build-class: true
   );
   ```

2. Update package.json to use standard Sass:
   ```json
   {
     "scripts": {
       "build": "npx sass styles/main.scss:dist/main.css"
     }
   }
   ```

3. Delete `eva.config.cjs` and build script

**Generated CSS is identical!**

## Hybrid Approach

You can use **both methods** in the same project:

**Use JSON config** for shared base styles:
```javascript
// eva.config.cjs
module.exports = {
  sizes: [4, 8, 16, 32, 64],  // Project-wide sizes
  fontSizes: [16, 24, 32]
};
```

**Use SCSS variables** for file-specific overrides:
```scss
@use 'eva-css-fluid' with (
  $build-class: false,  // Override: this file uses variables only
  $debug: true
);
```

## Recommendations

### For Beginners

Start with **SCSS Variables**:
- Faster to learn EVA CSS concepts
- One less layer of complexity
- Familiar Sass workflow

Migrate to JSON config later if needed.

### For Production Projects

Use **JSON Config** if:
- Multiple developers
- Multiple SCSS files
- CI/CD pipeline
- Design system management

Use **SCSS Variables** if:
- Simple project structure
- Solo developer
- Quick iterations
- Minimal build tools

### For Teams

**JSON Config** is recommended:
- Easier for designers to update (JSON is universal)
- Config validation prevents errors
- Centralized design tokens
- Better for code reviews

## Next Steps

- See [JSON-CONFIG.md](./JSON-CONFIG.md) for detailed JSON configuration guide
- Check [EXAMPLES.md](./EXAMPLES.md) for complete project examples
- Read [../README.md](../README.md) for full EVA CSS documentation

## Summary

Both methods generate **identical CSS**. Choose based on your project needs:

- **Quick and simple?** → SCSS Variables
- **Multiple files and team?** → JSON Config
- **Not sure?** → Start with SCSS Variables, migrate later

The best workflow is the one that fits your project!
