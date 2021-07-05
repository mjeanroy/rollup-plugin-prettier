/**
 * @file Type definition for rollup-plugin-prettier
 */

import type { Options as PrettierOptions } from "prettier";
import type { Plugin } from "rollup";

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
    sourcemap?: boolean;
  }
}

declare function prettier(options?: prettier.Options): Plugin;

export = prettier;
