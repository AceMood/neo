/**
 * @file 取得图像大小功能
 * @todo 计算后会改变图像buffer
 * @Stability: 2 - Stable
 */

describe("getImageSize", function() {

  var path = require('path');
  var fs = require('fs');
  var root = path.join(__dirname, '..', '__test_data__', 'Image');
  var getImageSize = require('../lib/parser/getImageSize');

  it('should parse gif image size', function() {
    var buffer = fs.readFileSync(path.join(root, '200x100.gif'));
    var size = getImageSize(buffer);
    expect(size.width).toBe(200);
    expect(size.height).toBe(100);
  });

  it('should parse png image size', function() {
    var buffer = fs.readFileSync(path.join(root, '200x100.png'));
    var size = getImageSize(buffer);
    expect(size.width).toBe(200);
    expect(size.height).toBe(100);
  });

  it('should parse jpeg image size', function() {
    var buffer = fs.readFileSync(path.join(root, '200x100.jpg'));
    var size = getImageSize(buffer);
    expect(size.width).toBe(200);
    expect(size.height).toBe(100);
  });

  it('should parse more photo data jpeg image size', function() {
    var buffer = fs.readFileSync(path.join(root, 'a.jpg'));
    var size = getImageSize(buffer);
    expect(size.width).toBe(900);
    expect(size.height).toBe(596);
  });

});
