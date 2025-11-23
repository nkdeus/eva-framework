# Changelog - Scripts de Publication

## Version 2 - Novembre 2025

### Nouveautés

#### 🎯 Bump Automatique de Version

Les scripts v2 permettent de bumper automatiquement les versions:

- **patch** - 2.0.0 → 2.0.1 (corrections)
- **minor** - 2.0.0 → 2.1.0 (nouvelles features)
- **major** - 2.0.0 → 3.0.0 (breaking changes)
- **custom** - Spécifier manuellement (ex: 2.0.5)
- **skip** - Garder les versions actuelles

#### 🔗 Mise à Jour des Dépendances

Gestion automatique des dépendances inter-packages:
- Quand `eva-colors` est bumpé, `eva-css-fluid` est mis à jour automatiquement
- Format: `^X.Y.Z` pour compatibilité semver

#### 📊 Interface Améliorée

- Affichage des versions actuelles avant bump
- Résumé détaillé avec tableau comparatif
- Code couleur pour meilleure lisibilité
- Messages d'erreur plus clairs

#### 🛡️ Sécurité

- Confirmation obligatoire avant publication
- Rollback automatique si annulation
- Validation de format de version pour custom
- Compteur de succès/échecs

#### 📝 Post-Publication

Instructions automatiques après publication:
- Commandes git pour commit
- Création de tag avec bonne version
- Liens NPM pour vérification
- Checklist prochaines étapes

### Fichiers Créés

```
scripts/
├── publish-packages-v2.sh          # Version Bash avec bump
├── publish-packages-v2.ps1         # Version PowerShell avec bump
├── README.md                       # Documentation complète
└── CHANGELOG-SCRIPTS.md            # Ce fichier
```

### Fichiers Legacy (conservés)

```
scripts/
├── publish-packages.sh             # Version originale Bash
└── publish-packages.ps1            # Version originale PowerShell
```

## Comparaison v1 vs v2

| Feature | v1 (Legacy) | v2 (Nouveau) |
|---------|-------------|--------------|
| Bump version automatique | ❌ | ✅ 5 options |
| Mise à jour dépendances | ❌ | ✅ Auto |
| Résumé avant publication | ⚠️ Basique | ✅ Détaillé |
| Rollback si annulation | ❌ | ✅ Auto |
| Instructions post-pub | ✅ Statique | ✅ Dynamique |
| Validation version | ❌ | ✅ Regex |
| Compteur succès/échecs | ❌ | ✅ |
| Code couleur | ⚠️ Limité | ✅ Complet |

## Migration v1 → v2

### Pour les utilisateurs actuels

Rien à changer! Les deux versions coexistent.

**Utiliser v1 si:**
- Vous gérez manuellement les versions
- Vous avez un workflow custom
- Vous ne voulez pas bumper les versions

**Utiliser v2 si:**
- Vous voulez bumper automatiquement
- Vous voulez les dépendances à jour
- Vous voulez un workflow guidé

### Workflow Recommandé

#### Avant publication

```bash
# 1. Vérifier l'état du repo
git status

# 2. S'assurer que tout est commit
git add .
git commit -m "feat: add new features"

# 3. Tests
npm test  # si disponible
cd examples/projects/simple-scss && npm run build

# 4. Vérifier les versions actuelles
grep '"version"' packages/*/package.json
```

#### Publication

```bash
# Utiliser le nouveau script v2
./scripts/publish-packages-v2.sh

# Choisir le type de bump
# Confirmer
# Le script publie tout
```

#### Après publication

```bash
# Suivre les instructions affichées par le script

# 1. Commit
git add packages/*/package.json
git commit -m "chore: bump versions to 2.1.0"

# 2. Tag
git tag v2.1.0
git push origin main --tags

# 3. Vérifier NPM
# Ouvrir les liens affichés
```

## Exemples d'Usage

### Cas 1: Bug Fix (patch)

**Scénario:** Correction d'un bug dans la génération CSS

```bash
$ ./scripts/publish-packages-v2.sh

Quel type de version bump ?
Votre choix (1-5): 1

✓ Version bump: patch

Mise à jour des versions:
  eva-colors: 2.0.0 → 2.0.1
  eva-css-fluid: 2.0.0 → 2.0.1
  eva-css-purge: 2.0.0 → 2.0.1
  create-eva-css: 2.0.0 → 2.0.1

[...]

Taper 'yes' pour continuer: yes

✅ Tous les packages publiés avec succès!

git add packages/*/package.json
git commit -m "chore: bump versions to 2.0.1"
git tag v2.0.1
```

### Cas 2: Nouvelle Feature (minor)

**Scénario:** Ajout de `eva-css init` et `eva-css setup`

```bash
$ ./scripts/publish-packages-v2.sh

Votre choix (1-5): 2

✓ Version bump: minor

Mise à jour des versions:
  eva-colors: 2.0.1 → 2.1.0
  eva-css-fluid: 2.0.1 → 2.1.0
  eva-css-purge: 2.0.1 → 2.1.0
  create-eva-css: 2.0.1 → 2.1.0

Mise à jour des dépendances inter-packages...
  ✓ eva-css-fluid → eva-colors: ^2.1.0

[...]

✅ Tous les packages publiés avec succès!

git commit -m "feat: add CLI init and setup commands"
git tag v2.1.0
```

### Cas 3: Hotfix Urgent (custom)

**Scénario:** Hotfix urgent nécessitant version spécifique

```bash
$ ./scripts/publish-packages-v2.sh

Votre choix (1-5): 4

Nouvelle version (ex: 2.1.0): 2.0.2

✓ Version custom: 2.0.2

Mise à jour des versions:
  eva-colors: 2.0.1 → 2.0.2
  [...]

[...]

git commit -m "fix: critical hotfix for CSS generation"
git tag v2.0.2
```

### Cas 4: Breaking Change (major)

**Scénario:** Refonte API, changements incompatibles

```bash
$ ./scripts/publish-packages-v2.sh

Votre choix (1-5): 3

⚠️  ATTENTION: Vous allez créer une version MAJOR
    Cela indique des breaking changes!
    Assurez-vous d'avoir mis à jour:
    - MIGRATION.md
    - CHANGELOG.md
    - README.md (breaking changes section)

Continuer? (yes/no): yes

✓ Version bump: major

Mise à jour des versions:
  eva-colors: 2.1.0 → 3.0.0
  eva-css-fluid: 2.1.0 → 3.0.0
  eva-css-purge: 2.1.0 → 3.0.0
  create-eva-css: 2.1.0 → 3.0.0

[...]

git commit -m "feat!: major API refactor"
git tag v3.0.0
```

## Améliorations Futures Possibles

### Court terme

- [ ] Dry-run mode (simulation sans publier)
- [ ] Skip certains packages
- [ ] Backup automatique avant bump

### Moyen terme

- [ ] Intégration GitHub Actions
- [ ] Génération CHANGELOG automatique
- [ ] Validation tests avant publication

### Long terme

- [ ] Interface interactive (ncurses/blessed)
- [ ] Rollback intelligent
- [ ] Notification Slack/Discord

## Support

Pour toute question ou suggestion:
- GitHub Issues: https://github.com/nkdeus/eva/issues
- Documentation: scripts/README.md
