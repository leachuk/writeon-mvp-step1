'use strict';

var jwt = require('jsonwebtoken');
var _ = require('lodash');

var acl = require('acl');
acl = new acl(new acl.memoryBackend()); //TODO: Update to Redis backend

function AuthService(){};

AuthService.prototype.decodetoken = function(secret, token, callback) {
  console.log("in AuthService.decodetoken");
  var token = token;
  var decoded = jwt.decode(token, secret);

  callback(decoded);
};

AuthService.prototype.initAuthorization = function() {
	acl.addUserRoles('testuser', 'guest')
	acl.allow('guest', 'articles', ['edit','view']);
};

AuthService.prototype.acl = function() {
	return acl;
};

exports.AuthService = new AuthService;