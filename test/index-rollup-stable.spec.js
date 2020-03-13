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

'use strict';

const path = require('path');
const prettier = require('prettier');
const verifyWarnLogsBecauseOfSourcemap = require('./utils/verify-warn-logs-because-of-source-map.js');
const verifyWarnLogsNotTriggered = require('./utils/verify-warn-logs-not-triggered.js');
const installWarnSpy = require('./utils/install-warn-spy.js');
const plugin = require('../dist/index-rollup-stable.js');

describe('rollup-plugin-prettier [stable]', () => {
  beforeEach(() => {
    installWarnSpy();
  });

  it('should have a name', () => {
    const instance = plugin();
    expect(instance.name).toBe('rollup-plugin-prettier');
  });

  it('should run prettier', () => {
    const instance = plugin({
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {};
    const result = instance.renderChunk(code, chunk, outputOptions);

    expect(console.warn).not.toHaveBeenCalled();
    expect(result.map).not.toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap in output options', () => {
    const instance = plugin({
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {sourcemap: true};
    const result = instance.renderChunk(code, chunk, outputOptions);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap (lowercase) in plugin options', () => {
    const instance = plugin({
      sourcemap: true,
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {};
    const result = instance.renderChunk(code, chunk, outputOptions);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap (camelcase) in plugin options', () => {
    const instance = plugin({
      sourceMap: true,
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {};
    const result = instance.renderChunk(code, chunk, outputOptions);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap disabled in output options', () => {
    const instance = plugin({
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {sourcemap: false};
    const result = instance.renderChunk(code, chunk, outputOptions);

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

    const instance = plugin(options);
    const code = 'var foo=0;var test="hello world";';
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {sourcemap: false};
    const result = instance.renderChunk(code, chunk, outputOptions);

    expect(result.code).toBe(
        `var foo = 0;\n` +
        `var test = 'hello world';\n`
    );
  });

  it('should remove unnecessary spaces', () => {
    const instance = plugin({
      parser: 'babel',
    });

    const code = 'var foo    =    0;\nvar test = "hello world";';
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {sourcemap: false};
    const result = instance.renderChunk(code, chunk, outputOptions);

    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should add and remove characters', () => {
    const instance = plugin({
      parser: 'babel',
    });

    const code = 'var foo    =    0;var test = "hello world";';
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {sourcemap: false};
    const result = instance.renderChunk(code, chunk, outputOptions);

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

    const instance = plugin(options);
    const code = 'var foo = 0;';
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {};
    instance.renderChunk(code, chunk, outputOptions);

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
    const instance = plugin(options);
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {};
    instance.renderChunk(code, chunk, outputOptions);

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
    const instance = plugin(options);
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {};
    instance.renderChunk(code, chunk, outputOptions);

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

    const instance = plugin(options);
    const code = 'var foo = 0;';
    const chunk = {isEntry: false, imports: []};
    const outputOptions = {};
    instance.renderChunk(code, chunk, outputOptions);

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
