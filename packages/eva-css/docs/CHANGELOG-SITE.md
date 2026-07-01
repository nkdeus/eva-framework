# Nouveautés eva-css-fluid — pour le site

> Notes de version prêtes à coller dans la section « changelog / nouveautés » du site EVA.
> Format court et scannable (français). Le détail technique de la v2.2.0 vit dans
> [`FLUID-RUNTIME.md`](./FLUID-RUNTIME.md) ; le changelog dev complet dans [`../CHANGELOG.md`](../CHANGELOG.md).

---

## v2.2.0 — Unité fluide commutable + garde-fou lisibilité

**Une seule feuille `eva.css`, deux modes de fluidité.** Les tokens EVA peuvent
désormais suivre soit la **fenêtre** (`vw`, par défaut), soit **n'importe quel
conteneur** (`cqi`) — on bascule un sous-arbre à la volée, **sans rebuild ni second
fichier**. La courbe fluide d'EVA est **inchangée** : par défaut, rendu strictement
identique aux versions précédentes.

### ✨ Nouveautés

- **Unité fluide runtime (`--eva-fluid-unit`).** Chaque token passe par une custom
  property commutable au lieu d'une unité figée au build.
  ```css
  .card { container-type: inline-size; --eva-fluid-unit: 1cqi; }
  /* → les tokens EVA de .card suivent la largeur de la card, pas la fenêtre */
  ```
- **Utilitaires conteneur (opt-in) : `.eva-cqi` et `.eva-root`.** Posent
  `container-type` + l'override `cqi` d'un coup, sans risque de les oublier.
- **Largeur de référence configurable (`referenceWidth`, défaut `1440`).** La largeur
  où les tokens atteignent leur `max` n'est plus codée en dur.
- **Garde-fou lisibilité a11y (`minFontSize`, défaut `0` = off).** Empêche le texte
  fluide de descendre sous un seuil lisible dans un petit conteneur / sur mobile.
  ⚠️ Ce plancher est la **taille mobile**, pas la taille desktop → recommandé **13-14px**.

### 🔧 Config (2 voies)

| SCSS (`@use … with`) | JSON (`eva.config`) | Rôle |
|---|---|---|
| `$unit-fluid` | `fluidUnit` | Unité fluide + fallback (`1vw` \| `1cqi`) |
| `$reference-width` | `referenceWidth` | Largeur au plafond (défaut `1440`) |
| `$fluid-runtime` | `fluidRuntime` | `false` = ancienne sortie littérale |
| `$min-font-size` | `minFontSize` | Plancher a11y en px (défaut `0`) |

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 24, 48),
  $font-sizes: (16, 24, 48),
  $unit-fluid: 1vw,        // ou 1cqi
  $min-font-size: 14        // plancher a11y (taille mobile), 0 = off
);
```

### 🔒 Rétrocompatibilité

100 % rétrocompatible. `--eva-fluid-unit` non défini → fallback `1vw` → **valeur
calculée identique** à avant. `fluidRuntime: false` reproduit l'ancienne sortie
**octet pour octet**.

→ **En savoir plus :** [Unité fluide commutable `vw` ↔ `cqi`](./FLUID-RUNTIME.md)
