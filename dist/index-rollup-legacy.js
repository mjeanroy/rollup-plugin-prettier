/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017-2019 Mickael Jeanroy
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

var hasIn = require("lodash.hasin");

var isNil = require("lodash.isnil");

var RollupPluginPrettier = require("./rollup-plugin-prettier.js");

module.exports = function(options) {
  var plugin = new RollupPluginPrettier(options);
  return {
    /**
     * Plugin name (used by rollup for error messages and warnings).
     * @type {string}
     */
    name: plugin.name,

    /**
     * Function called by `rollup` that is used to read the `sourceMap` setting.
     *
     * @param {Object} opts Rollup options.
     * @return {void}
     */
    options: function options() {
      var opts =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (isNil(plugin.getSourcemap())) {
        // Get the global `sourcemap` option on given object.
        // Should support:
        //  - `sourcemap` (lowercase) option which is the name with rollup >= 0.48.0,
        //  - `sourceMap` (camelcase) option which is the (deprecated) name with rollup < 0.48.0.
        var globalSourcemap = isSourceMapEnabled(opts); // Since rollup 0.48, sourcemap option can be set on the `output` object.

        var output = opts.output || {};
        var outputSourceMap = Array.isArray(output)
          ? output.some(isSourceMapEnabled)
          : isSourceMapEnabled(output); // Enable or disable `sourcemap` generation.

        var sourcemap = globalSourcemap || outputSourceMap;

        if (sourcemap) {
          plugin.enableSourcemap();
        }
      }
    },

    /**
     * Function called by `rollup` before generating final bundle.
     *
     * @param {string} source Souce code of the final bundle.
     * @param {Object} outputOptions Output option.
     * @return {Object} The result containing a `code` property and, if a enabled, a `map` property.
     */
    transformBundle: function transformBundle(source, outputOptions) {
      var sourcemap = hasIn(outputOptions, "sourcemap")
        ? outputOptions.sourcemap
        : outputOptions.sourceMap;
      return plugin.reformat(source, sourcemap);
    }
  };
};
/**
 * Check if `sourcemap` option is enable or not.
 *
 * @param {Object} opts Options.
 * @return {boolean} `true` if sourcemap is enabled, `false` otherwise.
 */

function isSourceMapEnabled(opts) {
  return !!(opts.sourcemap || opts.sourceMap);
}
