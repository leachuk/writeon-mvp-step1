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

AuthService.prototype.fulldecodetoken = function(req, res, callback) {
  console.log("in decodefulltoken");
  var err = null;
  var result = null;
  var token = null;
  var parts = req.headers.authorization.split(' ');
 
  if (parts.length == 2) {
    var scheme = parts[0];
    var credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
        token = credentials;
        result = jwt.decode(token, req.secret);
  		callback(err,result);  
    } else {
      console.log("Invalid Authorization Header. Format is Authorization: Bearer [token]");
      err = new Error('Invalid Authorization Header. Format is Authorization: Bearer [token]');
      callback(err,result);
    }
  } else {
    console.log("Format is Authorization: Bearer [token]");
    err = new UnauthorizedError('credentials_bad_format', {
      message : 'Format is Authorization: Bearer [token]'
    });
    callback(err,result);
  }
};

AuthService.prototype.initAuthorization = function() {
	//acl.addUserRoles('testuser', 'guest')
	//acl.allow('guest', 'articles', ['edit','view']);

	//create roles
	//TODO refactor this into a proper model/schema with jugglingDb
	acl.allow('article-editor','getarticle',['edit', 'view', 'delete']);
	acl.allow('article-viewer','getarticle',['view']);

	//assign users to roles
	acl.addUserRoles('writeonmvpstep1-1@test.com', 'article-editor');
	acl.addUserRoles('writeonmvpstep1-3@test.com', 'article-viewer');
};

AuthService.prototype.acl = function() {
	return acl;
};

exports.AuthService = new AuthService;