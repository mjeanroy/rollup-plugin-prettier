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

import path from 'path';
import { RollupPluginPrettier } from '../src/rollup-plugin-prettier';
import { verifyWarnLogsBecauseOfSourcemap } from './utils/verify-warn-logs-because-of-source-map';
import { verifyWarnLogsNotTriggered } from './utils/verify-warn-logs-not-triggered';
import { installWarnSpy } from './utils/install-warn-spy';
import { joinLines } from './utils/join-lines';

describe('RollupPluginPrettier', () => {
  beforeEach(() => {
    installWarnSpy();
  });

  it('should create the plugin with a name', () => {
    const plugin = new RollupPluginPrettier({
      parser: 'babel',
    });

    expect(plugin.name).toBe('rollup-plugin-prettier');
    expect(plugin.getSourcemap()).toBeNull();
  });

  it('should run plugin without sourcemap by default', () => {
    const plugin = new RollupPluginPrettier({
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    return plugin.reformat(code).then((result) => {
      verifyWarnLogsNotTriggered();
      expect(result.map).not.toBeDefined();
      expect(result.code).toBe(
        joinLines([
          'var foo = 0;',
          'var test = "hello world";',
          '',
        ]),
      );
    });
  });

  it('should run prettier with sourcemap', () => {
    const plugin = new RollupPluginPrettier({
      parser: 'babel',
      sourcemap: true,
    });

    const code = 'var foo=0;var test="hello world";';
    return plugin.reformat(code).then((result) => {
      expect(plugin.getSourcemap()).toBe(true);

      verifyWarnLogsBecauseOfSourcemap();
      expect(result.map).toBeDefined();
      expect(result.code).toBe(
        joinLines([
          'var foo = 0;',
          'var test = "hello world";',
          '',
        ]),
      );
    });
  });

  it('should run prettier with sourcemap skipping warn message', () => {
    const plugin = new RollupPluginPrettier({
      parser: 'babel',
      sourcemap: 'silent',
    });

    const code = 'var foo=0;var test="hello world";';
    return plugin.reformat(code).then((result) => {
      expect(plugin.getSourcemap()).toBe('silent');

      verifyWarnLogsNotTriggered();
      expect(result.map).toBeDefined();
      expect(result.code).toBe(
        joinLines([
          'var foo = 0;',
          'var test = "hello world";',
          '',
        ]),
      );
    });
  });

  it('should run prettier with sourcemap if it has been enabled', () => {
    const plugin = new RollupPluginPrettier({
      parser: 'babel',
    });

    expect(plugin.getSourcemap()).toBeNull();

    // Enable sourcemap explicitely.
    plugin.enableSourcemap();

    const code = 'var foo=0;var test="hello world";';
    return plugin.reformat(code).then((result) => {
      expect(plugin.getSourcemap()).toBe(true);

      verifyWarnLogsBecauseOfSourcemap();
      expect(result.map).toBeDefined();
      expect(result.code).toBe(
        joinLines([
          'var foo = 0;',
          'var test = "hello world";',
          '',
        ]),
      );
    });
  });

  it('should run prettier with sourcemap enable in reformat', () => {
    const plugin = new RollupPluginPrettier({
      parser: 'babel',
      sourcemap: false,
    });

    const code = 'var foo=0;var test="hello world";';
    const outputOptions = { sourcemap: true };

    return plugin.reformat(code, outputOptions).then((result) => {
      expect(plugin.getSourcemap()).toBe(false);

      verifyWarnLogsBecauseOfSourcemap();
      expect(result.map).toBeDefined();
      expect(result.code).toBe(
        joinLines([
          'var foo = 0;',
          'var test = "hello world";',
          '',
        ]),
      );
    });
  });

  it('should run prettier without sourcemap enable in reformat', () => {
    const plugin = new RollupPluginPrettier({
      parser: 'babel',
      sourcemap: true,
    });

    const code = 'var foo=0;var test="hello world";';
    const outputOptions = { sourcemap: false };
    return plugin.reformat(code, outputOptions).then((result) => {
      expect(plugin.getSourcemap()).toBe(true);

      verifyWarnLogsNotTriggered();
      expect(result.map).not.toBeDefined();
      expect(result.code).toBe(
        joinLines([
          'var foo = 0;',
          'var test = "hello world";',
          '',
        ]),
      );
    });
  });

  it('should run prettier using config file from given current working directory', () => {
    const cwd = path.join(__dirname, 'fixtures');
    const parser = 'babel';
    const options = {
      parser,
      cwd,
    };

    const plugin = new RollupPluginPrettier(options);
    const code = joinLines([
      'var name = "John Doe";',
      'if (true) {',
      '    console.log(name);',
      '}',
    ]);

    return plugin.reformat(code).then((result) => {
      expect(result.code).toEqual(joinLines([
        'var name = \'John Doe\';',
        'if (true) {',
        ' console.log(name);',
        '}',
        '',
      ]));

      expect(options).toEqual({
        parser,
        cwd,
      });
    });
  });
});
