/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file RegExp objects
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

exports.blockCommentRe = blockCommentRe;
exports.lineCommentRe = lineCommentRe;

exports.inlineRe = inlineRe;
exports.uriRe = uriRe;

exports.requireRe = requireRe;
exports.requireAsyncRe = requireAsyncRe;