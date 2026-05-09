# Changelog — eva-css-fluid

All notable changes to this package are documented here.

## [Unreleased]

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
