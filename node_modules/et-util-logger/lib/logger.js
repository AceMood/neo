/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Saber-Team
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
 */

'use strict';

let color = require('./color').color;
let Level = require('./level');

class Logger {
  constructor(level) {
    this.level = (level ? level : Level.ALL);
    this.enabled = (this.level < Level.OFF);
  }

  /**
   * Logs a message at the Level.ERROR level.
   * @param {...string} var_msg 消息.
   * @return {boolean}
   */
  error(var_msg) {
    if (this.enabled && this.level <= Level.ERROR) {
      var msg = Array.prototype.join.call(arguments, '');
      msg = String(msg);
      console.log(color('magenta', '[Error] ') + color('red', msg));
      return true;
    }
    return false;
  }

  /**
   * Logs a message at the Level.WARNING level.
   * @param {...string} var_msg 消息.
   * @return {boolean}
   */
  warn(var_msg) {
    if (this.enabled && this.level <= Level.WARNING) {
      var msg = Array.prototype.join.call(arguments, '');
      msg = String(msg);
      console.log(color('magenta', '[Warning] ') + color('yellow', msg));
      return true;
    }
    return false;
  }

  /**
   * Logs a message at the Level.INFO level.
   * @param {...string} var_msg 消息.
   * @return {boolean}
   */
  info(var_msg) {
    if (this.enabled && this.level <= Level.INFO) {
      var msg = Array.prototype.join.call(arguments, '');
      msg = String(msg);
      console.log(color('magenta', '[Info] ') + color('cyan', msg));
      return true;
    }
    return false;
  }

  /**
   * Logs a message at the Level.Fine level.
   * @param {...string} var_msg 消息.
   * @return {boolean}
   */
  fine(var_msg) {
    if (this.enabled && this.level <= Level.FINE) {
      var msg = Array.prototype.join.call(arguments, '');
      msg = String(msg);
      console.log(color('magenta', '[OK] ') + color('green', msg));
      return true;
    }
    return false;
  }

  setLevel(level) {
    this.level = level;
  }

  getLevel() {
    return this.level;
  }
}

module.exports = Logger;