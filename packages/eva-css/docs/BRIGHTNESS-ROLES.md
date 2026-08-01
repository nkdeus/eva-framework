# Crans de luminosité par rôle & proportionnels

> Résumé de l'update pour le site / la doc d'`eva-css-fluid`.
> Statut : **livré**, rétrocompatible. Version : **2.3.0** (non publiée).

## En une phrase

Les quatre crans de luminosité (`-d`, `-b`, `-d_`, `-b_`) cessent d'être **un
réglage global partagé par les cinq bases** et **un décalage absolu qui sature en
butée**. Chaque base peut désormais régler chaque cran indépendamment, et chaque
cran peut viser une **part de la marge restante** plutôt qu'un nombre de points
fixe — les deux en pur CSS, à l'exécution, **sans changer une seule valeur
calculée par défaut**.

## Le problème

### 1. Un seul jeu d'offsets pour cinq bases

```css
--darker: -5%;  --brighter: 10%;
--darker_: -15%; --brighter_: 30%;
```

Ces quatre valeurs pilotaient les 20 variantes (`--brand-d`, `--dark-b_`, …). Or
un neutre veut des pas de 2 à 7 points pour rester lisible à côté de son encre,
un accent veut 10 à 30 points pour marquer un `:hover`. Régler pour l'un cassait
l'autre.

### 2. La saturation en butée

La lightness OKLCH est écrêtée à `0%–100%`. Avec `--light-lightness: 96.4%` :

| Variante | Calcul | Rendu |
|---|---|---|
| `--light-b` | `96.4% + 10%` = 106.4% | écrêté à **100%** |
| `--light-b_` | `96.4% + 30%` = 126.4% | écrêté à **100%** |

Deux crans, **une seule couleur**. Et ce n'est pas un cas limite : le phénomène
est systématique et symétrique. En mode sombre, ce sont `--dark-d` et `--dark-d_`
qui s'effondrent ensemble sur le blanc. Sur chaque neutre, dans chaque mode,
**2 des 4 crans étaient morts** — c'est-à-dire précisément sur les deux couleurs
les plus utilisées.

## Ce qui change

### Override par rôle

Chaque cran lit d'abord un token spécifique à sa base, et retombe sur le token
global si celui-ci n'est pas défini :

```css
/* Avant */
--dark-d: oklch(calc(var(--dark-lightness) + var(--darker)) …);

/* Après */
--dark-d: oklch(calc(var(--dark-lightness) + var(--dark-darker, var(--darker))) …);
```

```css
.current-theme {
  /* Encre neutre : pas resserrés */
  --dark-darker: -2%;
  --dark-brighter: 4%;

  /* Accent : pas larges pour les états */
  --accent-brighter_: 12%;
}
```

Seul le cran nommé bouge : ci-dessus `--dark-d` change, `--dark-b_` continue
d'utiliser `--brighter_`.

Tokens disponibles : `darker`, `brighter`, `darker_`, `brighter_`, pour chacune
des bases `brand`, `accent`, `extra`, `dark`, `light` — soit
`--<base>-<token>`.

### Crans proportionnels (opt-in)

Un cran peut prendre une **fraction de la marge restante** jusqu'à sa butée, au
lieu d'un nombre de points fixe. La formule complète devient :

```
lightness = base + offset_absolu + (butée − base) × ratio
```

Le ratio vaut `0` par défaut, ce qui annule le terme — d'où la
rétrocompatibilité. Pour passer un cran en proportionnel pur, on met sa part
absolue à `0` :

```css
.current-theme {
  --light-brighter:   0%;  --light-brighter-ratio:  .35;
  --light-brighter_:  0%;  --light-brighter_-ratio: .7;
}
```

Mesuré au navigateur, en lightness OKLCH :

| | avant | après |
|---|---|---|
| `--light-b` (mode clair) | 1.0 | **0.9766** |
| `--light-b_` (mode clair) | 1.0 | **0.9892** |
| `--dark-d` (mode sombre) | 1.0 | **0.9675** |
| `--dark-d_` (mode sombre) | 1.0 | **0.985** |

Les deux crans redeviennent distincts, restent dans le gamut, et le sont dans
les deux modes de thème.

Les deux parts se composent : un petit décalage fixe **plus** une part
proportionnelle est valide — `--dark-darker: -2%; --dark-darker-ratio: .3`.

### Butées

`--<token>-bound` est le bord vers lequel un cran pousse. **Il ne se déduit pas
du nom du token** : `--darker` vaut `-5%` en mode clair mais `+10%` en mode
sombre, parce qu'en mode sombre l'encre `dark` est claire (95%) et que `-d`
signifie « plus de contraste avec le fond », pas « plus sombre dans l'absolu ».
La butée suit donc le mode, exactement comme les offsets :

| | mode clair | mode sombre |
|---|---|---|
| `--darker-bound` | `0%` | `100%` |
| `--brighter-bound` | `100%` | `0%` |
| `--darker_-bound` | `0%` | `100%` |
| `--brighter_-bound` | `100%` | `0%` |

On n'a normalement pas à y toucher. L'override par rôle existe
(`--accent-brighter-bound`) pour viser un plafond différent sur une base.

## Rétrocompatibilité — garantie

Aucun changement de valeur calculée. Vérifié, pas supposé :

- **Diff de build** — 20 lignes changées dans `eva.css`, les 5 bases × 4 crans,
  rien d'autre.
- **Diff navigateur** — les 20 variantes comparées en `getComputedStyle` entre
  le build d'avant et celui d'après, **en mode clair et en mode sombre** :
  **0 dérive**.
- **Isolation des overrides** — `--dark-darker:-2%` ne déplace que `--dark-d` ;
  `--accent-brighter_:12%` ne déplace que `--accent-b_`. Aucune fuite sur les
  crans voisins ni sur les autres bases.

Le mécanisme repose entièrement sur le repli natif de `var()` : tant qu'un token
par rôle n'est pas défini, la chaîne retombe sur la valeur globale d'origine, et
tant qu'un ratio n'est pas défini il vaut `0`.

## Détail d'implémentation

`src/_colors.scss`. Le map `$darkbright-map` associe désormais chaque suffixe à
un **nom de token** (`"-d"` → `"darker"`) au lieu d'un `var()` déjà résolu, ce
qui permet de construire les deux chaînes de repli à l'émission :

```scss
$brightness-variations: "-d", "-b", "-d_", "-b_";
$brightness-tokens: "darker", "brighter", "darker_", "brighter_";
```

Émission, par base et par cran :

```scss
--#{$c}#{$suffix}: oklch(
  calc(
    var(--#{$c}-lightness)
    + var(--#{$c}-#{$token}, var(--#{$token}))
    + (var(--#{$c}-#{$token}-bound, var(--#{$token}-bound)) - var(--#{$c}-lightness))
      * var(--#{$c}-#{$token}-ratio, var(--#{$token}-ratio, 0))
  )
  var(--#{$c}-chroma) var(--#{$c}-hue)
);
```

Les valeurs par défaut des butées et des ratios sont déclarées dans `:root`
(pour la découvrabilité en DevTools) et les butées sont réinversées dans les deux
branches du bloc de thème sombre, à côté des inversions d'offsets existantes.

## Ce qui n'a pas changé

- **Le nommage.** `_` signifie « un cran de plus dans l'axe courant », l'axe
  étant fixé par la présence de `-d`/`-b`. `--brand__` (deuxième cran d'opacité)
  et `--brand-b_` (deuxième cran de bright) relèvent de la même grammaire
  cohérente — pas de renommage.
- **Les fondus.** `--brand_` / `__` / `___` restent inlinés au build à 65/35/15 %.
  Les sortir en custom properties reste ouvert.
- **La courbe fluide.** Aucun rapport, aucun contact.
