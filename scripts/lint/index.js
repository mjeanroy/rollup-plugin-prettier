/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017-2023 Mickael Jeanroy
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

const path = require('node:path');
const config = require('../config');
const log = require('../log');

module.exports = function lint() {
  const nodeVersion = process.versions.node;
  const major = Number(nodeVersion.split('.')[0]);
  if (major <= 14) {
    log.debug(`Skipping ESLint because of node version compatibility (currenly in used: ${nodeVersion})`);
    return Promise.resolve();
  }

  const sourcesOf = (ext) => ([
    path.join(config.root, `*.${ext}`),
    path.join(config.src, '**', `*.${ext}`),
    path.join(config.test, '**', `*.${ext}`),
    path.join(config.scripts, '**', `*.${ext}`),
  ]);

  const inputs = [
    ...sourcesOf('js'),
    ...sourcesOf('ts'),
  ];

  log.debug('Linting files: ');

  inputs.forEach((f) => {
    log.debug(`  ${f}`);
  });

  // eslint-disable-next-line global-require
  const { ESLint } = require('eslint');

  // eslint-disable-next-line global-require
  const fancyLog = require('fancy-log');

  const eslint = new ESLint({
    errorOnUnmatchedPattern: false,
  });

  const lintFiles = eslint.lintFiles(inputs);
  const loadFormatter = eslint.loadFormatter('stylish');

  return Promise.all([lintFiles, loadFormatter]).then(([results, formatter]) => {
    for (let i = 0; i < results.length; ++i) {
      const lintResult = results[i];
      if (lintResult.warningCount > 0 || lintResult.errorCount > 0 || lintResult.fatalErrorCount > 0) {
        fancyLog(formatter.format(results));
        throw new Error('ESLintError');
      }
    }
  });
};
