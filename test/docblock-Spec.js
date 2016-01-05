/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
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
 *
 * @file 解析注释头部信息功能
 * @author AceMood
 * @email zmike86@gmail.com
 */

describe('docblock', function() {

  var expect = require('chai').expect;
  var os = require('os');
  var docblock = require('../lib/parser/docblock');

  it('should extract valid docblock', function() {
    var code = '/**' + os.EOL + ' * @providesModule foo' + os.EOL + '*/'
      + os.EOL + 'var x = foo;';
    expect(docblock.extract(code)).to.be.a('string');
    expect(docblock.extract(code)).to.equal('/**' + os.EOL + ' * @providesModule foo' + os.EOL + '*/');
  });

  it('should extract valid docblock with more comments', function() {
    var code = '/**' + os.EOL + ' * @providesModule foo' + os.EOL + '*/'
      + os.EOL + 'var x = foo;' + os.EOL + '/**foo*/';
    expect(docblock.extract(code)).to.be.a('string');
    expect(docblock.extract(code)).to.equal('/**' + os.EOL + ' * @providesModule foo' + os.EOL + '*/');
  });

  it('should return nothing for no docblock', function() {
    var code = '/*' + os.EOL + ' * @providesModule foo' + os.EOL + '*/'
      + os.EOL + 'var x = foo;' + os.EOL + '/**foo*/';
    expect(docblock.extract(code)).to.be.a('string');
    expect(docblock.extract(code)).to.equal('');
  });

  it('should return extract and parsedocblock', function() {
    var code =
      '/** @provides intern-fbtrace-css */' + os.EOL + '' +
      '' + os.EOL + '' +
      '.dummy {}' + os.EOL + '';

    expect(docblock.parse(docblock.extract(code))).instanceof(Array);
    expect(docblock.parse(docblock.extract(code))).to.have.length(1);
    expect(docblock.parse(docblock.extract(code))).to.deep.equal([
      ['provides', 'intern-fbtrace-css']
    ]);
  });

  it('should parse directives out of a docblock', function() {
    var code =
      '/**' + os.EOL + '' +
      ' * @requires foo' + os.EOL + '' +
      ' * @css a b' + os.EOL + '' +
      ' * @preserve-whitespace' + os.EOL + '' +
      ' */';
    expect(docblock.parse(code)).instanceof(Array);
    expect(docblock.parse(code)).to.have.length(3);
    expect(docblock.parse(code)).to.deep.equal([
      ['requires', 'foo'],
      ['css', 'a b'],
      ['preserve-whitespace', '']
    ]);
  });

  it('should parse directives out of a docblock with comments', function() {
    var code =
      '/**' + os.EOL + '' +
      ' * Copyright 2004-present Facebook. All Rights Reserved.'+os.EOL+'' +
      ' * @provides foo' + os.EOL + '' +
      ' * @css a b' + os.EOL + '' +
      ' *' + os.EOL + '' +
      ' * And some license here' + os.EOL + '' +
      ' * @preserve-whitespace' + os.EOL + '' +
      ' */';
    expect(docblock.parse(code)).instanceof(Array);
    expect(docblock.parse(code)).to.have.length(3);
    expect(docblock.parse(code)).to.deep.equal([
      ['provides', 'foo'],
      ['css', 'a b'],
      ['preserve-whitespace', '']
    ]);
  });

  it('should parse multiline directives', function() {
    var code =
      '/**' + os.EOL + '' +
      ' * Copyright 2004-present Facebook. All Rights Reserved.' + os.EOL + '' +
      ' * @class A long declaration of a class' + os.EOL + '' +
      ' *        goes here, so we can read it and enjoy' + os.EOL + '' +
      ' *' + os.EOL + '' +
      ' * And some license here' + os.EOL + '' +
      ' * @preserve-whitespace' + os.EOL + '' +
      ' */';

    expect(docblock.parse(code)).instanceof(Array);
    expect(docblock.parse(code)).to.have.length(2);
    expect(docblock.parse(code)).to.deep.equal([
      ['class', 'A long declaration of a class goes here, ' +
      'so we can read it and enjoy'],
      ['preserve-whitespace', '']
    ]);
  });

});
