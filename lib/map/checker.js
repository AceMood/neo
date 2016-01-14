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
 * @file 用于检查有向图循环依赖
 * @author AceMood
 * @email zmike86@gmail.com
 */


'use strict';

let currentTracking = {};

let pick = function(stack) {
  var el = stack[stack.length - 1];
  while ((stack[0] !== el) && stack.length > 1) {
    stack.shift();
  }

  return stack;
};

/**
 * @param {object} map 资源表图
 * @param {string} vertex 开始遍历的节点
 * @param {object} visited 是否遍历过
 * @param {Array} stack 用于跟踪遍历图的路径轨迹
 * @return {boolean}
 */
const checkCircle = function(map, vertex, visited, stack) {
  // 已遍历过以vertex为顶点的子图没有循环依赖
  if (visited[vertex] === true) {
    return true;
  }

  // 记录正在遍历的路径中
  visited[vertex] = currentTracking;
  // 记录当前顶点的路径
  stack.push(vertex);

  // loop recursion FIRST
  if (!map[vertex]) {
    console.log(vertex);
  }
  for (let i = 0; i < map[vertex].length; ++i) {
    if (inCircular(map[vertex][i], visited, stack)) {
      pick(stack);
      return false;
    } else if (!checkCircle(map, map[vertex][i], visited, stack)) {
      return false;
    }
  }

  // maintain the track stack
  stack.pop();
  visited[vertex] = true;

  return true;
};


/**
 * 判断是否存在回路
 * @param {string} vertex 遍历的当前节点
 * @param {object} visited 是否遍历过
 * @param {Array} stack 图的当前遍历轨迹
 * @returns {boolean} 是否回路
 */
const inCircular = function(vertex, visited, stack) {
  if (visited[vertex] === currentTracking) {
    stack.push(vertex);
    return true;
  }
  return false;
};


exports.checkCircle = checkCircle;