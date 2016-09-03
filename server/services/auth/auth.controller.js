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

//deprecated
// AuthService.prototype.initAuthorization = function() {
// 	//acl.addUserRoles('testuser', 'guest')
// 	//acl.allow('guest', 'articles', ['edit','view']);
//
// 	//create roles
// 	//TODO refactor this into a proper model/schema with jugglingDb
//   //format is acl.allow('<role>,['<lowercase url endpoint>' OR '<lowercase modelname from model schema>']')
// 	acl.allow('article-editor',['getarticle', 'listmyarticles', 'savearticle', 'article'],['edit', 'view', 'delete']);
// 	acl.allow('article-viewer',['getarticle', 'listmyarticles', 'article'],['view']);
//
// 	//assign users to roles
// 	acl.addUserRoles('writeonmvpstep1-1@test.com', 'article-editor');
// 	acl.addUserRoles('writeonmvpstep1-2@test.com', 'article-viewer');
// 	acl.addUserRoles('writeonmvpstep1-3@test.com', 'article-viewer');
// };

AuthService.prototype.initUserAuthorization = function() {
  //https://github.com/OptimalBits/node_acl

  //acl.addUserRoles('testuser', 'guest')
  //acl.allow('guest', 'articles', ['edit','view']);

  //create roles
  //format is acl.allow('<role>,['<lowercase url endpoint>' OR '<lowercase model path and filename. e.g. server/models/recruitunit.job.all.js']')
  //TODO refactor this into a proper model/schema with jugglingDb
  //TODO specify specific CRUD permissions (get(r), put(c), delete(d), post(u)), i.e. get should be replaced with read
  //acl.allow('recruiter',['getarticle', 'getspecifieduser', 'listmyarticles', 'listmytestcontent', 'recruitunitjobitem'],['view']);
  //acl.allow('recruiter',['server/models/recruitunit.job.all.js'],['create']);

  acl.allow([
    {
      roles:['recruiter'],
      allows:[
        {resources: ['getarticle', 'getspecifieduser', 'listmyarticles', 'listmytestcontent', 'recruitunitjobitem'], permissions: ['read']},
        {resources: ['createarticle'], permissions: ['create']}
      ]
    },
    {
      roles:['developer'],
      allows:[
        {resources: ['getarticle', 'getspecifieduser', 'listmyarticles', 'listmytestcontent', 'recruitunitjobitem'], permissions: ['read']},
        {resources: ['createarticle'], permissions: ['create']}
      ]
    }
  ]);

  //assign users to roles
  acl.addUserRoles('recruiter1@gmail.com', 'recruiter');
  acl.addUserRoles('writeonmvpstep1-1@test.com', 'developer');
};

//operation param maps to the role permissions of create, read, update, delete. Can be passed as an array i.e. ['create','read'], or single string 'create'
AuthService.prototype.checkUserIsAuthorisedOperation = function(operation){
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
        
        acl.isAllowed(username, reqParts[1], operation, function(err, res){
          if(res){
            console.log("User member ["+ username +"] is allowed to ["+ operation +"] on ["+ reqParts[1]+"]");
            console.log(res);
            next();
          } else {
            console.log("Error. User member ["+ username +"] does not have permission to ["+ operation +"] on ["+ reqParts[1]+"]");

            var error = new Error("Authorisation denied. Insufficient access privelages");
            res.status(403).send(error);
            //next(error);
          }
        });
      } else {
        console.log("fulldecodetoken error");

        var error = new Error("Authorisation denied. Invalid token");
	    	res.status(403).send(error);
      }
    });


  }
};


// AuthService.prototype.checkUserIsAuthorisedUrl = function(){
// 	var self = this;
// 	var middleware = false;
// 	return function(req, res, next){
//         // check if this is a middleware call
//         if(next){
//             // only middleware calls would have the "next" argument
//             middleware = true;
//         }
//
// 		var username = null;
// 		var reqUriPath = _utils.parseUri(req.url).path;
// 		var reqParts = reqUriPath.split("/").map(function(n){return n.toLowerCase();});
//
// 		self.fulldecodetoken(req, res, function(err, result){
// 			if(result){
// 				console.log("fulldecodetoken result");
// 				console.log(result);
// 				username = result.username;
// 			} else {
// 				console.log("fulldecodetoken error");
// 				console.log(err);
// 			}
// 		});
//
// 		acl.isAllowed(username, reqParts[1], ['view'], function(err, res){
// 		    if(res){
// 		        console.log("User member is allowed to view articles");
// 		        console.log(res);
// 		        next();
// 		    } else {
// 		    	console.log("error");
// 		    	console.log(err);
// 		    	var error = new Error("Authorisation denied. Insufficient access privelages");
// 		    	next(error);
// 		    }
// 		});
// 	}
// };

//todo: Deprecated
// AuthService.prototype.checkUserIsAuthorisedModel = function(){
// 	var self = this;
// 	var middleware = false;
// 	return function(req, res, next){
//         // check if this is a middleware call
//         if(next){
//             // only middleware calls would have the "next" argument
//             middleware = true;
//         }
// 		var username = null;
// 		//var reqModel = req.result.modelType.toLowerCase(); //model parameter is required in the model.
//     var reqModel = req.query.modelType.toLowerCase();
//
// 		self.fulldecodetoken(req, res, function(err, result){
// 			if(result){
// 				console.log("fulldecodetoken result");
// 				console.log(result);
// 				username = result.username;
// 			} else {
// 				console.log("fulldecodetoken error");
// 				console.log(err);//todo: probably null, check and remove everywhere if needed.
//
//         var error = new Error("Authorisation denied. Insufficient model access privelages"); //todo: do this in checkUserIsAuthorisedUrl check above
//         res.status(403).send(error);
//       }
// 		});
//
//
//     //debug to see users permissions.
//     acl.allowedPermissions(username, [reqModel], function(err, permissions){
//       console.log("Allowed permissions for:" + username + ", to access:" + reqModel);
//       console.log(permissions)
//     })
//
//     //TODO: how to deal with one user only having read permission, while another has read and write. how to 'chain' the isAllowed?
// 		acl.isAllowed(username, reqModel, ['view', 'create'], function(err, result){
// 		    if(result){
// 		        console.log("User member is allowed to access articles");
// 		        console.log(result);
// 		        next();
// 		    } else {
// 		    	console.log("view error");
// 		    	console.log(err);
//
// 		    	var error = new Error("Authorisation denied. Insufficient model access privelages");
// 		    	res.status(403).send(error);
// 		    }
// 		});
//
//   }
// };

AuthService.prototype.acl = function() {
	return acl;
};

exports.AuthService = new AuthService;
