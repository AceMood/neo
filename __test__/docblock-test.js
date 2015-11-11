/**
 * @file 解析注释头部信息功能
 */

describe('docblock', function() {

  var os = require('os');
  var docblock = require('../lib/parser/docblock');

  it('should extract valid docblock', function() {
    var code = '/**'+os.EOL+' * @providesModule foo'+os.EOL+'*/'+os.EOL+'var x = foo;';
    expect(docblock.extract(code)).toBe('/**'+os.EOL+' * @providesModule foo'+os.EOL+'*/');
  });

  it('should extract valid docblock with more comments', function() {
    var code = '/**'+os.EOL+' * @providesModule foo'+os.EOL+'*/'+os.EOL+'var x = foo;'+os.EOL+'/**foo*/';
    expect(docblock.extract(code)).toBe('/**'+os.EOL+' * @providesModule foo'+os.EOL+'*/');
  });

  it('should return nothing for no docblock', function() {
    var code = '/*'+os.EOL+' * @providesModule foo'+os.EOL+'*/'+os.EOL+'var x = foo;'+os.EOL+'/**foo*/';
    expect(docblock.extract(code)).toBe('');
  });

  it('should return extract and parsedocblock', function() {
    var code =
      '/** @provides intern-fbtrace-css */'+os.EOL+'' +
      ''+os.EOL+'' +
      '.dummy {}'+os.EOL+'';

    expect(docblock.parse(docblock.extract(code))).toEqual([
      ['provides', 'intern-fbtrace-css']
    ]);
  });

  it('should parse directives out of a docblock', function() {
    var code =
      '/**'+os.EOL+'' +
      ' * @providesModule foo'+os.EOL+'' +
      ' * @css a b'+os.EOL+'' +
      ' * @preserve-whitespace'+os.EOL+'' +
      ' */';
    expect(docblock.parse(code)).toEqual([
      ['providesModule', 'foo'],
      ['css', 'a b'],
      ['preserve-whitespace', '']
    ]);
  });

  it('should parse directives out of a docblock with comments', function() {
    var code =
      '/**'+os.EOL+'' +
      ' * Copyright 2004-present Facebook. All Rights Reserved.'+os.EOL+'' +
      ' * @providesModule foo'+os.EOL+'' +
      ' * @css a b'+os.EOL+'' +
      ' *'+os.EOL+'' +
      ' * And some license here'+os.EOL+'' +
      ' * @preserve-whitespace'+os.EOL+'' +
      ' */';
    expect(docblock.parse(code)).toEqual([
      ['providesModule', 'foo'],
      ['css', 'a b'],
      ['preserve-whitespace', '']
    ]);
  });

  it('should parse multiline directives', function() {
    var code =
      '/**'+os.EOL+'' +
      ' * Copyright 2004-present Facebook. All Rights Reserved.'+os.EOL+'' +
      ' * @class A long declaration of a class'+os.EOL+'' +
      ' *        goes here, so we can read it and enjoy'+os.EOL+'' +
      ' *'+os.EOL+'' +
      ' * And some license here'+os.EOL+'' +
      ' * @preserve-whitespace'+os.EOL+'' +
      ' */';
    expect(docblock.parse(code)).toEqual([
      ['class', 'A long declaration of a class goes here, ' +
        'so we can read it and enjoy'],
      ['preserve-whitespace', '']
    ]);
  });
});
