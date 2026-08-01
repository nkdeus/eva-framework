# Changelog — eva-css-fluid

All notable changes to this package are documented here.

## [Unreleased]

### Added
- **Décalages de luminosité par rôle.** Les quatre crans (`-d`, `-b`, `-d_`, `-b_`)
  lisent désormais un token propre à leur base avant de retomber sur le token global :
  `--<base>-<token>` (ex. `--dark-darker`, `--accent-brighter_`). Les neutres peuvent
  prendre des pas de 2–4 points pendant que l'accent en prend 12–30, ce qui était
  impossible avec un `--darker` unique partagé par les cinq bases.
  ```css
  .current-theme { --dark-darker: -2%; --accent-brighter_: 12%; }
  ```
- **Crans proportionnels (opt-in).** `--<base>-<token>-ratio` (fraction sans unité,
  `0` par défaut) fait viser à un cran une part de la marge restante jusqu'à sa butée
  au lieu d'un décalage absolu : `lightness = base + absolu + (butée − base) × ratio`.
  Corrige la saturation en butée, où deux crans rendaient la même couleur — en mode
  clair `--light-b` et `--light-b_` tombaient tous deux sur du blanc, en mode sombre
  `--dark-d` et `--dark-d_` sur du noir.
  ```css
  .current-theme {
    --light-brighter:  0%; --light-brighter-ratio:  .35;
    --light-brighter_: 0%; --light-brighter_-ratio: .7;
  }
  ```
- `--<token>-bound` — la butée visée par chaque cran, inversée par mode de thème comme
  les offsets eux-mêmes (`--brighter-bound` : `100%` en clair, `0%` en sombre).
  Surchargeable par rôle.

### Fixed
- README : `--brand___` était documenté à 5 % d'opacité, la valeur émise est 15 %.

### Compatibility
- Aucun changement de valeur calculée. Les 20 variantes (5 bases × 4 crans) ont été
  comparées en `getComputedStyle` entre le build d'avant et celui d'après, en mode
  clair et en mode sombre : 0 dérive. Le repli natif de `var()` restitue la valeur
  globale tant qu'aucun token par rôle n'est défini, et le ratio vaut `0` tant qu'il
  n'est pas posé.
- Voir [`docs/BRIGHTNESS-ROLES.md`](docs/BRIGHTNESS-ROLES.md).

## [2.2.0] — 2026-06-28

### Added
- **Runtime-switchable fluid unit.** Every token now emits its fluid term as
  `calc(<coef> * var(--eva-fluid-unit, 1vw) ± <offset>)` instead of a baked-in
  `<coef>vw`. A single `eva.css` can now follow the viewport (`vw`, default) **or**
  any container (`cqi`) — switched per subtree at runtime, no rebuild, no second file.
  ```css
  .card { container-type: inline-size; --eva-fluid-unit: 1cqi; } /* EVA tokens follow .card */
  ```
- `@property --eva-fluid-unit` (typed `<length>`, inherited) is declared once so the
  override is stored as a typed value, not a re-parsed string.
- Opt-in container utilities `.eva-root` and `.eva-cqi`.
- **Accessibility readability floor.** `minFontSize` / `$min-font-size` (px) raises the
  lower (`min`) bound of every font-size `clamp()` so fluid type in a small `cqi`
  container / on mobile never renders below a readable size. This `min` bound is the
  *small-screen (mobile)* size — recommended `13`–`14`, not the desktop body size.
  Stored in `rem`, so user zoom / root-font preference still applies. Font-size tokens
  only; spacing untouched. Default `0` = disabled.
- New config options (SCSS `@use ... with` **and** JSON config):
  - `fluidUnit` / `$unit-fluid` — fluid unit & runtime fallback (default `1vw`).
  - `referenceWidth` / `$reference-width` — width where tokens hit their max (was the
    hard-coded `$screen: 1440`).
  - `fluidRuntime` / `$fluid-runtime` — `true` (default) emits the runtime form;
    `false` restores the legacy literal output (byte-identical, zero runtime cost).
  - `minFontSize` / `$min-font-size` — a11y readability floor in px (default `0` = off).

### Backward compatibility
- Fully backward compatible. With `--eva-fluid-unit` unset, `calc(0.56 * 1vw + …)`
  resolves to exactly the previous `0.56vw + …` — identical **computed** values for
  every existing consumer. `fluidRuntime: false` reproduces the old bytes verbatim.

### Deprecated
- JSON config workflow (`eva.config.cjs`, CLI commands `init` / `setup` / `validate` / `generate`,
  custom `build-with-config.cjs` script). Will be removed in **v3.0.0**.
- Migrate to direct SCSS config:
  ```scss
  @use 'eva-css-fluid' with (
    $sizes: (...),
    $font-sizes: (...)
  );
  ```
  The generated CSS is identical. See https://eva-css.xyz/framework/doc.html for the SCSS-only reference.
- The deprecated CLI commands now print a warning to stderr. Set
  `EVA_CSS_NO_DEPRECATION_WARNING=1` to silence it (e.g. in CI).

## [2.0.8] and earlier

See git history at https://github.com/nkdeus/eva-framework.
