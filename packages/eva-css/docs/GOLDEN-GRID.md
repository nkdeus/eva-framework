# golden-grid

> Une grille de page en sections dorées : quatre pistes de largeurs inégales,
> issues de la subdivision récursive du nombre d'or, dont la somme fait
> exactement 1. Aucun centrage, trois bords gauches selon le rôle.
>
> Composant **opt-in** d'`eva-css-fluid`. Source : `src/golden-grid.scss`.

---

## 1. Ce que c'est

```
├──── marge ────┼── rail ──┼─ épaule ─┼───── texte ─────┼─── débord ───┼──── marge ────┤
      φ⁻⁶           φ⁻³        φ⁻⁴           φ⁻²              φ⁻³            φ⁻⁶
     0,056         0,236      0,146         0,382            0,236          0,056
   de la page    └───────────── de la composition ──────────────────┘    de la page

edge-start    rail-start  rail-end     shoulder-end     main-end      spill-end   edge-end
                          shoulder-    main-start       spill-start
                          start
```

Six pistes déclarées, quatre qui portent du contenu. Les deux marges valent
φ⁻⁶ de la page et sont auto-centrantes ; les quatre pistes centrales sont en
`fr` et divisent ce qui reste.

Deux unités, donc, et c'est la clé du système : **la marge est une part de la
page, les pistes sont des parts de la composition.** Le « 1 » du nombre d'or
n'est pas la fenêtre — c'est ce que les marges et les gaps laissent.

Un élément ne déclare **jamais** une largeur. Il déclare le rôle qu'il joue
dans la page, et la piste correspondante lui donne sa mesure.

```html
<article class="golden-grid">
  <p class="rail">Derniers projets</p>
  <h1 class="wide">Titre</h1>
  <div class="main">Chapô</div>
</article>
```

---

## 2. Activation

Le composant n'est chargé ni par `core.scss` ni par `variables.scss`, et
`index.scss` n'émet **aucune règle** tant qu'il n'est pas activé : la grille
dorée est un parti pris de mise en page, pas un défaut raisonnable.

### Depuis le framework complet

```scss
@use 'eva-css-fluid' with (
  $golden-grid: true,
  $golden-grid-prefix: 'gg-',        // recommandé, voir § 8
  $golden-grid-breakpoint: 48rem
);
```

`$golden-grid-max` vaut `null` par défaut, ce qui fait suivre `$reference-width`
(1440) : la grille atteint sa largeur maximale exactement là où les tokens
fluides EVA atteignent la leur.

> **`index.scss` charge le module**, donc toute la configuration du composant
> passe par les variables `$golden-grid-*` de l'entrée principale (§ 5.3). Un
> `@use 'eva-css-fluid/golden-grid' with (…)` posé en plus d'un
> `@use 'eva-css-fluid'` échouerait — Sass refuse de configurer un module déjà
> chargé.

### En composant isolé

C'est le mode le plus léger : le composant n'a besoin ni du reset EVA, ni
des utilitaires, ni du système de gradients. `variables.scss` ne charge pas le
module, la configuration directe est donc disponible.

```scss
@use 'eva-css-fluid/variables';
@use 'eva-css-fluid/golden-grid' with (
  $max: 1280px,
  $breakpoint: 48rem,
  $prefix: 'gg-',
  $rules: true
);
```

### Depuis eva.config.cjs

```javascript
module.exports = {
  goldenGrid: true,
  goldenGridPrefix: 'gg-',
  goldenGridGutterPhi: 6   // marge = φ⁻⁶ de la page; false = échelle EVA
};
```

Ces trois clés sont les seules exposées côté JSON ; le reste de la
configuration passe par les variables SCSS (§ 5.3), et les gaps se retunent
même sans recompiler (§ 5.3, tokens d'exécution).

---

## 3. Rôle : pourquoi pas douze colonnes

Une grille à 12 colonnes égales est un système de **découpage**. On y prend 4,
6 ou 8 colonnes selon ce qu'on veut faire tenir. Les proportions sont un
résultat, jamais une décision, et comme toutes les colonnes se valent, la seule
manière de créer une hiérarchie est de centrer ou de compter.

`golden-grid` est un système de **proportion**. Les quatre pistes ont des
largeurs différentes et non interchangeables ; chacune a une fonction :

| Piste | Fraction | Rôle |
| --- | --- | --- |
| **rail** | φ⁻³ = 0,236 | Métadonnées, dates, numéros, titres de section. Aligné à droite. Premier bord gauche. |
| **épaule** | φ⁻⁴ = 0,146 | Vide, presque toujours. C'est elle qui désaxe la page. |
| **texte** | φ⁻² = 0,382 | La mesure de lecture (≈ 53 signes). Deuxième bord gauche. |
| **débord** | φ⁻³ = 0,236 | Là où les images et les grands titres partent vers la droite. Troisième bord gauche pour ce qui commence ici. |

Quatre conséquences directes, qui sont le vrai intérêt du composant :

1. **La page n'a pas d'axe, elle a une progression.** Rien n'est centré nulle
   part. L'œil descend en suivant des bords, pas un milieu.
2. **Le vide est une valeur, pas un reste.** L'épaule est une piste déclarée,
   dessinée, mesurable. Elle ne peut pas être « récupérée » par un contenu qui
   déborde, parce qu'aucune classe ne la vise seule.
3. **La mesure de lecture n'est pas réglée, elle est déduite.** Aucun
   `max-width: 65ch` : 0,382 de la composition donne ≈ 442 px à 1440, soit
   ≈ 53 signes en corps 17. Si la page grandit, la mesure grandit dans le même
   rapport que tout le reste.
4. **La marge aussi est une part.** Elle vaut φ⁻⁶ de la page, pas un cran
   d'échelle : elle reste dorée à toutes les largeurs, et rien dans la page
   n'est plus une valeur posée à la main.

À quoi ce composant ne sert pas : les grilles de composants internes (cartes,
tableaux, formulaires). Celles-là restent du ressort de `auto-fit-*` ou de
`flex-grid` (`src/_grid.scss`). `golden-grid` est une grille **de page**.

---

## 4. La géométrie

### 4.1 Dérivation

La page entière vaut 1. On lui applique la coupure dorée, puis on recoupe
chacune des deux parties par la même coupure :

```
1
├──── φ⁻² = 0,382 ────────┬──────── φ⁻¹ = 0,618 ────────────────┤   coupure 1
│                         │
├─ φ⁻³ ──┬─ φ⁻⁴ ┤         ├─ φ⁻² ──────────┬─ φ⁻³ ──┤              coupures 2 et 2'
  0,236   0,146             0,382            0,236
  rail    épaule            texte            débord
```

C'est la seule construction du composant. Les quatre pistes ne sont pas quatre
nombres choisis : ce sont les quatre feuilles d'un arbre à deux niveaux.

### 4.2 Vérification

L'identité qui fait tomber la somme sur 1 est la relation de récurrence du
nombre d'or, `φⁿ = φⁿ⁺¹ + φⁿ⁺²` :

```
φ⁻³ + φ⁻⁴ = φ⁻²          (0,236068 + 0,145898 = 0,381966)
φ⁻² + φ⁻³ = φ⁻¹          (0,381966 + 0,236068 = 0,618034)
φ⁻² + φ⁻¹ = 1            (0,381966 + 0,618034 = 1)

donc   φ⁻³ + φ⁻⁴ + φ⁻² + φ⁻³ = 1
```

Arrondi à trois décimales, la somme reste exactement 1 :
`0,236 + 0,146 + 0,382 + 0,236 = 1,000`. C'est ce qui autorise à écrire les
valeurs telles quelles dans la feuille sans rien perdre en lisibilité.

> **Note.** CSS ne demande pas que les `fr` fassent 1 : `fr` normalise.
> `2fr 1fr` et `0.667fr 0.333fr` donnent le même rendu. Écrire des fractions
> qui somment à 1 est une discipline de **lecture** — chaque nombre est
> directement la part de page occupée, et une erreur se voit à l'addition.

### 4.3 Valeurs concrètes à 1440 px

Marge φ⁻⁶ × 2 = 161,3. Gap `--24` × 5 ≈ 120,5 (à la largeur de référence,
`--24` vaut sa valeur nominale). Composition : 1440 − 161,3 − 120,5 = **1158,2**.

| Piste | Fraction | Largeur | Contenu type |
| --- | --- | --- | --- |
| marge | 0,056 *de la page* | 81 px | — |
| rail | 0,236 | 273 px | « 12 projets », « 2024 », « Direction artistique » |
| épaule | 0,146 | 169 px | — |
| texte | 0,382 | 442 px | ≈ 53 signes en corps 17 |
| débord | 0,236 | 273 px | prolonge une image, un titre |

La marge vaut 0,47 de l'épaule : assez large pour se lire comme une marge
dessinée, assez étroite pour que l'épaule reste le vide dominant de la page.
C'est le critère qui fixe l'exposant par défaut — à φ⁻⁵ le rapport monte à 0,82
et les deux vides se concurrencent.

Le prix : la mesure de lecture passe de ≈ 60 à ≈ 53 signes. Elle reste dans la
plage confortable (45–75) ; `$gutter-phi: 7` la ramène à ≈ 56 avec une marge de
49 px, et `false` rend les 60 signes en repassant la marge sur l'échelle EVA.

---

## 5. API

### 5.1 Lignes nommées

Ce sont elles le contrat public. Toute règle de placement écrite dans un projet
doit s'exprimer avec ces noms, jamais avec des numéros de colonne. Elles ne
sont **jamais préfixées** : leur portée est celle de la grille, aucune
collision n'est possible.

```
edge-start · rail-start · rail-end/shoulder-start · shoulder-end/main-start
           · main-end/spill-start · spill-end · edge-end
```

Les zones nommées `rail`, `main`, `spill`, `edge` s'utilisent aussi en
raccourci : `grid-column: rail` ≡ `grid-column: rail-start / rail-end`.

### 5.2 Classes de placement

Toutes les classes ci-dessous prennent `$prefix` (`''` par défaut).

| Classe | Portée | Usage |
| --- | --- | --- |
| `.golden-grid` | — | Le conteneur. Porte les six pistes et la marge dorée auto-centrante. |
| `.grid-page` | — | À poser sur l'ancêtre du tracé : `position: relative` + `isolation: isolate`. |
| `.rail` | `rail` | Métadonnées. Ajoute `text-align: right` : les mots butent contre le vide de l'épaule, ce qui donne le second bord fort, à l'intérieur de la page. |
| `.main` | `main` | Texte courant. Rien d'autre ne vit ici. |
| `.wide` | `shoulder-start / spill-end` | Titres, citations, images larges. Part de l'épaule, donc casse l'alignement à gauche volontairement. |
| `.spill` | `main-start / edge-end` | Débord asymétrique : bord gauche sur la colonne de texte, bord droit sur le bord de page. |
| `.bleed` | `edge` | Pleine largeur, marges comprises. |
| `.rail--sticky` | — | Le rail suit la lecture (`position: sticky`). Neutralisé en mono-colonne. |
| `.blocks` | `edge` + `subgrid` | Conteneur de flux qui rend les pistes à ses enfants. |
| `.grid-rules` | — | Le tracé de fond. Voir § 6.7. |
| `.grid-debug` | — | Sur `<body>` : cerne chaque élément placé. Voir § 6.9. |

### 5.3 Options

Chaque option existe sous deux noms : celui du composant (en isolé) et son
équivalent `$golden-grid-*` sur l'entrée principale.

| Composant | Entrée principale | Défaut | Description |
| --- | --- | --- | --- |
| `$enabled` | `$golden-grid` | `true` / `false` | `false` n'émet aucune règle. |
| `$max` | `$golden-grid-max` | `1440px` / `null` | Largeur maximale. `null` suit `$reference-width`. |
| `$gutter-phi` | `$golden-grid-gutter-phi` | `6` | Marge = φ⁻ⁿ de la page. `false` la repasse sur `$gutter-min`. |
| `$breakpoint` | `$golden-grid-breakpoint` | `54rem` | Unique point de repli (4 pistes → 1). |
| `$gutter-min` | `$golden-grid-gutter-min` | `var(--24, 1.5rem)` | Marge quand `$gutter-phi` vaut `false`. |
| `$column-gap` | `$golden-grid-column-gap` | `var(--24, 1.5rem)` | Gap entre pistes. |
| `$row-gap` | `$golden-grid-row-gap` | `var(--32, 2rem)` | Rythme vertical du conteneur. |
| `$blocks-row-gap` | `$golden-grid-blocks-row-gap` | `var(--48, 3rem)` | Rythme vertical du flux éditorial. |
| `$prefix` | `$golden-grid-prefix` | `''` | Préfixe des classes. `'gg-'` recommandé en framework complet. |
| `$rules` | `$golden-grid-rules` | `true` | Émettre le tracé de fond. |
| `$rail-align-mobile` | `$golden-grid-rail-align-mobile` | `right` | `right` ou `left` sous le point de bascule. |
| `$auto-theme-switch` | `$golden-grid-auto-theme-switch` | `false` | Intensité du tracé en mode sombre : `prefers-color-scheme` (`true`) ou `.toggle-theme` (`false`). Repris de `theme.autoSwitch` par le build JSON. |
| `$phi` | — | `1.618034` | Le nombre d'or. Les quatre pistes en découlent. |

#### Tokens d'exécution

Trois propriétés personnalisées retunent la grille **sans recompiler**. Le repli
`var()` rend la valeur compilée, donc rien ne change tant que rien n'est posé —
et comme les propriétés personnalisées héritent, les poser sur un ancêtre suffit.

| Token | Repli | Effet |
| --- | --- | --- |
| `--gg-column-gap` | `$column-gap` | L'air entre les pistes. Ne touche pas aux proportions (§ 6.4). |
| `--gg-row-gap` | `$row-gap` | Rythme vertical du conteneur. |
| `--gg-blocks-row-gap` | `$blocks-row-gap` | Rythme vertical du flux éditorial. |

```css
/* Une section plus serrée, sans média query ni recompilation */
.section--dense { --gg-column-gap: var(--12); --gg-row-gap: var(--16); }
```

`--gg-gutter`, elle, n'est pas un token d'entrée : le composant la **calcule**
sur `.golden-grid`. Pour la forcer, il faut viser cet élément
(`.golden-grid { --gg-gutter: 40px }`) — sinon passer par `$gutter-phi` ou
`$gutter-min` à la compilation.

### 5.4 La règle d'usage, unique

> **Tout conteneur commence et finit sur une ligne de la grille.**
> Aucune largeur en `ch`, aucune largeur en pixels, aucun `margin: auto`.
> La piste *est* la mesure ; le contenu en ligne coule à l'intérieur.

Cette règle n'a de valeur que parce qu'elle est vérifiable — § 6.9.

---

## 6. Technique

### 6.1 Le squelette

```scss
.golden-grid {
  --gg-gutter: max(5.6%, calc((100% - 1440px) / 2));   /* 5,6% = φ⁻⁶ */

  display: grid;
  grid-template-columns:
    [edge-start]              var(--gg-gutter)
    [rail-start]              minmax(0, 0.236fr)
    [rail-end shoulder-start] minmax(0, 0.146fr)
    [shoulder-end main-start] minmax(0, 0.382fr)
    [main-end spill-start]    minmax(0, 0.236fr)
    [spill-end]               var(--gg-gutter) [edge-end];
  column-gap: var(--gg-column-gap, var(--24, 1.5rem));
  row-gap: var(--gg-row-gap, var(--32, 2rem));
  align-items: start;
}
```

### 6.2 La marge dorée, auto-centrante, sans wrapper

```css
--gg-gutter: max(5.6%, calc((100% - 1440px) / 2));
```

Une seule déclaration, deux régimes, et le `max()` choisit :

- **sous `$max`**, le terme en pourcentage gagne : la marge vaut φ⁻⁶ de la
  page. Elle est donc dorée à toutes les largeurs et grandit avec la fenêtre,
  au lieu d'être un cran d'échelle posé à la main ;
- **au-dessus**, le terme de centrage gagne : la marge absorbe la moitié du
  surplus et la composition se cale sur `$max`.

Le basculement se fait quand `φ⁻ⁿ × W = (W − $max) / 2`, soit à
**W ≈ 1622 px** pour les valeurs par défaut. Entre 1440 et 1622, la marge
continue de croître et la composition finit d'atteindre 1440 ; au-delà, tout
est figé et la page se centre.

La grille est donc contrainte **et** centrée sans conteneur intermédiaire : un
seul élément porte à la fois la largeur maximale, les marges et les pistes.
Conséquence pratique : `.bleed` atteint le bord de l'écran sans le
`margin-inline: calc(50% - 50vw)` habituel, donc sans risque de barre de
défilement horizontale.

Un pourcentage n'a de sens que sur un axe horizontal : c'est pourquoi l'offset
de `.rail--sticky` prend `$row-gap` et non la marge — sur `top`, un pourcentage
se résoudrait contre la **hauteur** du bloc conteneur.

> **Repasser sur l'échelle.** `$gutter-phi: false` rend la marge à
> `$gutter-min` (`var(--24, 1.5rem)`), dont le fallback CSS garde le composant
> utilisable sur une échelle `$sizes` qui n'aurait pas 24. Sur une échelle de
> Fibonacci, on repasse les variables de rythme : `$gutter-min: var(--21)`, etc.
>
> `false` et non `null` : Sass réapplique le `!default` sur une valeur nulle,
> donc une configuration à `null` retomberait silencieusement sur la valeur par
> défaut, sans erreur.

### 6.3 `minmax(0, …)` : la proportion ne doit pas céder

Une piste `0.236fr` s'écrit en réalité `minmax(auto, 0.236fr)`. Le minimum
automatique est la contribution min-content du contenu : une URL non sécable ou
un mot long dans le rail élargit la piste et **casse la proportion dorée** —
sans erreur, sans avertissement.

Le composant écrit donc `minmax(0, …)` sur chaque piste, ce qui ne dépend
d'aucun reset — le reset EVA (`src/_reset.scss`) ne pose pas `min-width: 0`.

### 6.4 Gaps et `fr`

`column-gap` est prélevé **avant** la distribution des `fr`. Les quatre pistes
se partagent donc `largeur − 2 × gouttière − 5 × gap`. Les rapports entre
pistes restent exacts, puisqu'elles sont toutes en `fr` ; seule la surface
totale diminue.

Corollaire : agrandir le gap n'altère pas la géométrie, il la resserre. C'est
un réglage sûr — contrairement à un `padding` posé sur un élément placé, qui
décale un bord et fait échouer le contrôle d'alignement.

C'est justement parce que ce réglage est sûr qu'il est exposé à l'exécution :
`--gg-column-gap` se pose sur n'importe quel ancêtre, et les quatre fractions
restent `0,236 / 0,146 / 0,382 / 0,236` quelle qu'en soit la valeur. Seule la
surface de composition diminue.

**Pourquoi les gaps ne sont pas dorés, eux.** La tentation est de prolonger la
série : marge en φ⁻⁵, gap en φ⁻⁶. Mais il n'y a que deux marges et **cinq**
gaps. Au terme suivant, les gaps prendraient 5 × 80,6 = 403 px sur 1440 et
videraient la composition, qui tomberait à 778 px — les quatre pistes n'auraient
plus de quoi exister. Le gap n'est pas une division de la page, c'est l'air
entre les pistes : il relève de l'échelle, pas de la série.

### 6.5 `subgrid` : l'héritage des lignes nommées

C'est la pièce qui rend le système utilisable sur du contenu éditorial.

```scss
.blocks {
  grid-column: edge;                    // occupe les six pistes
  display: grid;
  grid-template-columns: subgrid;       // et les rend à ses enfants
  row-gap: var(--gg-blocks-row-gap, var(--48, 3rem));
  grid-auto-flow: row dense;
}

.blocks > * { grid-column: main; }      // défaut : la mesure de lecture
```

`subgrid` hérite des pistes **et de leurs noms** sur l'intervalle couvert. Un
bloc enfant peut donc écrire `grid-column: rail` ou
`grid-column: main-start / edge-end` sans rien savoir de la page qui le
contient. Un bloc pleine largeur et un paragraphe restent alignés sur les mêmes
pistes, alors qu'aucun des deux ne connaît la largeur de l'autre.

Sans subgrid, il faudrait recalculer les pistes dans chaque conteneur, en
pourcentages — c'est-à-dire réintroduire exactement la dérive qu'on cherche à
éliminer.

Le gap horizontal est hérité du parent ; seul `row-gap` est redéclaré.

**Ordre source.** `.blocks > *` et `.rail` ont la même spécificité (0,1,0) : le
défaut du flux est donc émis **avant** les classes de placement, sinon il les
écrase toutes et chaque enfant de `.blocks` retombe dans `main` — sans erreur,
comme la proportion qui cède au § 6.3. Toute règle projet qui ajoute un défaut
`.blocks > *` doit respecter la même contrainte, ou monter d'un cran en
spécificité.

### 6.6 `grid-auto-flow: row dense`

Un titre de section placé sur le rail laisse la piste `texte` libre sur sa
rangée. Le placement dense y installe le bloc suivant au lieu d'ouvrir une
rangée neuve : le titre et son texte se retrouvent côte à côte, et le tiers
gauche de la page cesse d'être vide sur des écrans entiers.

`dense` peut réordonner visuellement le contenu, ce qui est un risque
d'accessibilité. Ici il ne peut pas : les seuls blocs à quitter la piste
`texte` sont les titres, et un titre précède toujours ce qu'il annonce.
**Toute nouvelle règle qui déplace un bloc hors de `main` doit être vérifiée
contre cette contrainte.**

### 6.7 Le tracé de fond

```html
<div class="grid-page">
  <div class="golden-grid grid-rules" aria-hidden="true">
    <span class="rules-rail"></span>
    <span class="rules-shoulder"></span>
    <span class="rules-main"></span>
    <span class="rules-spill"></span>
  </div>
  <!-- les grilles de contenu, frères du tracé -->
</div>
```

L'élément porte **la même classe** que le contenu : ses bandes *sont* les
pistes. Aucune approximation en pourcentages, aucun décalage possible quand la
grille évolue.

Ce n'est pas un repère de développement, c'est une pièce du dessin : sans lui,
une piste inoccupée ressemble à un oubli ; avec lui, elle se lit comme une
proportion tenue. L'épaule est marquée un cran plus fort (`--rule-void` contre
`--rule`) parce que c'est elle qui désaxe la page.

Trois contraintes d'implémentation, dont la première est fournie par le
composant :

- `.grid-page` sur l'ancêtre : `position: relative` **et**
  `isolation: isolate`. Sans contexte d'empilement, `z-index: -1` fait passer
  le tracé derrière le fond du `body` et il disparaît.
- Le tracé doit être **frère** des grilles de contenu et de même largeur. Une
  grille imbriquée dans un conteneur plus étroit ne serait plus alignée sur
  lui.
- `align-items: stretch` et `row-gap: 0` sur `.grid-rules`, sinon les bandes
  héritent du `align-items: start` de `.golden-grid` et se réduisent à zéro.

**Intensité.** Le composant pose ses deux tokens sur `:root` et les remonte en
mode sombre, aligné sur la mécanique de thème d'EVA (`.toggle-theme` par
défaut, `prefers-color-scheme` si `$auto-theme-switch: true`) :

```css
:root         { --rule: 1.5%; --rule-void: 2.75%; }
.toggle-theme { --rule: 2%;   --rule-void: 3.5%;  }
```

La couleur, elle, vient de `color-mix(in oklab, var(--dark) var(--rule), transparent)` :
`--dark` bascule déjà avec le thème EVA, donc le tracé s'inverse tout seul.

### 6.8 Repli mono-colonne : le re-mapping des noms

```scss
@media (max-width: 54rem) {
  .golden-grid {
    grid-template-columns:
      [edge-start] var(--gg-gutter)
      [rail-start shoulder-start main-start spill-start] minmax(0, 1fr)
      [rail-end shoulder-end main-end spill-end] var(--gg-gutter) [edge-end];
  }
}
```

Toutes les lignes nommées se rabattent sur les deux bords de l'unique piste.
**Aucune règle de placement n'est réécrite** : `.rail`, `.main`, `.wide` et
les placements écrits par les projets continuent de résoudre, et résolvent
tous vers la même colonne. Ajouter un bloc n'oblige donc pas à écrire sa
contrepartie mobile — c'est le principal gain de maintenance du composant.

Trois exceptions seulement sont redéclarées : `.spill` (qui garde son débord à
droite), `.rail--sticky` (repassé en `static`), `.grid-rules` (masqué — une
seule piste n'a plus rien à montrer).

### 6.9 Le contrôle d'alignement

La règle du § 5.4 est vérifiée à l'exécution : on lit `grid-template-columns`
sur le rendu, on en déduit la liste des abscisses de ligne, puis on mesure
chaque conteneur placé. Ce contrôle est **hors composant** — il appartient au
guide de styles du projet, pas à la feuille.

```js
const style = getComputedStyle(grid)
const gap   = parseFloat(style.columnGap)
const lines = [0]
let x = 0

for (const track of style.gridTemplateColumns.split(' ').map(parseFloat).filter(Number.isFinite)) {
  x += track; lines.push(Math.round(x))
  x += gap;   lines.push(Math.round(x))
}

const onLine = (v) => lines.some((line) => Math.abs(line - v) < 3)
```

Un élément en `justify-self: end` n'engage que son bord droit ; les autres
engagent leurs deux bords. Le rapport **nomme** les écarts au lieu de les
compter.

Le seul écart attendu est le titre de page : son `margin-left: -0.055em`
(décalage optique) sort sa boîte d'un demi-signe pour que le *dessin* de la
lettre, lui, touche la ligne.

En complément, `.grid-debug` sur `<body>` cerne d'un liseré chaque élément
réellement placé : le tracé montre les pistes, le liseré montre ce qui les
occupe.

---

## 7. Ce que le composant consomme

| Dépendance | Origine | Remarque |
| --- | --- | --- |
| `--24`, `--32`, `--48` | échelle `$sizes` d'EVA | gaps et rythme vertical ; fallback CSS si absents |
| `--dark` | système de couleurs EVA | tracé de fond, via `color-mix` |
| `--brand__` | système de couleurs EVA | liseré de `.grid-debug` |
| `--rule`, `--rule-void` | posés par le composant | intensité du tracé, surchargeables en CSS |
| `--gg-*` | posés par le composant | marge calculée et tokens d'exécution (§ 5.3) |

Rien d'autre. Ni reset, ni utilitaires, ni gradients : `eva-css-fluid/variables`
suffit. La **marge** ne consomme aucun cran d'échelle : c'est un pourcentage de
la page.

---

## 8. Nommage et collisions

`src/_grid.scss` définit déjà `.grid`, `.flex-grid`, `.auto-fit-*`, `.col-*` :
le conteneur s'appelle donc `.golden-grid`, jamais `.grid`.

Restent les classes de placement. Avec `$prefix: ''` (défaut, fidèle à
l'implémentation de référence), le composant émet `.rail`, `.main`, `.wide`,
`.spill`, `.bleed`, `.blocks` — des noms génériques dans un espace de noms
partagé, et `.main` se confond à la lecture avec le sélecteur d'élément `main`.

**En framework complet, poser `$golden-grid-prefix: 'gg-'`.** Le préfixe
s'applique à toutes les classes, conteneur compris (`.gg-golden-grid`,
`.gg-rail`, `.gg-main`…). Les lignes nommées ne changent pas : les placements
écrits par les projets restent valides quel que soit le préfixe.

---

## 9. Recettes

### 9.1 Titre de section et texte côte à côte

```html
<div class="golden-grid">
  <div class="blocks">
    <h2 class="block-heading">Méthode</h2>   <!-- grid-column: rail -->
    <div class="block-text">…</div>          <!-- grid-column: main, même rangée -->
  </div>
</div>
```

```scss
.block-heading {
  grid-column: rail;
  text-align: right;
  text-wrap: balance;
}
```

Le placement dense fait remonter le texte sur la rangée du titre.

### 9.2 Image en débord asymétrique

```scss
.block-image {
  grid-column: main-start / edge-end; // gauche sur la colonne de texte,
} //                                     droite au bord de page
```

L'alignement n'est cassé que d'un côté : c'est ce qui donne le mouvement sans
perdre le repère de lecture.

### 9.3 Cartes sur la coupure dorée

```scss
.cards {
  grid-column: edge;
  display: grid;
  grid-template-columns: subgrid;
  row-gap: var(--96);
}

.cards > :nth-child(odd)  { grid-column: rail-start / shoulder-end; } // 0,382
.cards > :nth-child(even) { grid-column: main-start / spill-end; }    // 0,618
.cards > :nth-child(even) { margin-top: var(--96); }
```

Deux cartes par rangée, de largeurs **inégales**, posées sur la coupure dorée
elle-même. La ligne des vignettes n'est jamais droite, et c'est le système qui
le décide.

Chaque carte devient conteneur de requête et rebascule l'unité fluide d'EVA sur
sa propre largeur — une carte étroite compose petit, une large compose grand,
sans media query (voir [FLUID-RUNTIME.md](FLUID-RUNTIME.md)) :

```scss
.card {
  container-type: inline-size;
  --eva-fluid-unit: 1cqi;
}
```

Attention : `container-type` applique le confinement de style, qui **isole les
compteurs CSS**. Un numéro de carte doit venir du gabarit, pas d'un
`counter-increment` — sinon toutes les cartes affichent `01`.

### 9.4 Citation

```scss
.block-quote {
  grid-column: rail-start / main-end; // du bord le plus à gauche
} //                                    jusqu'au bord de la colonne de texte
```

### 9.5 Échelle de Fibonacci

Le rythme d'origine du composant est fibonaccien. Sur une échelle qui le
fournit, on repasse les gaps :

```scss
@use 'eva-css-fluid' with (
  $sizes: 8, 13, 16, 21, 34, 55, 89, 144,
  $golden-grid: true,
  $golden-grid-column-gap: var(--21),
  $golden-grid-row-gap: var(--34),
  $golden-grid-blocks-row-gap: var(--55)
);
```

La **marge** n'est pas concernée : elle vaut φ⁻⁶ de la page, donc elle ne
consomme aucun cran d'échelle. `$golden-grid-gutter-min` ne sert que si l'on
repasse `$golden-grid-gutter-phi: false`.

---

## 10. Décisions et limites

**Décisions tranchées à l'intégration**

1. **`.rail` reste aligné à droite en mono-colonne.** Sur une colonne unique,
   une métadonnée alignée à droite se défend — elle rappelle la mise en page
   large. Un titre de section aligné à droite au-dessus d'un texte aligné à
   gauche est plus discutable : `$rail-align-mobile: left` le repasse à gauche
   sous le point de bascule.
2. **Les lignes gardent leurs noms `main-*`.** « main » désigne la piste de
   texte, pas le contenu principal de la page ; `text-*` serait plus juste,
   mais les lignes nommées sont le contrat public et les renommer romprait
   tous les placements existants.
3. **`$rules: false` est un chemin de première classe.** Tracé désactivé, le
   composant n'émet ni `.grid-rules`, ni `--rule`, ni le masquage mobile.
4. **La marge est dorée par défaut (φ⁻⁶).** Une grille dorée dont les marges
   viennent d'une échelle de design system était l'incohérence du composant : la
   marge est maintenant une part de la page, comme les pistes sont des parts de
   la composition. L'exposant est réglable et `false` rend l'ancien
   comportement. Le coût est assumé : la mesure de lecture passe de ≈ 60 à
   ≈ 53 signes.

5. **Seuls les gaps sont exposés à l'exécution.** Ils sont prélevés avant la
   distribution des `fr`, donc les retuner ne peut pas fausser les proportions.
   Les pistes et la marge, elles, restent des décisions de compilation : les
   ouvrir à l'exécution reviendrait à laisser un projet casser la géométrie
   sans erreur.

**Limites**

- **Une seule bascule.** Le composant ne prévoit qu'un point de repli (quatre
  pistes → une). Un état intermédiaire à deux pistes est possible mais n'est
  pas fourni : il demanderait de choisir quelles pistes fusionnent, ce qui est
  une décision de projet.
- **Le tracé suppose une page à grille unique.** Plusieurs grilles de largeurs
  différentes dans une même page rendraient le tracé faux pour l'une d'elles.
- **Pas de variante RTL.** Les rôles sont pensés avec un bord gauche fort ; une
  version logique (`inline-start`) demanderait de revoir le sens de l'asymétrie,
  pas seulement d'échanger les noms.
- **Le contrôle d'alignement est en JS et hors composant.** Sans lui, la règle
  du § 5.4 redevient une simple intention.

---

## 11. Compatibilité

| Fonctionnalité | Chrome | Safari | Firefox |
| --- | --- | --- | --- |
| `subgrid` | 117 | 16 | 71 |
| `color-mix()` | 111 | 16.2 | 113 |
| `minmax()`, lignes nommées, `dense` | ancien | ancien | ancien |

`subgrid` est le plancher réel : disponible partout depuis septembre 2023.

Dégradation si `subgrid` manque : `.blocks` devient une grille à une colonne et
tous les blocs se placent dessus. La page reste lisible, elle perd son
asymétrie. Repli explicite si on le souhaite :

```css
@supports not (grid-template-columns: subgrid) {
  .blocks { grid-column: main; display: block; }
}
```

---

## 12. Checklist d'adoption

- [ ] `.grid-page` (ou `position: relative` + `isolation: isolate`) sur
      l'ancêtre si le tracé est activé.
- [ ] Aucune largeur en `px`, `%` ou `ch` sur un élément placé.
- [ ] Aucun `margin: auto` horizontal, aucun centrage.
- [ ] Tout nouveau bloc déclare une piste ou hérite de `main`.
- [ ] Tout bloc qui quitte `main` précède, dans le DOM, ce à quoi il se
      rapporte (contrainte du placement dense).
- [ ] Resserrer une section passe par `--gg-column-gap`, jamais par un
      `padding` posé sur un élément placé — le premier ne touche pas aux
      proportions, le second décale un bord.
- [ ] Le contrôle d'alignement passe : zéro conteneur hors piste, hors décalage
      optique du titre.
