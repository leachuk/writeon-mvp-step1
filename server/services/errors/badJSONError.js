'use strict';

var util = require('util');

module.exports = function BadJSONError(message, stacktrace) {
  this.name = this.constructor.name;
  this.message = typeof stacktrace !== "undefined" ? message + "\n" + stacktrace : message;
};

util.inherits(module.exports, Error);
