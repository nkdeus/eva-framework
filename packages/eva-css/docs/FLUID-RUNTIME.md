# Unité fluide commutable à l'exécution — `vw` ↔ `cqi`

> Résumé de l'update pour le site / la doc d'`eva-css-fluid`.
> Statut : **livré**, rétrocompatible. Version : **2.2.0**.

## En une phrase

Chaque token EVA suit désormais **une custom property commutable à l'exécution**
au lieu d'une unité figée au build. Une seule feuille `eva.css` supporte à la fois
le mode **viewport** (`vw`, défaut) et le mode **conteneur** (`cqi`) — on bascule
un sous-arbre à la volée, **sans rebuild ni second fichier**.

## Ce qui change concrètement

Avant, chaque token était figé en `vw` :

```css
--16: clamp(0.56rem, 0.56vw + 0.5rem, 1.11rem);
```

Maintenant, l'unité fluide passe par `var(--eva-fluid-unit)` multipliée en `calc()` :

```css
--16: clamp(0.56rem, calc(0.56 * var(--eva-fluid-unit, 1vw) + 0.5rem), 1.11rem);
```

Le coefficient (`0.56`) est exactement l'ancienne valeur `vw`. Tant que
`--eva-fluid-unit` n'est pas redéfinie, `0.56 * 1vw = 0.56vw` : **valeur calculée
identique** à avant, pour tous les consommateurs existants.

Et la propriété est **typée** (déclarée une fois), donc stockée comme `<length>`
et non re-parsée à chaque substitution :

```css
@property --eva-fluid-unit {
  syntax: "<length>";
  inherits: true;
  initial-value: 1vw;
}
```

## L'usage qu'on débloque

Le livrable plein écran reste en `vw` (rien à changer). Mais n'importe quel
sous-arbre peut suivre **sa propre largeur** au lieu de la fenêtre — exactement
ce qu'il fallait pour `lab.html`, les cards de dashboard, une section en
demi-colonne, une preview… :

```css
/* tous les tokens EVA de ce sous-arbre suivent la cellule, pas la fenêtre */
.preview-cell {
  container-type: inline-size;
  --eva-fluid-unit: 1cqi;
}
```

⚠️ **Toujours** poser `container-type: inline-size` **en même temps** que
l'override `cqi` : sans conteneur, `cqi` n'a aucune référence et retombe sur le
small-viewport.

### Utilitaires fournis (opt-in)

| Classe | Effet |
|--------|-------|
| `.eva-cqi` | `container-type: inline-size` **+** `--eva-fluid-unit: 1cqi`. À poser sur l'élément dont les tokens doivent suivre la largeur. Les deux propriétés sont indissociables, la classe garantit qu'on ne les oublie pas. |
| `.eva-root` | `container: eva-root / inline-size`. Conteneur racine pleine largeur : `cqi ≡ vw` pour le livrable, et tout conteneur imbriqué peut alors override localement. *(Caveat : `container-type` sur un élément racine interagit avec `position: sticky` / `overflow` — à poser délibérément.)* |

Mesures du PoC (taille rendue de `--fs-48`, boîtes de largeur identique) :

| Largeur boîte | `cqi` (suit la boîte) | `vw` (suit la fenêtre 1456 px) |
|---|---|---|
| 480 px | **40,1 px** | 49,3 px |
| 260 px | **38,3 px** | 49,3 px |

→ en `vw` la typo reste figée sur la fenêtre ; en `cqi` elle s'adapte au rendu réel.

## Configuration

Quatre nouvelles options, disponibles côté **SCSS** (voie recommandée) et côté
**config JSON** (voie historique, dépréciée pour v3).

| SCSS (`@use … with`) | JSON (`eva.config`) | Défaut | Rôle |
|---|---|---|---|
| `$fluid-runtime` | `fluidRuntime` | `true` | `true` → forme runtime `var(--eva-fluid-unit)`. `false` → sortie littérale historique (octets identiques, zéro coût runtime, unité figée au build). |
| `$unit-fluid` | `fluidUnit` | `1vw` | Unité fluide **et** fallback de la custom property. Mettre `1cqi` pour un build orienté conteneur. |
| `$reference-width` | `referenceWidth` | `1440` | Largeur où les tokens atteignent leur `max` (ancien `$screen` codé en dur). En `cqi`, c'est la largeur du **conteneur** au plafond. |
| `$min-font-size` | `minFontSize` | `0` | Plancher de lisibilité (a11y), en px. Floore la borne `min` des font-sizes. `0` = désactivé. |

### Voie SCSS (recommandée)

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 24, 48),
  $font-sizes: (16, 24, 48),
  // nouvelles options (toutes facultatives) :
  $unit-fluid: 1vw,         // ou 1cqi
  $reference-width: 1440,
  $fluid-runtime: true,     // false = ancienne sortie littérale
  $min-font-size: 0          // ex. 14 = plancher a11y (taille mobile)
);
```

### Voie JSON (`eva.config.js`)

```js
module.exports = {
  sizes: [4, 8, 16, 24, 48],
  fontSizes: [16, 24, 48],
  fluidUnit: '1vw',         // '1vw' (livrable) | '1cqi' (conteneur)
  referenceWidth: 1440,
  fluidRuntime: true,       // false = sortie littérale, zéro coût runtime
  minFontSize: 0            // ex. 14 = plancher a11y (taille mobile)
};
```

## Garde-fou lisibilité (a11y)

Type fluide + petit conteneur `cqi` = risque de texte sous le seuil de lisibilité.
L'option `minFontSize` (en px) **remonte la borne `min`** de chaque `clamp()` de
font-size pour qu'aucun token ne descende sous le seuil, **quelle que soit la
largeur du conteneur** (le `clamp()` plafonne par le bas à `min`).

> **Ce que `minFontSize` représente : la taille mobile.** Dans EVA, la borne `min`
> d'un `clamp()` est ce qui s'affiche **au plus petit écran**. Le plancher est donc
> la plus petite taille tolérée — pas la taille du corps desktop. Sur mobile, **13-14px**
> reste lisible ; mettre `16` y forcerait le texte à la taille desktop et **écraserait
> le rétrécissement fluide** sur petit écran. Valeur recommandée : **13-14**.

```scss
@use 'eva-css-fluid' with (
  $font-sizes: (12, 16, 24, 48),
  $min-font-size: 14        // le texte ne descend jamais sous 14px (taille mobile)
);
```

```css
/* avant : --fs-16: clamp(0.73rem,  …, 1.11rem)   (≈ 11.7px au plus petit) */
/* après : --fs-16: clamp(0.875rem, …, 1.11rem)   (jamais < 14px)          */
```

- **Exprimé en `rem`** sous le capot → le zoom et la préférence de taille
  utilisateur continuent d'agir (comme les offsets).
- **Font-sizes uniquement** : les tokens de spacing ne sont pas touchés.
- **Opt-in** : `0` (défaut) = aucun plancher, sortie inchangée.
- **Cas limite** : si le plancher dépasse le `max` naturel d'un token (ex. plancher
  14px sur un `fs-12` plafonné à ~13px), le token est épinglé au plancher partout
  (le CSS résout un `clamp()` `min > max` à la valeur `min`). C'est le comportement
  voulu : un corps sous le seuil est tiré jusqu'au seuil. Pour garder `fs-12` plus
  petit, baisser le plancher (ex. `12`) ou retirer `12` de l'échelle.

## Rétrocompatibilité — garantie

- **Mode runtime (défaut)** : `--eva-fluid-unit` non défini → fallback `1vw` →
  sortie *calculée* strictement identique à avant. Aucun changement visible pour
  les protos existants.
- **Mode littéral** (`fluidRuntime: false`) : reproduit **octet pour octet**
  l'ancienne sortie (`0.56vw + 0.5rem`), sans `@property` ni utilitaires — la
  porte de sortie « pureté runtime ».
- **Coût runtime** : négligeable. La version `vw` était déjà une expression vivante
  (re-résolue à chaque resize/zoom). `var()` n'ajoute qu'une substitution au
  *computed-value time* ; `--eva-fluid-unit` est posée une fois, jamais animée →
  pas de re-substitution par frame.

## Détail d'implémentation

Tout passe par un goulot unique dans `src/_eva.scss` :

- `getVW()` calcule toujours la longueur fluide (ex. `0.14vw`).
- une nouvelle fonction `fluidExpr($vw-val, $op, $rem-val)` assemble le terme
  central du `clamp()` : en mode runtime elle retire l'unité (`math.div($vw-val,
  $unit-fluid)` → coefficient pur) et émet le `calc(coef * var(…) ± offset)` ; en
  mode littéral elle renvoie l'expression historique.

Aucun token n'échappe à `fluidExpr` → la bascule est centralisée et peu coûteuse.

## Suite de la roadmap

> ✅ **Livré dans cet update** : **#1** (unité runtime), **#2** (largeur de référence),
> **#4** (utilitaires conteneur), **#5** (garde-fou a11y).
> Aucun ne modifie le calcul fluide d'EVA : sortie *calculée* identique par défaut,
> ou option désactivée par défaut.

Les deux points restants ont été **écartés** :

- **#3 — Plage fluide explicite (façon Utopia)** : **non retenu.** Le modèle Utopia
  (droite linéaire deux-points) remplacerait les 4 intensités d'EVA — il toucherait
  donc au calcul cœur, ce qui est exclu par principe. La courbe signature d'EVA reste
  intacte.
- **#6 — Build dual `eva.css` + `eva.cqi.css`** : **non retenu**, rendu redondant par
  l'unité runtime (#1). Une seule feuille fait déjà vw *et* cqi à l'exécution ; et une
  feuille 100% cqi se génère au build via `fluidUnit: 1cqi`. Pas besoin d'un second
  artefact.
