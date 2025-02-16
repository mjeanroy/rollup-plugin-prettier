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
import rollupPluginPrettier from '../src/index';
import { verifyWarnLogsBecauseOfSourcemap } from './utils/verify-warn-logs-because-of-source-map';
import { verifyWarnLogsNotTriggered } from './utils/verify-warn-logs-not-triggered';
import { installWarnSpy } from './utils/install-warn-spy';
import { joinLines } from './utils/join-lines';

describe('rollup-plugin-prettier', () => {
  beforeEach(() => {
    installWarnSpy();
  });

  it('should have a name', () => {
    const instance = rollupPluginPrettier();
    expect(instance.name).toBe('rollup-plugin-prettier');
  });

  it('should run prettier', () => {
    const instance = rollupPluginPrettier({
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    const chunk = { isEntry: false, imports: [] };
    const outputOptions = {};
    return instance.renderChunk(code, chunk, outputOptions).then((result) => {
      expect(console.warn).not.toHaveBeenCalled();
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

  it('should run prettier with sourcemap in output options', () => {
    const instance = rollupPluginPrettier({
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    const chunk = { isEntry: false, imports: [] };
    const outputOptions = { sourcemap: true };
    return instance.renderChunk(code, chunk, outputOptions).then((result) => {
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

  it('should run prettier with sourcemap in output options skipping warn message', () => {
    const instance = rollupPluginPrettier({
      sourcemap: 'silent',
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    const chunk = { isEntry: false, imports: [] };
    const outputOptions = { sourcemap: true };
    return instance.renderChunk(code, chunk, outputOptions).then((result) => {
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

  it('should run prettier with sourcemap (lowercase) in plugin options', () => {
    const instance = rollupPluginPrettier({
      sourcemap: true,
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    const chunk = { isEntry: false, imports: [] };
    const outputOptions = {};
    return instance.renderChunk(code, chunk, outputOptions).then((result) => {
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

  it('should run prettier with sourcemap disabled in output options', () => {
    const instance = rollupPluginPrettier({
      parser: 'babel',
    });

    const code = 'var foo=0;var test="hello world";';
    const chunk = { isEntry: false, imports: [] };
    const outputOptions = { sourcemap: false };
    return instance.renderChunk(code, chunk, outputOptions).then((result) => {
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

  it('should run prettier with options', () => {
    const options = {
      parser: 'babel',
      singleQuote: true,
    };

    const instance = rollupPluginPrettier(options);
    const code = 'var foo=0;var test="hello world";';
    const chunk = { isEntry: false, imports: [] };
    const outputOptions = { sourcemap: false };
    return instance.renderChunk(code, chunk, outputOptions).then((result) => {
      expect(result.code).toBe(
        joinLines([
          'var foo = 0;',
          "var test = 'hello world';",
          '',
        ]),
      );
    });
  });

  it('should remove unnecessary spaces', () => {
    const instance = rollupPluginPrettier({
      parser: 'babel',
    });

    const code = 'var foo    =    0;\nvar test = "hello world";';
    const chunk = { isEntry: false, imports: [] };
    const outputOptions = { sourcemap: false };
    return instance.renderChunk(code, chunk, outputOptions).then((result) => {
      expect(result.code).toBe(
        joinLines([
          'var foo = 0;',
          'var test = "hello world";',
          '',
        ]),
      );
    });
  });

  it('should add and remove characters', () => {
    const instance = rollupPluginPrettier({
      parser: 'babel',
    });

    const code = 'var foo    =    0;var test = "hello world";';
    const chunk = { isEntry: false, imports: [] };
    const outputOptions = { sourcemap: false };
    return instance.renderChunk(code, chunk, outputOptions).then((result) => {
      expect(result.code).toBe(
        joinLines([
          'var foo = 0;',
          'var test = "hello world";',
          '',
        ]),
      );
    });
  });

  it('should avoid side effect and do not modify plugin options', () => {
    const options = {
      parser: 'babel',
      sourcemap: false,
    };

    const instance = rollupPluginPrettier(options);
    const code = 'var foo = 0;';
    const chunk = { isEntry: false, imports: [] };
    const outputOptions = {};
    return instance.renderChunk(code, chunk, outputOptions).then(() => {
      // It should not have been touched.
      expect(options).toEqual({
        parser: 'babel',
        sourcemap: false,
      });
    });
  });

  it('should run prettier without sourcemap options', () => {
    const options = {
      parser: 'babel',
      sourcemap: false,
    };

    const code = 'var foo = 0;';
    const instance = rollupPluginPrettier(options);
    const chunk = { isEntry: false, imports: [] };
    const outputOptions = {};

    return instance.renderChunk(code, chunk, outputOptions).then((result) => {
      expect(result.map).toBeUndefined();
      expect(options).toEqual({
        parser: 'babel',
        sourcemap: false,
      });
    });
  });

  it('should run prettier without sourcemap options and custom other options', () => {
    const options = {
      parser: 'babel',
      sourcemap: false,
      singleQuote: true,
    };

    const code = joinLines([
      'var name = "John Doe";',
    ]);

    const instance = rollupPluginPrettier(options);
    const chunk = { isEntry: false, imports: [] };
    const outputOptions = {};
    return instance.renderChunk(code, chunk, outputOptions).then((result) => {
      expect(result.code).toEqual(joinLines([
        'var name = \'John Doe\';',
        '',
      ]));

      expect(options).toEqual({
        parser: 'babel',
        sourcemap: false,
        singleQuote: true,
      });
    });
  });

  it('should run prettier using config file from given current working directory', () => {
    const cwd = path.join(__dirname, 'fixtures');
    const parser = 'babel';
    const options = {
      parser,
      cwd,
    };

    const instance = rollupPluginPrettier(options);
    const code = joinLines([
      'var name = "John Doe";',
      'if (true) {',
      '    console.log(name);',
      '}',
    ]);

    const chunk = { isEntry: false, imports: [] };
    const outputOptions = {};
    return instance.renderChunk(code, chunk, outputOptions).then((result) => {
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
