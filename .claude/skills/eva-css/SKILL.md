---
name: eva-css
description: Reference for EVA CSS framework usage - fluid responsive CSS variables system. Use when writing CSS/HTML with EVA, or when the user asks about EVA CSS sizing, spacing, or font-size variables.
user-invocable: true
allowed-tools: Read, Grep, Glob
---

# EVA CSS - Guide d'utilisation des variables CSS

EVA CSS genere des variables CSS fluides basees sur `clamp()` pour un responsive automatique.
Viewport de reference : **1440px**.

---

## Sizes (spacing / layout)

Variables pour `width`, `height`, `padding`, `margin`, `gap`, `border-radius`, etc.

### Tailles disponibles (defaut)
`4, 8, 12, 16, 24, 32, 48, 64, 96, 128`

### 4 niveaux de scaling

| Variable | Suffixe | Scaling | Comportement |
|----------|---------|---------|-------------|
| `--32__` | `__` | **Maximum** | Variation extreme entre mobile et desktop. Min fixe a 0.5rem. |
| `--32_` | `_` | **Fort** | Scaling agressif, shrink important sur mobile. |
| `--32` | *(aucun)* | **Normal** | Scaling equilibre, bon defaut pour la plupart des cas. |
| `--32-` | `-` | **Minimal** | Reste stable, peu de variation entre les ecrans. |

### Formule
```
clamp(min, vw-component + rem-offset, max)
```

- `__` : min = `0.5rem` (fixe), vw = extrem (ratio 142.4)
- `_` : min = `rem-min / phi`, vw = strong (vw / 1.33)
- *(defaut)* : min = `rem-min`, vw = medium (vw / 2)
- `-` : min = `rem-min * phi`, vw = light (vw / 4)

phi (spacing) = **1.618** (golden ratio)

### Exemples concrets (generes)
```css
--32__: clamp(0.5rem, 3.16vw - 1.11rem, 2.22rem);   /* extreme */
--32_:  clamp(0.69rem, 1.67vw + 0.5rem, 2.22rem);   /* fort */
--32:   clamp(1.11rem, 1.11vw + 1rem, 2.22rem);      /* normal */
--32-:  clamp(1.8rem, 0.56vw + 1.5rem, 2.22rem);     /* minimal */
```

### Usage CSS
```css
.card {
  padding: var(--24);          /* scaling normal */
  gap: var(--16_);             /* scaling fort, shrink plus sur mobile */
  border-radius: var(--8-);   /* scaling minimal, reste stable */
  width: var(--128__);         /* scaling extreme, tres petit sur mobile */
}
```

---

## Font-sizes

Prefixe `--fs-`. Variables pour `font-size`.

### Tailles disponibles (defaut)
`12, 14, 16, 18, 20, 24, 32, 48`

### 3 niveaux de scaling (pas de `-`)

| Variable | Suffixe | Scaling | Comportement |
|----------|---------|---------|-------------|
| `--fs-16__` | `__` | **Fort** | Reduit plus sur mobile, scaling agressif. |
| `--fs-16_` | `_` | **Normal** | Scaling equilibre pour la typographie. |
| `--fs-16` | *(aucun)* | **Minimal** | Tres stable, peu de variation. Bon defaut pour le texte courant. |

### Differences avec les sizes
- **3 variantes** seulement (`__`, `_`, defaut) — pas de `-`
- **phi = 1.3** (plus conservateur que 1.618)
- **min de base = 0.6rem** (plus haut que 0.5rem pour les sizes)
- Le defaut (`""`) utilise `vw-light` → la typo bouge moins par defaut
- Pas de mode `vw-extrem` — le `__` des fonts utilise `vw-strong`

### Exemples concrets (generes)
```css
--fs-16__: clamp(0.43rem, 0.83vw + 0.25rem, 1.11rem);  /* fort */
--fs-16_:  clamp(0.56rem, 0.56vw + 0.5rem, 1.11rem);   /* normal */
--fs-16:   clamp(0.73rem, 0.28vw + 0.75rem, 1.11rem);   /* minimal */
```

### Usage CSS
```css
h1 { font-size: var(--fs-48__); }  /* titre hero, scaling fort */
h2 { font-size: var(--fs-32_); }   /* titre section, scaling normal */
p  { font-size: var(--fs-16); }    /* texte courant, tres stable */
small { font-size: var(--fs-12); } /* petit texte, stable */
```

---

## Variables de debug (dev only)

En mode dev (`$px-rem-suffix: true`), des variables statiques sont ajoutees :

```css
--32-px: 32px;     /* valeur pixel brute */
--32-rem: 2rem;    /* valeur rem brute */
--fs-16-px: 16px;
--fs-16-rem: 1rem;
```

Utile pour le debug et le serveur MCP Figma. Ne pas utiliser en production.

---

## Resume rapide

| Besoin | Variable recommandee |
|--------|---------------------|
| Spacing standard | `var(--24)` |
| Spacing qui shrink fort sur mobile | `var(--24_)` ou `var(--24__)` |
| Spacing quasi fixe | `var(--24-)` |
| Texte courant | `var(--fs-16)` |
| Titre responsive | `var(--fs-32_)` ou `var(--fs-32__)` |
| Petit texte stable | `var(--fs-12)` |

### Regle generale
Plus de `_` = plus de scaling responsive. Le `-` verrouille la taille.
Les font-sizes sont volontairement plus contraintes pour preserver la lisibilite.
