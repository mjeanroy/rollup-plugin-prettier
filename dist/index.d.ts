/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017-2021 @pastelmind <https://github.com/pastelmind>
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

/**
 * @file Type definition for rollup-plugin-prettier
 */

import type {Options as PrettierOptions} from 'prettier';
import type {Plugin} from 'rollup';

declare namespace prettier {
  interface Options extends PrettierOptions {
    /**
     * Directory to look for a Prettier config file.
     *
     * If omitted, defaults to `process.cwd()`.
     */
    cwd?: string;

    /**
     * Whether to generate a sourcemap.
     *
     * Note: This may take some time because rollup-plugin-prettier diffs the
     * output to manually generate a sourcemap.
     */
    sourcemap?: boolean | 'silent';
  }
}

declare function prettier(options?: prettier.Options): Plugin;

export = prettier;
