# EVA Framework - Scripts de Publication

Scripts pour publier les packages EVA sur NPM avec gestion automatique des versions.

## Scripts Disponibles

### Version 2 (Recommandé) - Avec bump automatique

- `publish-packages-v2.sh` - Version Bash (Linux/macOS)
- `publish-packages-v2.ps1` - Version PowerShell (Windows)

**Nouvelles fonctionnalités:**
- ✅ Bump automatique de version (patch/minor/major)
- ✅ Version custom manuelle
- ✅ Mise à jour des dépendances inter-packages
- ✅ Résumé détaillé avant publication
- ✅ Gestion d'erreurs améliorée
- ✅ Instructions post-publication (git tag, commit)

### Version 1 (Legacy)

- `publish-packages.sh` - Version originale Bash
- `publish-packages.ps1` - Version originale PowerShell

Ces scripts conservent les versions actuelles sans les bumper.

## Utilisation

### Bash (Linux/macOS/WSL)

```bash
# Rendre le script exécutable
chmod +x scripts/publish-packages-v2.sh

# Exécuter
./scripts/publish-packages-v2.sh
```

### PowerShell (Windows)

```powershell
# Exécuter
.\scripts\publish-packages-v2.ps1
```

## Workflow de Publication

### 1. Choix du Type de Version

Le script vous demandera quel type de bump effectuer:

```
1) patch   - 2.0.0 → 2.0.1 (corrections de bugs)
2) minor   - 2.0.0 → 2.1.0 (nouvelles fonctionnalités, rétrocompatible)
3) major   - 2.0.0 → 3.0.0 (changements breaking)
4) custom  - Spécifier une version manuellement (ex: 2.1.5)
5) skip    - Garder les versions actuelles
```

**Quand utiliser chaque type:**

- **patch (2.0.x)** - Bug fixes, corrections de typos, petites améliorations
- **minor (2.x.0)** - Nouvelles features, nouvelles commandes CLI, nouveaux templates
- **major (x.0.0)** - Breaking changes, refonte d'API, changements incompatibles

### 2. Vérification

Le script affiche:
- Versions actuelles vs nouvelles versions
- Contenu de chaque package
- Taille des packages

### 3. Confirmation

```
Êtes-vous prêt à publier ces packages sur NPM ?
Cette action est irréversible !

Taper 'yes' pour continuer:
```

### 4. Publication

Le script publie dans l'ordre:
1. `eva-colors`
2. `eva-css-fluid`
3. `eva-css-purge`
4. `create-eva-css`

### 5. Post-Publication

Le script affiche les commandes à exécuter:

```bash
# 1. Commit des changements
git add packages/*/package.json
git commit -m "chore: bump versions to 2.1.0"

# 2. Créer un tag
git tag v2.1.0
git push origin main --tags

# 3. Vérifier sur NPM
# Liens NPM affichés
```

## Exemples

### Exemple 1: Patch Release (Bug Fix)

```bash
$ ./scripts/publish-packages-v2.sh

📊 Versions actuelles:
  eva-colors: v2.0.0
  eva-css-fluid: v2.0.0
  eva-css-purge: v2.0.0
  create-eva-css: v2.0.0

🔢 Quel type de version bump ?
Votre choix (1-5): 1

✓ Version bump: patch

📦 Mise à jour des versions:
  eva-colors: 2.0.0 → 2.0.1
  eva-css-fluid: 2.0.0 → 2.0.1
  eva-css-purge: 2.0.0 → 2.0.1
  create-eva-css: 2.0.0 → 2.0.1
```

### Exemple 2: Minor Release (New Features)

```bash
$ ./scripts/publish-packages-v2.sh

Votre choix (1-5): 2

✓ Version bump: minor

📦 Mise à jour des versions:
  eva-colors: 2.0.0 → 2.1.0
  eva-css-fluid: 2.0.0 → 2.1.0
  eva-css-purge: 2.0.0 → 2.1.0
  create-eva-css: 2.0.0 → 2.1.0
```

### Exemple 3: Version Custom

```bash
$ ./scripts/publish-packages-v2.sh

Votre choix (1-5): 4

Nouvelle version (ex: 2.1.0): 2.0.5

✓ Version custom: 2.0.5

📦 Mise à jour des versions:
  eva-colors: 2.0.0 → 2.0.5
  eva-css-fluid: 2.0.0 → 2.0.5
  eva-css-purge: 2.0.0 → 2.0.5
  create-eva-css: 2.0.0 → 2.0.5
```

### Exemple 4: Annulation

```bash
Êtes-vous prêt à publier ces packages sur NPM ?
Taper 'yes' pour continuer: no

❌ Publication annulée
🔄 Annulation des changements de version...
```

Si vous annulez, les modifications de version sont automatiquement annulées via `git checkout`.

## Dépendances Inter-Packages

Le script met automatiquement à jour les dépendances:

- `eva-css-fluid` dépend de `eva-colors`
- Quand `eva-colors` est bumpé à `2.1.0`, `eva-css-fluid` est mis à jour pour utiliser `^2.1.0`

## Prérequis

### Avant la publication

1. **Connexion NPM**
   ```bash
   npm login
   npm whoami  # Vérifier
   ```

2. **Build réussi**
   - Le script build automatiquement `eva-css-fluid`
   - Assurez-vous que les autres packages sont prêts

3. **Tests passés**
   - Exécutez les tests avant de publier
   - Vérifiez les exemples

4. **Accès en écriture**
   - Vous devez avoir les droits de publication sur NPM
   - Pour les packages `@eva/*` et `eva-css-*`

### Packages publiés

- [`eva-colors`](https://www.npmjs.com/package/eva-colors)
- [`eva-css-fluid`](https://www.npmjs.com/package/eva-css-fluid)
- [`eva-css-purge`](https://www.npmjs.com/package/eva-css-purge)
- [`create-eva-css`](https://www.npmjs.com/package/create-eva-css)

## Sémantique de Version

EVA Framework suit [Semantic Versioning 2.0.0](https://semver.org/)

**Format:** `MAJOR.MINOR.PATCH`

- **MAJOR** - Changements incompatibles avec versions précédentes
- **MINOR** - Nouvelles fonctionnalités rétrocompatibles
- **PATCH** - Corrections de bugs rétrocompatibles

### Exemples de Changements

**PATCH (2.0.x):**
- Fix: Correction d'un bug dans la génération CSS
- Docs: Typos dans la documentation
- Perf: Amélioration performance sans changer l'API

**MINOR (2.x.0):**
- Feat: Nouvelle commande CLI `eva-css init`
- Feat: Nouveau template `landing` dans create-eva-css
- Feat: Support nouvelle option de config (avec fallback)

**MAJOR (x.0.0):**
- Breaking: Changement du nom d'une variable SCSS
- Breaking: Suppression d'une option de config
- Breaking: Modification du format de eva.config.cjs

## Troubleshooting

### Erreur: "not logged in to npm"

```bash
npm login
# Suivre les instructions
```

### Erreur: "permission denied"

```bash
# Vérifier les droits
npm owner ls eva-css-fluid

# Si nécessaire, demander l'accès au propriétaire
```

### Erreur: "version already exists"

Si vous avez déjà publié une version:

```bash
# Choisir 'patch', 'minor', ou 'major' pour bumper
# Ou choisir 'custom' avec une version plus haute
```

### Package trop gros

```bash
# Vérifier .npmignore
cat packages/eva-css/.npmignore

# Voir ce qui sera publié
cd packages/eva-css
npm pack --dry-run
```

### Rollback d'une publication

⚠️ **NPM ne permet PAS de supprimer/rollback une version publiée!**

Options:
1. Publier une nouvelle version avec le fix (recommandé)
2. Deprecate la version problématique:
   ```bash
   npm deprecate eva-css-fluid@2.1.0 "Use version 2.1.1 instead"
   ```

## Best Practices

1. **Toujours tester avant de publier**
   ```bash
   # Tester les exemples
   cd examples/projects/simple-scss
   npm run build
   ```

2. **Vérifier le CHANGELOG**
   - Documenter les changements
   - Mettre à jour avant publication

3. **Créer un tag git après publication**
   ```bash
   git tag v2.1.0
   git push --tags
   ```

4. **Créer une GitHub Release**
   - Avec les notes du CHANGELOG
   - Lien vers NPM packages

5. **Tester l'installation après publication**
   ```bash
   # Dans un dossier temporaire
   npx create-eva-css test-install
   cd test-install
   npm install
   npm run build
   ```

## Support

Pour toute question:
- GitHub Issues: https://github.com/nkdeus/eva/issues
- Documentation: https://github.com/nkdeus/eva
