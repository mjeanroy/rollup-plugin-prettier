# rollup-plugin-prettier

[![Greenkeeper badge](https://badges.greenkeeper.io/mjeanroy/rollup-plugin-prettier.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/mjeanroy/rollup-plugin-prettier.svg?branch=master)](https://travis-ci.org/mjeanroy/rollup-plugin-prettier)
[![Npm version](https://badge.fury.io/js/rollup-plugin-prettier.svg)](https://badge.fury.io/js/rollup-plugin-prettier)

Rollup plugin that can be used to run [prettier](http://npmjs.com/package/prettier) on the final bundle.

## How to use

Install the plugin with NPM:

`npm install --save-dev rollup-plugin-prettier`

Then add it to your rollup configuration:

const path = require('path');
const prettier = require('rollup-plugin-prettier');

```javascript
module.exports = {
  entry: path.join(__dirname, 'src', 'index.js'),
  dest: path.join(__dirname, 'dist', 'bundle.js'),
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

If source map is enabled in the global rollup options, then a source map will be generated on the formatted bundle.
Note that this may take some time since `prettier` package is not able to generate a sourcemap : this plugin must compute the diff between the original bundle and the formatted result and generate the corresponding source map.

Here is an example:

```javascript
const path = require('path');
const prettier = require('rollup-plugin-prettier');

module.exports = {
  entry: path.join(__dirname, 'src', 'index.js'),
  dest: path.join(__dirname, 'dist', 'bundle.js'),
  sourceMap: true,
  plugins: [
    prettier(),
  ],
};
```

## License

MIT License (MIT)

## Contributing

If you find a bug or think about enhancement, feel free to contribute and submit an issue or a pull request.
