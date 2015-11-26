/**
 * @file 封装错误消息
 */

'use strict';

var inhertis = require('util').inherits;
var cli = require('./CLI');

/**
 * 消息基类, 渲染不同字体
 * @constructor
 * @param {String} file 发生错误的文件路径
 * @param {String} type project related type, like sprites or haste map
 * @param {String} text 消息
 */
function Message(file, type, text) {
  this.file = file;
  this.type = type;
  this.text = text;
}

/**
 * @return {String}
 */
Message.prototype.render = function() {
  return this.text.replace(/\n/g, ' ');
};

/**
 * 有警告不太好 但意味着可以继续
 * @constructor
 * @extends {Message}
 */
function Warning(file, type, text) {
  Message.call(this, file, type, text);
}
inhertis(Warning, Message);

Warning.prototype.render = function() {
  return cli.bold('Warning') + ': [' + this.type + '] ' +
      Message.prototype.render.call(this);
};

/**
 * 这个类意味着我们应该修复但网站仍然会加载
 * @constructor
 * @extends {Message}
 */
function Error(file, type, text) {
  Message.call(this, file, type, text);
}
inhertis(Error, Message);

Error.prototype.render = function() {
  return cli.awesome('Error') + ': [' + this.type + '] ' +
      Message.prototype.render.call(this);
};

/**
 * 所有事情都不能工作必须马上修复
 * @constructor
 * @extends {Message}
 */
function ClowntownError(file, type, text) {
  Message.call(this, file, type, text);
}
inhertis(ClowntownError, Message);

var clowntown;
ClowntownError.prototype.render = function() {
  clowntown = clowntown || cli.bold(
          cli.color('yellow', 'C') +
          cli.color('magenta', 'L') +
          cli.color('cyan', 'O') +
          cli.color('yellow', 'W') +
          cli.color('magenta', 'N') +
          cli.color('cyan', 'T') +
          cli.color('yellow', 'O') +
          cli.color('magenta', 'W') +
          cli.color('cyan', 'N')
      );
  return clowntown + ' ' + cli.awesome('Error') + ': [' + this.type + '] ' +
      Message.prototype.render.call(this);
};


/**
 * @class  A list of messages obviously. Can be merged into the other list
 * Uses a pool of objects so that we can reuse existing message lists when
 * parsing stuff instead of creating tons of them over and over again.
 */
function MessageList() {
  this.messages = [];
  this.length = 0;
}

MessageList._cache = [];

MessageList.create = function() {
  if (this._cache.length) {
    return this._cache.pop();
  }
  return new MessageList();
};

MessageList.clearCache = function() {
  this._cache.length = 0;
};

/**
 * 合并另一个消息列表. You should consider recycling the merged
 * MessageList with .recycle() so it can be reused later on
 * @param  {MessageList} list
 * @return {MessageList} this
 */
MessageList.prototype.merge = function(list) {
  list.messages.forEach(this.add, this);
  return this;
};

MessageList.prototype.mergeAndRecycle = function(list) {
  this.merge(list);
  list.recycle();
  return this;
};

MessageList.prototype.render = function() {
  var fileMap = {};
  var groups = [];
  this.messages.forEach(function(message) {
    if (!fileMap[message.file]) {
      groups.push(fileMap[message.file] = []);
    }
    fileMap[message.file].push(message);
  });

  var result = '';
  groups.forEach(function(group) {
    result += '  ' + cli.bold('File:') + ' ' + group[0].file + '. ';
    if (group.length === 1) {
      result += group[0].render() + '\n';
    } else {
      result += cli.bold('Messages') + ':\n';
      group.forEach(function(message) {
        result += '        ' + message.render() + '\n';
      });
    }
  });

  return result;
};

/**
 * 写消息
 * @param {Message} message
 * @returns {MessageList}
 */
MessageList.prototype.add = function(message) {
  this.messages.push(message);
  this.length = this.messages.length;
  return this;
};

MessageList.prototype.addMessage = function(file, type, text) {
  return this.add(new Message(file, type, text));
};

MessageList.prototype.addWarning = function(file, type, text) {
  return this.add(new Warning(file, type, text));
};

MessageList.prototype.addError = function(file, type, text) {
  return this.add(new Error(file, type, text));
};

MessageList.prototype.addClowntownError = function(file, type, text) {
  return this.add(new ClowntownError(file, type, text));
};

MessageList.prototype.recycle = function(first_argument) {
  this.messages.length = 0;
  this.length = 0;
  MessageList._cache.push(this);
  return this;
};

/**
 * Next 2 methods are ugly (voloko). But it's the minimal thing that works.
 * So let them live.
 */
MessageList.prototype.toObject = function() {
  return this.messages.map(function(m) {
    var type = m instanceof Warning ? 'Warning' :
        m instanceof Error ? 'Error' :
            m instanceof ClowntownError ? 'ClowntownError':
                'Message';
    return [type, [m.file, m.type, m.text]];
  });
};

MessageList.fromObject = function(object) {
  var list = MessageList.create();
  object.forEach(function(m) {
    var f = m[0] === 'Warning' ? list.addWarning :
        m[0] === 'Error' ? list.addError :
            m[0] === 'ClowntownError' ? list.addClowntownError :
                list.addMessage;
    f.apply(list, m[1]);
  });
  return list;
};

module.exports = MessageList;