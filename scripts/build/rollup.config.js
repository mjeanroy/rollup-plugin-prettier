/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017-2020 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const path = require('path');
const prettier = require('prettier');
const stripBanner = require('rollup-plugin-strip-banner');
const babel = require('@rollup/plugin-babel').default;
const license = require('rollup-plugin-license');
const config = require('../config');
const pkg = require('../../package.json');

module.exports = {
  input: path.join(config.src, 'index.js'),

  output: [
    {
      format: 'cjs',
      file: path.join(config.dist, 'index.js'),
    },
  ],

  plugins: [
    stripBanner(),

    babel({
      envName: 'rollup',
      babelHelpers: 'bundled',
    }),

    license({
      banner: {
        content: {
          file: path.join(config.root, 'LICENSE'),
        },
      },
    }),

    {
      renderChunk(code) {
        return prettier.format(code, {
          parser: 'babel',
        });
      },
    },
  ],

  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
  ],
};
