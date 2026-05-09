# TODO — Mise à jour des packages EVA

> Repo : `eva-framework` (monorepo pnpm). Publication des packages npm depuis `packages/*`.

## Stratégie globale

Deux usages distincts du framework, deux workflows :

| Usage | Package npm | Config | Statut |
|---|---|---|---|
| **Framework classique** (intégration SCSS dans un projet) | `eva-css-fluid` | `@use 'eva-css-fluid' with (...)` | SCSS-only — workflow JSON déprécié |
| **Bridge yCode** (visual builder, override de classes Tailwind arbitraires) | `eva-css-for-tailwind` (nouveau) | API programmatique + config JS | Nouveau package, à publier |
| Couleurs OKLCH (autonome) | `eva-colors` | — | Inchangé |
| Purge CSS (autonome) | `eva-css-purge` | — | Inchangé |

Le site **eva-css.xyz** documente déjà l'usage SCSS-only comme **seule** voie recommandée pour le framework classique. Le bridge yCode est un cas d'usage séparé : il génère du CSS dynamiquement côté yCode et n'a donc rien à voir avec le workflow SCSS utilisateur.

---

## 1. `eva-css-fluid` — passage SCSS-only

Objectif : faire du `@use 'eva-css-fluid' with (...)` la **seule** voie documentée et déprécier le workflow JSON sans casser les utilisateurs externes.

### 1.1 CLI — warning de dépréciation

Au lancement de `npx eva-css init|setup|validate|generate`, afficher en tête du stdout :

```
⚠️  DEPRECATED: Le workflow JSON sera retiré en v3.0.
   Migrez vers la config SCSS directe :
     @use 'eva-css-fluid' with ($sizes: (...), $font-sizes: (...));
   Voir : https://eva-css.xyz/framework/doc.html
```

Pas d'`exit 1`. Les commandes continuent de fonctionner — c'est juste un warning. Fichier concerné : `packages/eva-css/cli.cjs` (ajouter le print en tête de chaque case du switch).

### 1.2 README du package

- Encart "Deprecation notice" en haut du README, avant tout exemple.
- La section "JSON Configuration" passe sous un titre `## JSON Configuration [DEPRECATED]`.
- Le workflow SCSS (`@use ... with (...)`) devient le **seul** présenté en intro / quick-start.

### 1.3 CHANGELOG (entrée 2.x)

```
### Deprecated
- JSON config workflow (`eva.config.cjs`, CLI commands `init|setup|validate|generate`,
  custom build script). Will be removed in v3.0.0.
  Migrate to direct SCSS config: `@use 'eva-css-fluid' with (...)`.
  See https://eva-css.xyz/framework/doc.html
```

### 1.4 Préparer la suppression v3.0

Ouvrir une issue de tracking "v3.0 — Remove JSON workflow".

À retirer en v3.0.0 :
- Commandes CLI : `init`, `setup`, `validate`, `generate`.
- Loader `eva.config.cjs` côté package (`src/config-loader.cjs`, `src/cli-commands.cjs`).
- `scripts/build-with-config.cjs` (et entrées `build`, `build:min`, `build:purge` du `package.json`).
- `eva.config.template.js` du champ `files`.
- Toute la doc JSON dans le README.

Ce qui reste en v3.0 :
- `@use 'eva-css-fluid' with (...)` (workflow unique).
- Variables SCSS : `$sizes`, `$font-sizes`, `$build-class`, `$px-rem-suffix`, `$name-by-size`, `$custom-class`.
- Système de thèmes via classes CSS (`.theme-NAME`).
- Scripts `build:sass`, `build:sass:min`, `watch`, `dev`.

### 1.5 Versions

- **v2.x** (prochaine release) : warning + entrée CHANGELOG `Deprecated`.
- **v3.0.0** : suppression effective + section migration dans le CHANGELOG.

---

## 2. `eva-css-for-tailwind` — nouveau package (bridge yCode)

> Spec complète : `EVA-YCODE-SPEC.md` (la spec parle de `@eva-css/ycode` mais on garde le nom déjà en place dans `package.json` : `eva-css-for-tailwind`). Folder : `packages/eva-ycode/`. Bin : `eva-css-for-tailwind`.

Ce package est totalement indépendant du workflow SCSS. Il génère un fichier `bridge.css` qui override les classes Tailwind arbitraires (`text-[32px]`, `p-[24px]`, …) avec des `clamp()` fluides, à partir des tokens Figma de l'utilisateur.

### 2.1 Implémentation (cf. checklist détaillée dans `EVA-YCODE-SPEC.md`)

- [ ] `src/types.ts` — `EvaYcodeConfig`, `Intensity`.
- [ ] `src/clamp.ts` — port de la math clamp depuis `_eva.scss` (4 intensités SCSS — cf. décision projet — + intensité `normal` par défaut).
- [ ] `src/generator.ts` — Section A (vars `:root`), Section B (overrides TW arbitraires), Section C (sélecteurs `[data-eva]` par intensité).
- [ ] `src/index.ts` — export `generateBridge(config)`.
- [ ] `cli.ts` — `init` + `generate` (+ `--stdout`, `--sizes`, `--font-sizes`, `--intensity`).
- [ ] Build tsup (CJS + ESM + .d.ts).

### 2.2 Décisions actées (memory project_ycode_decisions)

- **4 intensités** (suffixe SCSS `--`, `-`, `_`, `__`) + intensité par défaut sans suffixe.
- Préfixe `--fs-XX` pour les variables de fonts (distinguer des spacings).
- **SCSS = source de vérité** : la math clamp TS doit reproduire exactement la sortie de `_eva.scss`.

### 2.3 Tests obligatoires avant publication

- [x] Comparaison TS vs SCSS sur 11 tailles × 4 intensités spacing (44 vars) + 8 tailles × 3 intensités font (24 vars), octet-pour-octet (`test/scss-equivalence.test.mjs`).
- [x] Couverture de toutes les propriétés du `PROPERTY_MAP` + `FONT_PROPERTY_MAP` (`test/parse-class.test.mjs`).
- [x] Mapping `rem` → px (`1rem` → 16, `3rem` → 48, etc., dans le selector le rem est conservé pour matcher la sortie TW).
- [x] `generateClassOverrides` + `generateBridge` + `generateTheme` (`test/overrides.test.mjs`).
- [ ] Préfixe `max-md:` (responsive) — **non implémenté actuellement**, à voir si yCode en a besoin pour la v1.0 ou si on diffère.

### 2.4 Publication

- [ ] Premier publish : `eva-css-for-tailwind@1.0.0`.
- [ ] README avec exemples (config Figma → `bridge.css` → intégration yCode).

---

## 3. `eva-colors` et `eva-css-purge`

Aucune action. Ces packages sont indépendants du workflow de config et restent inchangés.

---

## 4. Site `eva-css.xyz`

Déjà migré en SCSS-only (repo `nkdeus/eva`). Sert de **référence** pour la migration utilisateur du framework classique. Pas de changement requis ici, sauf à terme une page dédiée au bridge yCode quand `eva-css-for-tailwind` est publié.

---

## Vérification

### Framework classique (`eva-css-fluid`)
- [x] `npx eva-css init` affiche le warning de dépréciation.
- [x] `npx eva-css setup` idem.
- [x] `npx eva-css validate` idem.
- [x] `npx eva-css generate` idem.
- [x] README du package montre le warning et le chemin de migration en tête.
- [x] CHANGELOG mentionne la dépréciation (`packages/eva-css/CHANGELOG.md` créé).
- [x] Opt-out via `EVA_CSS_NO_DEPRECATION_WARNING=1` (utile pour CI / sortie machine).
- [ ] Issue v3.0 ouverte sur GitHub avec checklist de suppression (à faire manuellement).
- [ ] Bump version 2.0.9 + publish (à déclencher quand tu veux release).

### Module yCode (`eva-css-for-tailwind`)
- [x] `generateBridge()` exporté en CJS, ESM, avec types.
- [x] Tests clamp accuracy passent (TS = SCSS exact, 16 tests dans `packages/eva-ycode/test/`).
- [x] CLI `init` + `generate` fonctionnels (`packages/eva-ycode/src/cli.ts`).
- [ ] Publié sur npm en `1.0.0` (à déclencher quand prêt).
