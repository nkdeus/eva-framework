# Suggestions pour améliorer la documentation EVA CSS

## Problème actuel

La documentation mentionne qu'il faut créer un script custom pour utiliser `eva.config.cjs` (ligne 218-238 du README), mais :

1. ❌ Le template mentionné n'existe pas : `examples/user-scripts/build-with-config.js` (404)
2. ❌ Pas d'exemple complet de script de build pour projet utilisateur
3. ❌ Pas d'explication sur comment intégrer le thème depuis eva.config.cjs
4. ❌ Pas de guide pour forward les modules SCSS correctement

## Ce qui manque dans la doc

### 1. Template de script de build fonctionnel

Le README ligne 222 référence :
```bash
curl -o scripts/build-eva.js https://raw.githubusercontent.com/nkdeus/eva/main/examples/user-scripts/build-with-config.js
```

**→ Ce fichier n'existe pas (404)**

### 2. Exemple complet de script utilisateur

Il faudrait un exemple de script qui montre :

```javascript
// scripts/build-eva.cjs
const { loadConfig, generateScssConfig } = require('eva-css-fluid/src/config-loader.cjs');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function build() {
  // 1. Charger eva.config.cjs
  const configResult = loadConfig({ silent: false });

  // 2. Générer SCSS temporaire avec config
  const tempConfigPath = path.join(__dirname, '../styles/_eva-config-temp.scss');
  generateScssConfig(configResult.config, tempConfigPath);

  // 3. Créer entry file qui importe EVA avec config
  const tempEntry = `
@use 'eva-config-temp' as cfg;

// Forward colors avec theme (si configuré)
@forward 'eva-css-fluid/src/colors' with (
  $theme-name: cfg.$theme-name,
  $theme-colors: cfg.$theme-colors,
  // ... autres variables theme
);

// Forward EVA CSS avec config
@forward 'eva-css-fluid' with (
  $sizes: cfg.$sizes,
  $font-sizes: cfg.$font-sizes,
  // ... autres variables
);

// Import votre SCSS personnalisé
@use 'main';
`;

  // 4. Compiler avec SASS
  execSync('npx sass --load-path=node_modules temp-entry.scss:output.css');

  // 5. Cleanup fichiers temporaires
  fs.unlinkSync(tempConfigPath);
}

build();
```

### 3. Section dédiée : "Configuration JSON - Guide complet"

Ajouter une section détaillée :

#### Quand utiliser JSON config vs SCSS variables

| Critère | SCSS Variables | JSON Config |
|---------|---------------|-------------|
| **Thème en HEX** | ❌ Pas supporté | ✅ Auto-converti en OKLCH |
| **Config partagée** | ⚠️ Dupliquer dans chaque fichier | ✅ Centralisée |
| **Validation** | ❌ Pas de validation | ✅ `npx eva-css validate` |
| **Setup** | ⭐ Simple (aucun script) | ⭐⭐ Moyen (script custom) |
| **CLI purge intégré** | ⚠️ Config séparée | ✅ Config unifiée |

#### Setup JSON config - Étape par étape

1. **Créer eva.config.cjs**
```javascript
module.exports = {
  sizes: [4, 8, 16, 32, 64],
  fontSizes: [14, 16, 20, 24],

  // Thème avec couleurs HEX (auto-converties)
  theme: {
    name: 'myapp',
    colors: {
      brand: '#3b82f6',    // Bleu Tailwind
      accent: '#22c55e',   // Vert Tailwind
      extra: '#a855f7'     // Violet Tailwind
    }
  },

  // Config purge (utilise eva-purge CLI)
  purge: {
    content: ['src/**/*.{html,js,vue}'],
    css: 'dist/style.css',
    output: 'dist/style-purged.css'
  }
};
```

2. **Créer le script de build** (avec template fourni)

3. **Ajouter scripts npm**
```json
{
  "scripts": {
    "build:css": "node scripts/build-eva.cjs",
    "purge": "eva-purge --config eva.config.cjs"
  }
}
```

4. **Simplifier votre SCSS**
```scss
// Plus besoin de configuration ici !
// Tout est dans eva.config.cjs

body {
  background: var(--light);
  color: var(--dark);
}
```

### 4. Documenter l'intégration du thème

Actuellement, la doc ne précise pas :

- Comment le thème est généré depuis eva.config.cjs
- Qu'il faut `@forward 'eva-css-fluid/src/colors'` avec les variables theme
- Comment appliquer le thème dans le HTML : `<body class="current-theme theme-myapp">`
- Le toggle dark mode : `<body class="current-theme theme-myapp toggle-theme">`

### 5. Section troubleshooting

Ajouter les erreurs communes :

**Erreur : "The target selector was not found" avec @extend**
```
Solution : Utiliser @forward au lieu de @use pour exposer les classes EVA
```

**Erreur : Le thème n'apparaît pas dans le CSS**
```
Solution : S'assurer que colors est importé avec les variables theme
```

## Structure suggérée pour la doc

```
README.md
├── Quick Start
├── Installation
├── Configuration Methods
│   ├── 🆕 Comparison Table (SCSS vs JSON)
│   ├── Method 1: SCSS Variables (Simple)
│   ├── Method 2: JSON Config (Advanced) ← AMÉLIORER ICI
│   │   ├── When to use
│   │   ├── Step-by-step setup
│   │   ├── 🆕 Build script template (working!)
│   │   └── 🆕 Theme integration
│   └── Migration guide (SCSS → JSON)
├── Theme Configuration 🆕
│   ├── HEX colors (auto-converted to OKLCH)
│   ├── Light/Dark mode setup
│   └── Applying theme in HTML
├── CSS Purge Integration 🆕
├── CLI Commands
└── Troubleshooting 🆕
```

## Exemples concrets à ajouter

### Exemple VuePress
```
vuepress-project/
├── eva.config.cjs          ← Config centralisée
├── scripts/
│   └── build-eva.cjs       ← Template fourni par EVA
├── docs/
│   └── .vuepress/
│       └── styles/
│           └── main.scss   ← Simplifié (sans config)
└── package.json
    "scripts": {
      "build": "node scripts/build-eva.cjs && vuepress build"
    }
```

### Exemple Next.js
```
nextjs-project/
├── eva.config.cjs
├── scripts/
│   └── build-eva.cjs
└── styles/
    └── globals.scss
```

## Liens utiles à ajouter

- [ ] Créer `examples/user-scripts/build-with-config.cjs` dans le repo
- [ ] Créer `examples/vuepress/` avec setup complet
- [ ] Créer `examples/nextjs/` avec setup complet
- [ ] Ajouter vidéo/GIF du setup JSON config

## Impact

Ces améliorations aideraient les utilisateurs à :
- ✅ Comprendre rapidement SCSS vs JSON config
- ✅ Setup JSON config en 5 minutes (vs 1h+ actuellement)
- ✅ Utiliser le thème HEX sans galère
- ✅ Intégrer eva-purge facilement
- ✅ Éviter les erreurs communes

## Conclusion

La fonctionnalité JSON config est **excellente** et très puissante, mais la documentation actuelle ne la met pas assez en valeur. Avec ces améliorations, l'adoption serait beaucoup plus facile !
