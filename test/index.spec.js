/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017-2018 Mickael Jeanroy
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
const plugin = require('../dist/index.js');

describe('rollup-plugin-prettier', () => {
  beforeEach(() => {
    spyOn(console, 'log').and.callThrough();
  });

  it('should have a name', () => {
    const instance = plugin();
    expect(instance.name).toBe('rollup-plugin-prettier');
  });

  it('should run prettier', () => {
    const instance = plugin({
      parser: 'babylon',
    });

    const code = 'var foo=0;var test="hello world";';
    const result = instance.renderChunk(code);

    expect(console.log).not.toHaveBeenCalled();
    expect(result.map).not.toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourceMap (camelcase with rollup < 0.48)', () => {
    const instance = plugin({
      parser: 'babylon',
    });

    instance.options({
      sourceMap: true,
    });

    console.log.and.stub();

    const code = 'var foo=0;var test="hello world";';
    const result = instance.renderChunk(code);

    expect(console.log).toHaveBeenCalledWith(
        '[rollup-plugin-prettier] Sourcemap is enabled, computing diff is required'
    );

    expect(console.log).toHaveBeenCalledWith(
        '[rollup-plugin-prettier] This may take a moment (depends on the size of your bundle)'
    );

    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap (lowercase with rollup >= 0.48)', () => {
    const instance = plugin({
      parser: 'babylon',
    });

    instance.options({
      sourcemap: true,
    });

    console.log.and.stub();

    const code = 'var foo=0;var test="hello world";';
    const result = instance.renderChunk(code);

    expect(console.log).toHaveBeenCalledWith(
        '[rollup-plugin-prettier] Sourcemap is enabled, computing diff is required'
    );

    expect(console.log).toHaveBeenCalledWith(
        '[rollup-plugin-prettier] This may take a moment (depends on the size of your bundle)'
    );

    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap in output options', () => {
    const instance = plugin({
      parser: 'babylon',
    });

    // The input options may not contain `sourcemap` entry with rollup >= 0.53.
    instance.options({});

    console.log.and.stub();

    const code = 'var foo=0;var test="hello world";';
    const result = instance.renderChunk(code, null, {
      sourcemap: true,
    });

    expect(console.log).toHaveBeenCalledWith(
        '[rollup-plugin-prettier] Sourcemap is enabled, computing diff is required'
    );

    expect(console.log).toHaveBeenCalledWith(
        '[rollup-plugin-prettier] This may take a moment (depends on the size of your bundle)'
    );

    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap in output options (camelcase format)', () => {
    const instance = plugin({
      parser: 'babylon',
    });

    // The input options may not contain `sourcemap` entry with rollup >= 0.53.
    instance.options({});

    console.log.and.stub();

    const code = 'var foo=0;var test="hello world";';
    const result = instance.renderChunk(code, null, {
      sourceMap: true,
    });

    expect(console.log).toHaveBeenCalledWith(
        '[rollup-plugin-prettier] Sourcemap is enabled, computing diff is required'
    );

    expect(console.log).toHaveBeenCalledWith(
        '[rollup-plugin-prettier] This may take a moment (depends on the size of your bundle)'
    );

    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap disabled in output options', () => {
    const instance = plugin({
      parser: 'babylon',
    });

    // The input options may not contain `sourcemap` entry with rollup >= 0.53.
    instance.options({});

    console.log.and.stub();

    const code = 'var foo=0;var test="hello world";';
    const result = instance.renderChunk(code, null, {
      sourcemap: false,
    });

    expect(console.log).not.toHaveBeenCalled();
    expect(result.map).not.toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with options', () => {
    const options = {
      parser: 'babylon',
      singleQuote: true,
    };

    const instance = plugin(options);

    instance.options({
      sourceMap: false,
    });

    const code = 'var foo=0;var test="hello world";';
    const result = instance.renderChunk(code);

    expect(result.code).toBe(
        `var foo = 0;\n` +
        `var test = 'hello world';\n`
    );
  });

  it('should remove unnecessary spaces', () => {
    const instance = plugin({
      parser: 'babylon',
    });

    instance.options({
      sourceMap: false,
    });

    const code = 'var foo    =    0;\nvar test = "hello world";';
    const result = instance.renderChunk(code);

    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should add and remove characters', () => {
    const instance = plugin({
      parser: 'babylon',
    });

    instance.options({
      sourceMap: false,
    });

    const code = 'var foo    =    0;var test = "hello world";';
    const result = instance.renderChunk(code);

    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should avoid side effect and do not modify plugin options', () => {
    const options = {
      parser: 'babylon',
      sourceMap: false,
    };

    const instance = plugin(options);
    instance.options({});
    instance.renderChunk('var foo = 0;');

    // It should not have been touched.
    expect(options).toEqual({
      parser: 'babylon',
      sourceMap: false,
    });
  });

  it('should run prettier without sourcemap options', () => {
    const options = {
      parser: 'babylon',
      sourceMap: false,
    };

    spyOn(prettier, 'format').and.callThrough();

    const code = 'var foo = 0;';
    const instance = plugin(options);
    instance.options({});
    instance.renderChunk(code);

    expect(prettier.format).toHaveBeenCalledWith(code, {
      parser: 'babylon',
    });

    expect(options).toEqual({
      parser: 'babylon',
      sourceMap: false,
    });
  });

  it('should run prettier without sourcemap options and custom other options', () => {
    const options = {
      parser: 'babylon',
      sourceMap: false,
      singleQuote: true,
    };

    spyOn(prettier, 'format').and.callThrough();

    const code = 'var foo = 0;';
    const instance = plugin(options);
    instance.options({});
    instance.renderChunk(code);

    expect(prettier.format).toHaveBeenCalledWith(code, {
      parser: 'babylon',
      singleQuote: true,
    });

    expect(options).toEqual({
      parser: 'babylon',
      sourceMap: false,
      singleQuote: true,
    });
  });

  it('should run prettier using config file from given current working directory', () => {
    const cwd = path.join(__dirname, 'fixtures');
    const options = {cwd};

    spyOn(prettier, 'format').and.callThrough();

    const code = 'var foo = 0;';
    const instance = plugin(options);
    instance.renderChunk(code);

    expect(options).toEqual({cwd});
    expect(prettier.format).toHaveBeenCalledWith(code, {
      parser: 'babylon',
      singleQuote: true,
      tabWidth: 2,
    });
  });
});
