#!/usr/bin/env node

/**
 * create-eva-css
 * Scaffolding tool for EVA CSS projects
 *
 * Usage: npm init eva-css my-project
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CLI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(msg) {
  console.log(msg);
}

function success(msg) {
  log(`${colors.green}✓${colors.reset} ${msg}`);
}

function info(msg) {
  log(`${colors.blue}ℹ${colors.reset} ${msg}`);
}

function error(msg) {
  log(`${colors.red}✗${colors.reset} ${msg}`);
}

function title(msg) {
  log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`);
}

// Readline interface for prompts
function prompt(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${colors.cyan}?${colors.reset} ${question} `, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function select(question, options) {
  log(`${colors.cyan}?${colors.reset} ${question}`);
  options.forEach((opt, i) => {
    log(`  ${colors.dim}${i + 1}.${colors.reset} ${opt.label}${opt.description ? ` ${colors.dim}- ${opt.description}${colors.reset}` : ''}`);
  });

  const answer = await prompt('  Select (1-' + options.length + '):');
  const index = parseInt(answer) - 1;

  if (index >= 0 && index < options.length) {
    return options[index].value;
  }

  error('Invalid selection, using default');
  return options[0].value;
}

async function confirm(question, defaultValue = true) {
  const defaultText = defaultValue ? 'Y/n' : 'y/N';
  const answer = await prompt(`${question} (${defaultText})`);

  if (!answer) return defaultValue;
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

// Template generators
function generatePackageJson(projectName, packageManager) {
  return {
    name: projectName,
    version: '1.0.0',
    description: 'EVA CSS Fluid Design Project',
    private: true,
    type: 'module',
    scripts: {
      build: 'sass styles/main.scss:styles/main.css',
      'build:watch': 'sass --watch styles/main.scss:styles/main.css',
      'build:purge': 'sass styles/main.scss:styles/main.css && eva-purge --css styles/main.css --content "**/*.html"',
      dev: 'npm run build:watch'
    },
    dependencies: {
      'eva-css-fluid': '^1.0.4'
    },
    devDependencies: {
      'sass': '^1.77.0',
      'eva-css-purge': '^1.0.4'
    }
  };
}

function generateEvaConfig(sizes, fontSizes, preset) {
  return `/**
 * EVA CSS Configuration
 *
 * Customize these values to match your design system
 */

module.exports = {
  // Size values for spacing, width, height, etc.
  sizes: [${sizes.join(', ')}],

  // Font size values
  fontSizes: [${fontSizes.join(', ')}],

  // Generate utility classes
  buildClass: true,

  // Show debug info during compilation
  debug: ${preset === 'full'},

  // Production optimization
  purge: {
    enabled: false,  // Set to true for production
    content: ['**/*.html', '**/*.js'],
    css: 'styles/main.css',
    output: 'styles/main-purged.css',
    safelist: ['theme-', 'current-', 'toggle-theme']
  }
};
`;
}

function generateScss(preset) {
  if (preset === 'minimal') {
    return `// EVA CSS - Variables Only Mode
@use 'eva-css-fluid/variables';

// Your custom styles here
body {
  margin: 0;
  padding: var(--16);
  font-family: system-ui, -apple-system, sans-serif;
}
`;
  }

  if (preset === 'basic') {
    return `// EVA CSS - Basic Setup
@use 'eva-css-fluid';

// Your custom styles here
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background 0.3s, color 0.3s;
}
`;
  }

  if (preset === 'landing') {
    return `// EVA CSS - Landing Page
@use 'eva-css-fluid';

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background 0.3s, color 0.3s;
}

.hero {
  text-align: center;
  padding: var(--96) var(--32);
  background: linear-gradient(135deg, var(--brand), var(--accent));
  color: var(--light);

  h1 {
    font-size: var(--64);
    margin: 0 0 var(--24) 0;
    font-weight: bold;
  }

  p {
    font-size: var(--24);
    margin: 0 0 var(--48) 0;
    opacity: 0.9;
  }
}

.button {
  display: inline-block;
  padding: var(--16) var(--32);
  background: var(--light);
  color: var(--brand);
  border: none;
  border-radius: var(--8);
  font-size: var(--18);
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.features {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--96) var(--32);

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--32);
  }

  .card {
    background: var(--light);
    padding: var(--32);
    border-radius: var(--16);
    box-shadow: 0 2px 8px var(--dark___);
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-4px);
    }
  }
}
`;
  }

  if (preset === 'dashboard') {
    return `// EVA CSS - Dashboard
@use 'eva-css-fluid';

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background 0.3s, color 0.3s;
}

.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: var(--light);
  padding: var(--24);
  border-right: 1px solid var(--light__);

  nav a {
    display: block;
    padding: var(--12) var(--16);
    color: var(--dark);
    text-decoration: none;
    border-radius: var(--8);
    margin-bottom: var(--8);

    &:hover {
      background: var(--brand_);
      color: var(--brand);
    }
  }
}

.main-content {
  padding: var(--32);
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--24);
  margin-bottom: var(--32);
}

.metric-card {
  background: var(--light);
  padding: var(--24);
  border-radius: var(--12);
  box-shadow: 0 2px 8px var(--dark___);

  .value {
    font-size: var(--40);
    font-weight: bold;
    color: var(--brand);
  }
}
`;
  }

  // full preset
  return `// EVA CSS - Full Framework
@use 'eva-css-fluid' as *;

// Custom theme
.theme-myproject {
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;

  --accent-lightness: 51.7%;
  --accent-chroma: 0.293;
  --accent-hue: 289.66;
}

// Your custom styles here
`;
}

function generateHtml(projectName, preset) {
  const minimalContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="styles/main.css">
</head>
<body>
  <h1>Welcome to ${projectName}</h1>
  <p>Using EVA CSS Variables</p>
</body>
</html>
`;

  const basicContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="styles/main.css">
</head>
<body class="current-theme theme-eva _bg-light _c-dark_">
  <div class="p-32">
    <h1 class="fs-32 _c-brand">Welcome to ${projectName}</h1>
    <p class="fs-16 mt-16">Built with EVA CSS fluid design framework</p>

    <div class="mt-32 p-24 _bg-brand_ br-16">
      <p>Fluid responsive design with no breakpoints!</p>
    </div>

    <button class="p-16 mt-24 _bg-accent _c-light br-8" onclick="document.body.classList.toggle('toggle-theme')">
      Toggle Theme
    </button>
  </div>
</body>
</html>
`;

  const landingContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - Landing Page</title>
  <link rel="stylesheet" href="styles/main.css">
</head>
<body class="current-theme theme-eva all-grads _bg-light _c-dark_">
  <section class="hero">
    <h1>Welcome to ${projectName}</h1>
    <p>Build amazing products with EVA CSS fluid design framework</p>
    <a href="#features" class="button">Get Started</a>
  </section>

  <section class="features" id="features">
    <div class="grid">
      <div class="card">
        <h2>Fluid Design</h2>
        <p>Responsive sizing without media queries using CSS clamp() functions</p>
      </div>
      <div class="card">
        <h2>Auto Dark Mode</h2>
        <p>OKLCH color system with automatic lightness inversion</p>
      </div>
      <div class="card">
        <h2>Utility Classes</h2>
        <p>Generated from your design tokens for rapid development</p>
      </div>
    </div>
  </section>

  <script>
    const savedTheme = localStorage.getItem('eva-theme');
    if (savedTheme === 'dark') document.body.classList.add('toggle-theme');
  </script>
</body>
</html>
`;

  const dashboardContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - Dashboard</title>
  <link rel="stylesheet" href="styles/main.css">
</head>
<body class="current-theme theme-eva _bg-light_ _c-dark_">
  <div class="dashboard">
    <aside class="sidebar">
      <h1>${projectName}</h1>
      <nav>
        <a href="#" class="active">Dashboard</a>
        <a href="#">Analytics</a>
        <a href="#">Reports</a>
        <a href="#">Settings</a>
      </nav>
    </aside>

    <main class="main-content">
      <h2>Dashboard Overview</h2>

      <div class="metrics">
        <div class="metric-card">
          <div class="label">Total Users</div>
          <div class="value">12,543</div>
        </div>
        <div class="metric-card">
          <div class="label">Revenue</div>
          <div class="value">$48,392</div>
        </div>
        <div class="metric-card">
          <div class="label">Active</div>
          <div class="value">892</div>
        </div>
      </div>

      <button onclick="document.body.classList.toggle('toggle-theme')"
              style="padding: var(--12); background: var(--brand); color: var(--light); border: none; border-radius: var(--8); cursor: pointer;">
        Toggle Theme
      </button>
    </main>
  </div>

  <script>
    const savedTheme = localStorage.getItem('eva-theme');
    if (savedTheme === 'dark') document.body.classList.add('toggle-theme');
  </script>
</body>
</html>
`;

  const fullContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="styles/main.css">
</head>
<body class="current-theme theme-myproject">
  <div class="p-32">
    <h1 class="fs-48 _c-brand">Welcome to ${projectName}</h1>
    <p class="fs-16 _c-dark mt-16">Built with EVA CSS fluid design framework</p>

    <div class="mt-32 p-24 _bg-brand_ br-16">
      <h2 class="fs-24 _c-dark">Features</h2>
      <ul class="mt-16">
        <li class="_c-dark">Fluid responsive design</li>
        <li class="_c-dark">OKLCH color system</li>
        <li class="_c-dark">Modern gradients</li>
        <li class="_c-dark">Theme switching</li>
      </ul>
    </div>

    <div class="mt-32">
      <button class="p-16 _bg-accent _c-light br-8" onclick="document.body.classList.toggle('toggle-theme')">
        Toggle Theme
      </button>
    </div>
  </div>
</body>
</html>
`;

  if (preset === 'minimal') return minimalContent;
  if (preset === 'basic') return basicContent;
  if (preset === 'landing') return landingContent;
  if (preset === 'dashboard') return dashboardContent;
  return fullContent;
}

function generateReadme(projectName, preset) {
  return `# ${projectName}

EVA CSS Fluid Design Project

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Build CSS
npm run build

# Watch mode
npm run dev

# Build with purge (production)
npm run build:purge
\`\`\`

## Configuration

Edit \`eva.config.cjs\` to customize:
- Size values from your design
- Font sizes
- Build options
- Purge settings

## Documentation

- [EVA CSS Documentation](https://eva-css.xyz/)
- [GitHub Repository](https://github.com/nkdeus/eva)

## Project Structure

\`\`\`
${projectName}/
├── eva.config.cjs      # EVA CSS configuration
├── package.json
├── index.html          # Demo page
└── styles/
    └── main.scss       # Main stylesheet
\`\`\`

## Next Steps

1. Customize sizes in \`eva.config.cjs\` to match your design
2. Edit \`styles/main.scss\` to add custom styles
3. Build your project in \`index.html\`
4. Run \`npm run dev\` to watch for changes

Happy coding! 🚀
`;
}

async function createProject(projectName, options = {}) {
  try {
    title('🎨 EVA CSS Project Scaffolding');

    // Get project directory
    const targetDir = path.resolve(process.cwd(), projectName);

    // Check if directory exists
    if (fs.existsSync(targetDir)) {
      error(`Directory ${projectName} already exists!`);
      const overwrite = await confirm('Overwrite?', false);
      if (!overwrite) {
        log('\nAborted.');
        process.exit(0);
      }
      fs.rmSync(targetDir, { recursive: true, force: true });
    }

    // Get configuration
    let preset, sizes, fontSizes, packageManager;

    if (options.preset) {
      preset = options.preset;
    } else {
      preset = await select('Select project template:', [
        { label: 'Minimal', value: 'minimal', description: 'Variables only, no utilities' },
        { label: 'Basic', value: 'basic', description: 'Simple utility classes setup' },
        { label: 'Landing', value: 'landing', description: 'Marketing landing page' },
        { label: 'Dashboard', value: 'dashboard', description: 'Admin dashboard UI' },
        { label: 'Full', value: 'full', description: 'Everything + examples' }
      ]);
    }

    if (options.sizes) {
      sizes = options.sizes.split(',').map(s => parseInt(s.trim()));
    } else {
      const sizesInput = await prompt('Design sizes (comma-separated) [16,24,32,64]:');
      sizes = sizesInput ? sizesInput.split(',').map(s => parseInt(s.trim())) : [16, 24, 32, 64];
    }

    if (options.fontSizes) {
      fontSizes = options.fontSizes.split(',').map(s => parseInt(s.trim()));
    } else {
      const fontSizesInput = await prompt('Font sizes (comma-separated) [16,24,32]:');
      fontSizes = fontSizesInput ? fontSizesInput.split(',').map(s => parseInt(s.trim())) : [16, 24, 32];
    }

    if (options.packageManager) {
      packageManager = options.packageManager;
    } else {
      packageManager = await select('Package manager:', [
        { label: 'npm', value: 'npm' },
        { label: 'pnpm', value: 'pnpm' },
        { label: 'yarn', value: 'yarn' }
      ]);
    }

    // Create project structure
    log('\n📁 Creating project structure...');
    fs.mkdirSync(targetDir, { recursive: true });
    fs.mkdirSync(path.join(targetDir, 'styles'), { recursive: true });

    // Generate files
    log('📝 Generating files...');

    // package.json
    fs.writeFileSync(
      path.join(targetDir, 'package.json'),
      JSON.stringify(generatePackageJson(projectName, packageManager), null, 2)
    );
    success('Created package.json');

    // eva.config.cjs
    fs.writeFileSync(
      path.join(targetDir, 'eva.config.cjs'),
      generateEvaConfig(sizes, fontSizes, preset)
    );
    success('Created eva.config.cjs');

    // styles/main.scss
    fs.writeFileSync(
      path.join(targetDir, 'styles', 'main.scss'),
      generateScss(preset)
    );
    success('Created styles/main.scss');

    // index.html
    fs.writeFileSync(
      path.join(targetDir, 'index.html'),
      generateHtml(projectName, preset)
    );
    success('Created index.html');

    // README.md
    fs.writeFileSync(
      path.join(targetDir, 'README.md'),
      generateReadme(projectName, preset)
    );
    success('Created README.md');

    // .gitignore
    fs.writeFileSync(
      path.join(targetDir, '.gitignore'),
      'node_modules/\nstyles/*.css\nstyles/*.css.map\n.DS_Store\n'
    );
    success('Created .gitignore');

    // Install dependencies
    const shouldInstall = await confirm('\n📦 Install dependencies?', true);

    if (shouldInstall) {
      log(`\n⏳ Installing dependencies with ${packageManager}...`);
      try {
        const installCmd = packageManager === 'yarn' ? 'yarn' : `${packageManager} install`;
        execSync(installCmd, { cwd: targetDir, stdio: 'inherit' });
        success('Dependencies installed');
      } catch (error) {
        error('Failed to install dependencies');
        log('   You can install them manually later');
      }
    }

    // Success message
    title('✅ Project created successfully!');

    log(`\n${colors.bright}Next steps:${colors.reset}\n`);
    log(`  ${colors.dim}1.${colors.reset} cd ${projectName}`);
    if (!shouldInstall) {
      log(`  ${colors.dim}2.${colors.reset} ${packageManager} install`);
    }
    log(`  ${colors.dim}${shouldInstall ? '2' : '3'}.${colors.reset} ${packageManager} run dev`);
    log(`  ${colors.dim}${shouldInstall ? '3' : '4'}.${colors.reset} Open index.html in your browser\n`);

    log(`${colors.dim}Documentation: https://eva-css.xyz/${colors.reset}\n`);

  } catch (error) {
    log(`\n${colors.red}Error: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  log(`
${colors.bright}${colors.cyan}create-eva-css${colors.reset} - EVA CSS Project Scaffolding

Usage:
  npm init eva-css <project-name> [options]
  npx create-eva-css <project-name> [options]

Options:
  --preset <type>        Template preset (minimal|basic|landing|dashboard|full)
  --sizes <sizes>        Comma-separated size values
  --font-sizes <sizes>   Comma-separated font size values
  --package-manager <pm> Package manager (npm|pnpm|yarn)
  --help, -h             Show this help

Templates:
  minimal    - Variables only, no utilities
  basic      - Simple setup with utility classes
  landing    - Marketing landing page template
  dashboard  - Admin dashboard UI template
  full       - Everything + examples

Examples:
  npm init eva-css my-project
  npx create-eva-css my-app --preset landing
  npx create-eva-css my-dashboard --preset dashboard
  npx create-eva-css my-site --sizes "16,24,32,64" --font-sizes "16,24,32"
`);
  process.exit(0);
}

const projectName = args[0];
const options = {};

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--preset') options.preset = args[++i];
  if (args[i] === '--sizes') options.sizes = args[++i];
  if (args[i] === '--font-sizes') options.fontSizes = args[++i];
  if (args[i] === '--package-manager') options.packageManager = args[++i];
}

createProject(projectName, options);
