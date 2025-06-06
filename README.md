# rollup-plugin-prettier

[![Greenkeeper badge](https://badges.greenkeeper.io/mjeanroy/rollup-plugin-prettier.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/mjeanroy/rollup-plugin-prettier.svg?branch=master)](https://travis-ci.org/mjeanroy/rollup-plugin-prettier)
[![Npm version](https://badge.fury.io/js/rollup-plugin-prettier.svg)](https://badge.fury.io/js/rollup-plugin-prettier)

Rollup plugin that can be used to run [prettier](http://npmjs.com/package/prettier) on the final bundle.

## How to use

Install the plugin with NPM:

`npm install --save-dev prettier rollup-plugin-prettier`

Then add it to your rollup configuration:

```javascript
const path = require('path');
const prettier = require('rollup-plugin-prettier');

module.exports = {
  input: path.join(__dirname, 'src', 'index.js'),

  output: {
    file: path.join(__dirname, 'dist', 'bundle.js'),
  },

  plugins: [
    // Run plugin with prettier options.
    prettier({
      tabWidth: 2,
      singleQuote: false,
    }),
  ],
};
```

## Source Maps

If source map is enabled in the global rollup options, then a source map will be generated on the formatted bundle (except if sourcemap are explicitely disabled in the prettier options).

Note that this may take some time since `prettier` package is not able to generate a sourcemap and this plugin must compute the diff between the original bundle and the formatted result and generate the corresponding sourcemap: for this reason, sourcemap are disabled by default.

Here is an example:

```javascript
const path = require('path');
const prettier = require('rollup-plugin-prettier');

module.exports = {
  input: path.join(__dirname, 'src', 'index.js'),

  output: {
    file: path.join(__dirname, 'dist', 'bundle.js'),
    sourcemap: true,
  },

  plugins: [
    prettier({
      sourcemap: true, // Can also be disabled/enabled here.
    }),
  ],
};
```

## ChangeLogs

- 4.1.2
  - Fix a bug where prettier configuration file were not correctly resolved since `prettier@^3.1.1` (same as [this bug in prettier-vscode](https://github.com/prettier/prettier-vscode/issues/3104), broken since [this commit in prettier](https://github.com/prettier/prettier/pull/15363)).
  - Dependency upgrades
- 4.1.1
  - Fix support rollup for ^4.0.0, that was intended to be introduced in `4.1.0`
  - Dependency upgrades
- 4.1.0
  - ~Support rollup ^4.0.0~
  - Dependency upgrades
- 4.0.0
  - Support prettier ^3.0.0
  - Dependency upgrades
- 3.1.0
  - Reformat asynchrnously to prepare support for prettier ^3.0.0
- 3.0.0
  - Support rollup ^3.0.0
- 2.2.2
  - Remove IDE files from published package
- 2.2.1
  - Fix typings
  - Dependency updates
- 2.2.0
  - Add typings ([#696](https://github.com/mjeanroy/rollup-plugin-prettier/pull/696), thanks [@pastelmind](https://github.com/pastelmind)!)
  - Dependency updates
- 2.1.0
  - Add option to not log warning due to heavy diff computation ([#435](https://github.com/mjeanroy/rollup-plugin-prettier/pull/435))
  - Dependency updates
- 2.0.0
  - Support node >= 10 (still support node >= 6, but it not tested anymore).
  - Update dev dependencies.
- 1.0.0
  - **Breaking Change**: `prettier` dependency is now a peer dependency instead of a "direct" dependency: user of the plugin can choose to use prettier 1.x.x or prettier 2.x.x (note that this plugin should be compatible with all versions of prettier).
  - Support node >= 6.
  - Support rollup >= 1.0.0
  - Remove support of deprecated option (`sourceMap` was deprecated in favor of `sourcemap`).
- 0.7.0
  - Dependency updates.
  - Update rollup peer dependency version.
- 0.6.0
  - Add support for rollup >= 1 (thanks to [@Andarist](https://github.com/Andarist), see [#211](https://github.com/mjeanroy/rollup-plugin-prettier/pull/211))
  - Various dependency updates.
- 0.5.0
  - Support resolution of prettier config file (see [#195](https://github.com/mjeanroy/rollup-plugin-prettier/issues/195)).
  - Various dependency updates.
- 0.4.0
  - Add compatibility with rollup >= 0.53 with output `sourcemap` option (see [rollup #1583](https://github.com/rollup/rollup/issues/1583)).
  - Avoid side-effect and do not change the plugin options (see [032be5](https://github.com/mjeanroy/rollup-plugin-prettier/commit/032be56317ab83cd87c2460f1dadc05a617c0d12)).
  - Various dependency updates.
- 0.3.0
  - Support new `sourcemap` (lowercase) option of rollup.
  - Sourcemap can now be activated/disabled in the plugin options.
- 0.2.0
  - Dependency update (`magic-string`)
- 0.1.0 First release

## License

MIT License (MIT)

## Contributing

If you find a bug or think about enhancement, feel free to contribute and submit an issue or a pull request.

