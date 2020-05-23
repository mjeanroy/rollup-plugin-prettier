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

"use strict";

function _interopDefault(ex) {
  return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
}

var hasIn = _interopDefault(require("lodash.hasin"));
var isEmpty = _interopDefault(require("lodash.isempty"));
var isNil = _interopDefault(require("lodash.isnil"));
var omitBy = _interopDefault(require("lodash.omitby"));
var MagicString = _interopDefault(require("magic-string"));
var diff = require("diff");
var prettier = _interopDefault(require("prettier"));

/**
 * The plugin options that are currently supported.
 * @type {Set<string>}
 */

const OPTIONS = new Set(["sourcemap", "cwd"]);
/**
 * The plugin.
 *
 * @class
 */

class RollupPluginPrettier {
  /**
   * Initialize plugin & prettier.
   *
   * @param {Object} options Initalization option.
   */
  constructor(options = {}) {
    // Initialize plugin name.
    this.name = "rollup-plugin-prettier"; // Initialize main options.

    this._options = omitBy(options, (value, key) => OPTIONS.has(key)); // Try to resolve config file it it exists
    // Be careful, `resolveConfig` function does not exist on old version of prettier.

    if (prettier.resolveConfig) {
      const cwd = hasIn(options, "cwd") ? options.cwd : process.cwd();
      const configOptions = prettier.resolveConfig.sync(cwd);

      if (configOptions != null) {
        this._options = Object.assign(configOptions, this._options || {});
      }
    } // Reset empty options.

    if (isEmpty(this._options)) {
      this._options = undefined;
    } // Check if sourcemap is enabled by default.

    if (hasIn(options, "sourcemap")) {
      this._sourcemap = options.sourcemap;
    } else {
      this._sourcemap = null;
    }
  }
  /**
   * Get the `sourcemap` value.
   *
   * @return {boolean} The `sourcemap` flag value.
   */

  getSourcemap() {
    return this._sourcemap;
  }
  /**
   * Disable sourcemap.
   *
   * @return {void}
   */

  enableSourcemap() {
    this._sourcemap = true;
  }
  /**
   * Reformat source code using prettier.
   *
   * @param {string} source The source code to reformat.
   * @param {boolean} sourcemap If sourcemap should be generated or not.
   * @return {Object} The transformation result.
   */

  reformat(source, sourcemap) {
    const output = prettier.format(source, this._options); // Should we generate sourcemap?
    // The sourcemap option may be a boolean or any truthy value (such as a `string`).
    // Note that this option should be false by default as it may take a (very) long time.

    const defaultSourcemap = isNil(this._sourcemap) ? false : this._sourcemap;
    const outputSourcemap = isNil(sourcemap) ? defaultSourcemap : sourcemap;

    if (!outputSourcemap) {
      return {
        code: output,
      };
    }

    if (defaultSourcemap !== "silent") {
      console.warn(
        `[${this.name}] Sourcemap is enabled, computing diff is required`
      );
      console.warn(
        `[${this.name}] This may take a moment (depends on the size of your bundle)`
      );
    }

    const magicString = new MagicString(source);
    const changes = diff.diffChars(source, output);

    if (changes && changes.length > 0) {
      let idx = 0;
      changes.forEach((part) => {
        if (part.added) {
          magicString.prependLeft(idx, part.value);
          idx -= part.count;
        } else if (part.removed) {
          magicString.remove(idx, idx + part.count);
        }

        idx += part.count;
      });
    }

    return {
      code: magicString.toString(),
      map: magicString.generateMap({
        hires: true,
      }),
    };
  }
}

/**
 * Create rollup plugin compatible with rollup >= 1.0.0
 *
 * @param {Object} options Plugin options.
 * @return {Object} Plugin instance.
 */

function rollupPluginPrettier(options) {
  const plugin = new RollupPluginPrettier(options);
  return {
    /**
     * Plugin name (used by rollup for error messages and warnings).
     * @type {string}
     */
    name: plugin.name,

    /**
     * Function called by `rollup` before generating final bundle.
     *
     * @param {string} source Souce code of the final bundle.
     * @param {Object} chunkInfo Chunk info.
     * @param {Object} outputOptions Output option.
     * @return {Object} The result containing a `code` property and, if a enabled, a `map` property.
     */
    renderChunk(source, chunkInfo, outputOptions) {
      return plugin.reformat(source, outputOptions.sourcemap);
    },
  };
}

module.exports = rollupPluginPrettier;
