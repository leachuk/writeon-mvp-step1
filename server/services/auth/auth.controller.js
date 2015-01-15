'use strict';

var jwt = require('jsonwebtoken');
var _ = require('lodash');

function AuthService(){};

AuthService.prototype.decodetoken = function(secret, token, callback) {
  console.log("in AuthService.decodetoken");
  var token = token;
  var decoded = jwt.decode(token, secret);

  callback(decoded);
};

exports.AuthService = new AuthService;