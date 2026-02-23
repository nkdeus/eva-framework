# TODO: Simplifier la config dark/light dans EVA CSS

## Problème actuel

Dans `node_modules/eva-css-fluid/src/_colors.scss`, les valeurs de lightness/darkness sont **hardcodées** et écrasent les variables passées via `@forward`:

```scss
// Ligne ~226 - Ces valeurs IGNORENT $dark-mode-lightness et $dark-mode-darkness
.current-theme.toggle-theme {
  --current-lightness: 5%;    // ← Hardcodé!
  --current-darkness: 95%;    // ← Hardcodé!
}
```

Résultat: les variables `$light-mode-lightness`, `$dark-mode-lightness`, etc. passées dans le `@forward` sont inutiles.

## Solution temporaire (actuelle)

Override manuel à la fin de `main.scss`:

```scss
.current-theme {
  --current-lightness: 90%;
  --current-darkness: 30%;
}

.current-theme.toggle-theme {
  --current-lightness: 20%;
  --current-darkness: 80%;
}
```

## Fix dans EVA CSS

### Fichier: `src/_colors.scss`

#### 1. Remplacer les valeurs hardcodées par les variables

**Avant** (~ligne 219-230):
```scss
.current-theme.toggle-theme {
  --darker: 10%;
  --brighter: -5%;
  --darker_: 30%;
  --brighter_: -15%;

  --current-lightness: 5%;      // ← Hardcodé
  --current-darkness: 95%;      // ← Hardcodé

  --dark-lightness: var(--current-darkness) !important;
  --light-lightness: var(--current-lightness) !important;
}
```

**Après**:
```scss
.current-theme.toggle-theme {
  --darker: 10%;
  --brighter: -5%;
  --darker_: 30%;
  --brighter_: -15%;

  --current-lightness: #{$dark-mode-lightness};   // ← Variable
  --current-darkness: #{$dark-mode-darkness};     // ← Variable

  --dark-lightness: var(--current-darkness) !important;
  --light-lightness: var(--current-lightness) !important;
}
```

#### 2. Même fix pour le mode auto (media query)

**Avant** (~ligne 200-215):
```scss
@media (prefers-color-scheme: dark) {
  .current-theme {
    --current-lightness: 5%;
    --current-darkness: 95%;
    // ...
  }
}
```

**Après**:
```scss
@media (prefers-color-scheme: dark) {
  .current-theme {
    --current-lightness: #{$dark-mode-lightness};
    --current-darkness: #{$dark-mode-darkness};
    // ...
  }
}
```

#### 3. Ajouter aussi le light mode pour `.current-theme`

Actuellement le light mode n'est pas explicitement défini pour `.current-theme`. Ajouter:

```scss
.current-theme {
  --current-lightness: #{$light-mode-lightness};
  --current-darkness: #{$light-mode-darkness};
}
```

## Résultat attendu

Après ce fix, la config dans `main.scss` devient simple:

```scss
@forward 'eva-css-fluid/src/colors' with (
  $theme-name: 'hummmmm',
  $auto-theme-switch: false,
  $theme-colors: $hummmmm-theme-colors,
  $light-mode-lightness: 90%,
  $light-mode-darkness: 30%,
  $dark-mode-lightness: 20%,
  $dark-mode-darkness: 80%
);
```

Et on peut supprimer les overrides manuels à la fin du fichier.

## Fix Sass `if()` deprecation warning

### Problème

Sass déprécie la syntaxe `if()` en faveur de la syntaxe CSS moderne :

```
Deprecation Warning [if-function]: The Sass if() syntax is deprecated in favor of the modern CSS syntax.
Suggestion: if(sass($variation == ""): $color; else: "#{$color}#{$variation}")

   ╷
55 │     $color-name: if($variation == "", $color, "#{$color}#{$variation}");
   │                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   ╵
    node_modules/eva-css-fluid/src/_gradients.scss 55:18
```

### Fichier: `src/_gradients.scss`

**Avant** (ligne 55):
```scss
$color-name: if($variation == "", $color, "#{$color}#{$variation}");
```

**Après** — utiliser un `@if`/`@else` à la place :
```scss
$color-name: "";
@if $variation == "" {
  $color-name: $color;
} @else {
  $color-name: "#{$color}#{$variation}";
}
```

### Note

Chercher toutes les occurrences de `if(` dans les sources EVA CSS — il peut y en avoir d'autres dans `_colors.scss`, `_utilities.scss`, etc.
