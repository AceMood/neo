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
 * @file 获取不同格式图片的size
 * todo 读buffer数据更改了图像的数据
 */

'use strict';

/**
 * 读取gif图片高宽
 * @param {Buffer} buffer
 * @returns {{width: *, height: *}}
 */
function gif(buffer) {
  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8)
  };
}

/**
 * 读取png图片高宽
 * @param {Buffer} buffer
 * @returns {{width: *, height: *}}
 */
function png(buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

/**
 * 读取jpeg图片高宽
 * @param {Buffer} buffer
 * @returns {*}
 */
function jpeg(buffer) {
  var len = buffer.length;
  var offset = 2;
  while (offset < len) {
    var marker = buffer.readUInt16BE(offset);
    offset += 2;
    if (marker === 0xFFC0 || marker === 0xFFC2) {
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3)
      };
    } else {
      offset += buffer.readUInt16BE(offset);
    }
  }
  return null;
}

/**
 * 读取图片尺寸
 * @param {Buffer} buffer
 * @returns {*}
 */
function getImageSize(buffer) {
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return jpeg(buffer);
  } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return gif(buffer);
  } else if (buffer[0] === 0x89 && buffer[1] === 0x50
      && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return png(buffer);
  } else {
    return null;
  }
}

getImageSize.gif = gif;
getImageSize.png = png;
getImageSize.jpeg = jpeg;

module.exports = getImageSize;