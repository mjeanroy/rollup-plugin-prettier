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

import path from 'path';
import prettier from 'prettier';
import {rollupPluginPrettierLegacy} from '../src/index-rollup-legacy.js';
import {verifyWarnLogsBecauseOfSourcemap} from './utils/verify-warn-logs-because-of-source-map.js';
import {verifyWarnLogsNotTriggered} from './utils/verify-warn-logs-not-triggered.js';
import {installWarnSpy} from './utils/install-warn-spy.js';

describe('rollup-plugin-prettier [legacy]', () => {
  beforeEach(() => {
    installWarnSpy();
  });

  it('should have a name', () => {
    const instance = rollupPluginPrettierLegacy();
    expect(instance.name).toBe('rollup-plugin-prettier');
  });

  it('should run prettier', () => {
    const instance = rollupPluginPrettierLegacy({
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    const outputOptions = {};
    const result = instance.transformBundle(code, outputOptions);

    expect(console.warn).not.toHaveBeenCalled();
    expect(result.map).not.toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourceMap (camelcase) in input options [rollup < 0.48]', () => {
    const instance = rollupPluginPrettierLegacy({
      parser: 'babel',
    });

    instance.options({
      sourceMap: true,
    });

    const code = 'var foo=0;var test="hello world";';
    const outputOptions = {};
    const result = instance.transformBundle(code, outputOptions);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap (lowercase) in input options [rollup >= 0.48]', () => {
    const instance = rollupPluginPrettierLegacy({
      parser: 'babel',
    });

    instance.options({
      sourcemap: true,
    });

    const code = 'var foo=0;var test="hello world";';
    const outputOptions = {};
    const result = instance.transformBundle(code, outputOptions);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap (lowercase) in output options', () => {
    const instance = rollupPluginPrettierLegacy({
      parser: 'babel',
    });

    // The input options may not contain `sourcemap` entry with rollup >= 0.53.
    instance.options({});

    const code = 'var foo=0;var test="hello world";';
    const outputOptions = {sourcemap: true};
    const result = instance.transformBundle(code, outputOptions);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap in output options (camelcase format)', () => {
    const instance = rollupPluginPrettierLegacy({
      parser: 'babel',
    });

    // The input options may not contain `sourcemap` entry with rollup >= 0.53.
    instance.options({});

    const code = 'var foo=0;var test="hello world";';
    const outputOptions = {sourceMap: true};
    const result = instance.transformBundle(code, outputOptions);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap (lowercase) in plugin options', () => {
    const instance = rollupPluginPrettierLegacy({
      sourcemap: true,
      parser: 'babel',
    });

    instance.options({});

    const code = 'var foo=0;var test="hello world";';
    const outputOptions = {};
    const result = instance.transformBundle(code, outputOptions);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap (camelcase) in plugin options', () => {
    const instance = rollupPluginPrettierLegacy({
      sourceMap: true,
      parser: 'babel',
    });

    instance.options({});

    const code = 'var foo=0;var test="hello world";';
    const outputOptions = {};
    const result = instance.transformBundle(code, outputOptions);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap (lowercase) disabled in output options', () => {
    const instance = rollupPluginPrettierLegacy({
      parser: 'babel',
    });

    // The input options may not contain `sourcemap` entry with rollup >= 0.53.
    instance.options({});

    const code = 'var foo=0;var test="hello world";';
    const outputOptions = {sourcemap: false};
    const result = instance.transformBundle(code, outputOptions);

    verifyWarnLogsNotTriggered();
    expect(result.map).not.toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap (camelcase) disabled in output options', () => {
    const instance = rollupPluginPrettierLegacy({
      parser: 'babel',
    });

    // The input options may not contain `sourcemap` entry with rollup >= 0.53.
    instance.options({});

    const code = 'var foo=0;var test="hello world";';
    const outputOptions = {sourceMap: false};
    const result = instance.transformBundle(code, outputOptions);

    verifyWarnLogsNotTriggered();
    expect(result.map).not.toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with options', () => {
    const options = {
      parser: 'babel',
      singleQuote: true,
    };

    const instance = rollupPluginPrettierLegacy(options);
    const code = 'var foo=0;var test="hello world";';
    const outputOptions = {sourcemap: false};
    const result = instance.transformBundle(code, outputOptions);

    expect(result.code).toBe(
        `var foo = 0;\n` +
        `var test = 'hello world';\n`
    );
  });

  it('should remove unnecessary spaces', () => {
    const instance = rollupPluginPrettierLegacy({
      parser: 'babel',
    });

    const code = 'var foo    =    0;\nvar test = "hello world";';
    const outputOptions = {sourcemap: false};
    const result = instance.transformBundle(code, outputOptions);

    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should add and remove characters', () => {
    const instance = rollupPluginPrettierLegacy({
      parser: 'babel',
    });

    const code = 'var foo    =    0;var test = "hello world";';
    const outputOptions = {sourcemap: false};
    const result = instance.transformBundle(code, outputOptions);

    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should avoid side effect and do not modify plugin options', () => {
    const options = {
      parser: 'babel',
      sourcemap: false,
    };

    const instance = rollupPluginPrettierLegacy(options);
    const code = 'var foo = 0;';
    const outputOptions = {};
    instance.transformBundle(code, outputOptions);

    // It should not have been touched.
    expect(options).toEqual({
      parser: 'babel',
      sourcemap: false,
    });
  });

  it('should run prettier without sourcemap options', () => {
    const options = {
      parser: 'babel',
      sourcemap: false,
    };

    spyOn(prettier, 'format').and.callThrough();

    const code = 'var foo = 0;';
    const instance = rollupPluginPrettierLegacy(options);
    const outputOptions = {};
    instance.transformBundle(code, outputOptions);

    expect(prettier.format).toHaveBeenCalledWith(code, {
      parser: 'babel',
    });

    expect(options).toEqual({
      parser: 'babel',
      sourcemap: false,
    });
  });

  it('should run prettier without sourcemap options and custom other options', () => {
    const options = {
      parser: 'babel',
      sourcemap: false,
      singleQuote: true,
    };

    spyOn(prettier, 'format').and.callThrough();

    const code = 'var foo = 0;';
    const instance = rollupPluginPrettierLegacy(options);
    const outputOptions = {};
    instance.transformBundle(code, outputOptions);

    expect(prettier.format).toHaveBeenCalledWith(code, {
      parser: 'babel',
      singleQuote: true,
    });

    expect(options).toEqual({
      parser: 'babel',
      sourcemap: false,
      singleQuote: true,
    });
  });

  it('should run prettier using config file from given current working directory', () => {
    const cwd = path.join(__dirname, 'fixtures');
    const parser = 'babel';
    const options = {
      parser,
      cwd,
    };

    spyOn(prettier, 'format').and.callThrough();

    const instance = rollupPluginPrettierLegacy(options);
    const code = 'var foo = 0;';
    const outputOptions = {};
    instance.transformBundle(code, outputOptions);

    expect(options).toEqual({
      parser,
      cwd,
    });

    expect(prettier.format).toHaveBeenCalledWith(code, {
      parser,
      singleQuote: true,
      tabWidth: 2,
    });
  });
});
