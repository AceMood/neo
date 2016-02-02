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
 * @file 解析用到的一些正则
 * @author AceMood
 */

'use strict';

// 注释
const blockCommentRe = /\/\*(.|\n)*?\*\//g;
const lineCommentRe = /\/\/.+(\n|$)/g;

// JavaScript源码中一些内置功能的正则，比如：
//       var content = __inline('./dialog.css'); // 可以得到资源的content内容
//       var url = __uri('./icon.png'); // 可以得到资源的线上路径
const inlineRe = /\b__inline\s*\(\s*['"]([^"']+)["']\s*\)/g;
const uriRe = /\b__uri\s*\(\s*\[([^\]]+)]/g;

// 匹配JavaScript源码中的require和require.async调用
const requireRe = /\brequire\s*\(\s*['"]([^"']+)["']\s*\)/g;
const requireAsyncRe = /\brequire.async\s*\(\s*\[([^\]]+)]/g;

// url中用到的一些
const cssUrlRe = /\burl\((?:(?:"|')?)(?:\s*)([^\)"']*)(?:\s*)(?:(?:"|')?)\)(?:\s*)/g;
const querystringRe = /\?([^#]*)/g;
const hashRe = /#(.*)$/g;


exports.blockCommentRe = blockCommentRe;
exports.lineCommentRe = lineCommentRe;

exports.inlineRe = inlineRe;
exports.uriRe = uriRe;

exports.requireRe = requireRe;
exports.requireAsyncRe = requireAsyncRe;

exports.cssUrlRe = cssUrlRe;
exports.querystringRe = querystringRe;
exports.hashRe = hashRe;