'use strict';

var _authService = require('server/services/auth/auth.controller').AuthService;;

function AuthUtils(){};

AuthUtils.prototype.authenticateToken = function(authHeader, secret, callback){
	console.log("in Util authenticateToken");
	console.log("token");
	console.log(authHeader);
	var parts = authHeader;

	if (parts.length == 2) {
		var scheme = parts[0];
		var credentials = parts[1];

		if (/^Bearer$/i.test(scheme)) {
		    var token = credentials;
		    
		    _authService.decodetoken(secret, token, function(result){
		      if (result == null){
		        console.log("Invalid token");
		        callback(new Error("Bad token. Permission denied."),null);
		      } else {
		        callback(null,result);
		      }
		    });
		} else {
		  console.log("Invalid Authorization Header. Format is Authorization: Bearer [token]");
		  callback(new Error('Invalid Authorization Header. Format is Authorization: Bearer [token]'), null);
		}	
	} else {
		console.log("Format is Authorization: Bearer [token]");
		var returnError = new UnauthorizedError('credentials_bad_format', {
		  message : 'Format is Authorization: Bearer [token]'
		});
		callback(returnError,null);
	}
};

exports.AuthUtils = new AuthUtils;