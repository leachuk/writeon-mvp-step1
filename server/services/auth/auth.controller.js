'use strict';

require('rootpath')();
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var _utils = require('server/services/utils/utils.controller').Utils;

var acl = require('acl');
acl = new acl(new acl.memoryBackend()); //TODO: Update to Redis backend

//private
function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

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
	acl.allow('article-editor',['getarticle', 'listmyarticles', 'savearticle', 'article'],['edit', 'view', 'delete']);
	acl.allow('article-viewer',['getarticle', 'listmyarticles', 'article'],['view']);

	//assign users to roles
	acl.addUserRoles('writeonmvpstep1-1@test.com', 'article-editor');
	acl.addUserRoles('writeonmvpstep1-2@test.com', 'article-viewer');
	acl.addUserRoles('writeonmvpstep1-3@test.com', 'article-viewer');
};

AuthService.prototype.initUserAuthorization = function() {
  //acl.addUserRoles('testuser', 'guest')
  //acl.allow('guest', 'articles', ['edit','view']);

  //create roles
  //.allow(<role>,[<endpoint path>,...],[<rights(edit/view/delete)>,...])
  //TODO refactor this into a proper model/schema with jugglingDb
  acl.allow('recruiter',['getuser'],['view']);
  //acl.allow('article-viewer',['getarticle', 'listmyarticles', 'article'],['view']);

  //assign users to roles
  acl.addUserRoles('recruiter1@gmail.com', 'recruiter');
};

AuthService.prototype.checkUserIsAuthorisedUrl = function(){
	var self = this;
	var middleware = false;
	return function(req, res, next){
        // check if this is a middleware call
        if(next){
            // only middleware calls would have the "next" argument
            middleware = true;
        }

		var username = null;
		var reqUriPath = _utils.parseUri(req.url).path;
		var reqParts = reqUriPath.split("/").map(function(n){return n.toLowerCase();});

		self.fulldecodetoken(req, res, function(err, result){
			if(result){
				console.log("fulldecodetoken result");
				console.log(result);
				username = result.username;
			} else {
				console.log("fulldecodetoken error");
				console.log(err);
			}
		});

		acl.isAllowed(username, reqParts[1], ['view'], function(err, res){
		    if(res){
		        console.log("User member is allowed to view articles");
		        console.log(res);
		        next();
		    } else {
		    	console.log("error");
		    	console.log(err);
		    	var error = new Error("Authorisation denied. Insufficient access privelages");
		    	next(error);
		    }
		});
	}
};

AuthService.prototype.checkUserIsAuthorisedModel = function(){
	var self = this;
	var middleware = false;
	return function(req, res, next){
        // check if this is a middleware call
        if(next){
            // only middleware calls would have the "next" argument
            middleware = true;
        }
		var username = null;
		var reqModel = req.result.model.toLowerCase();
		self.fulldecodetoken(req, res, function(err, result){
			if(result){
				console.log("fulldecodetoken result");
				console.log(result);
				username = result.username;
			} else {
				console.log("fulldecodetoken error");
				console.log(err);
			}
		});

		acl.isAllowed(username, reqModel, ['view'], function(err, result){
		    if(result){
		        console.log("User member is allowed to view articles");
		        console.log(result);
		        //next();
		        res.send(req.result);
		    } else {
		    	console.log("error");
		    	console.log(err);
		    	var error = new Error("Authorisation denied. Insufficient access privelages");
		    	//next(error);
		    	res.status(403).send(error);
		    }
		});
	}
};

AuthService.prototype.acl = function() {
	return acl;
};

exports.AuthService = new AuthService;
