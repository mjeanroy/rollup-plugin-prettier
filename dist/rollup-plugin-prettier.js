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

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var hasIn = require("lodash.hasin");

var isEmpty = require("lodash.isempty");

var isNil = require("lodash.isnil");

var omitBy = require("lodash.omitby");

var MagicString = require("magic-string");

var diff = require("diff");

var prettier = require("prettier");
/**
 * The plugin options that are currently supported.
 * @type {Set<string>}
 */

var OPTIONS = new Set(["sourcemap", "sourceMap", "cwd"]);

module.exports =
  /*#__PURE__*/
  (function() {
    /**
     * Initialize plugin & prettier.
     *
     * @param {Object} options Initalization option.
     */
    function RollupPluginPrettier() {
      var options =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, RollupPluginPrettier);

      // Initialize plugin name.
      this.name = "rollup-plugin-prettier"; // Initialize main options.

      this._options = omitBy(options, function(value, key) {
        return OPTIONS.has(key);
      }); // Try to resolve config file it it exists
      // Be careful, `resolveConfig` function does not exist on old version of prettier.

      if (prettier.resolveConfig) {
        var cwd = hasIn(options, "cwd") ? options.cwd : process.cwd();
        var configOptions = prettier.resolveConfig.sync(cwd);

        if (configOptions != null) {
          this._options = Object.assign(configOptions, this._options || {});
        }
      } // Reset empty options.

      if (isEmpty(this._options)) {
        this._options = undefined;
      } // Check if sourcemap is enabled by default.

      if (hasIn(options, "sourcemap")) {
        this._sourcemap = options.sourcemap;
      } else if (hasIn(options, "sourceMap")) {
        console.warn(
          "[".concat(
            this.name,
            "] The sourceMap option is deprecated, please use sourcemap instead."
          )
        );
        this._sourcemap = options.sourceMap;
      } else {
        this._sourcemap = null;
      }
    }
    /**
     * Get the `sourcemap` value.
     *
     * @return {boolean} The `sourcemap` flag value.
     */

    _createClass(RollupPluginPrettier, [
      {
        key: "getSourcemap",
        value: function getSourcemap() {
          return this._sourcemap;
        }
        /**
         * Disable sourcemap.
         *
         * @return {void}
         */
      },
      {
        key: "enableSourcemap",
        value: function enableSourcemap() {
          this._sourcemap = true;
        }
        /**
         * Reformat source code using prettier.
         *
         * @param {string} source The source code to reformat.
         * @param {boolean} sourcemap If sourcemap should be generated or not.
         * @return {Object} The transformation result.
         */
      },
      {
        key: "reformat",
        value: function reformat(source, sourcemap) {
          var output = prettier.format(source, this._options); // Should we generate sourcemap?
          // The sourcemap option may be a boolean or any truthy value (such as a `string`).
          // Note that this option should be false by default as it may take a (very) long time.

          var defaultSourcemap = isNil(this._sourcemap)
            ? false
            : this._sourcemap;
          var outputSourcemap = isNil(sourcemap) ? defaultSourcemap : sourcemap;

          if (!outputSourcemap) {
            return {
              code: output
            };
          }

          console.warn(
            "[".concat(
              this.name,
              "] Sourcemap is enabled, computing diff is required"
            )
          );
          console.warn(
            "[".concat(
              this.name,
              "] This may take a moment (depends on the size of your bundle)"
            )
          );
          var magicString = new MagicString(source);
          var changes = diff.diffChars(source, output);

          if (changes && changes.length > 0) {
            var idx = 0;
            changes.forEach(function(part) {
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
              hires: true
            })
          };
        }
      }
    ]);

    return RollupPluginPrettier;
  })();
