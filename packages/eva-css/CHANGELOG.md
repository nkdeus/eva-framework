# Changelog — eva-css-fluid

All notable changes to this package are documented here.

## [Unreleased]

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
