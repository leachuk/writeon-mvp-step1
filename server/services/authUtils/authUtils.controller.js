'use strict';

var _authService = require('server/services/auth/auth.controller').AuthService;;

function AuthUtils(){};

AuthUtils.prototype.authenticateToken = function(req, callback){
	console.log("in Util authenticateToken");

  var parts = req.headers.authorization.split(' ');
  var secret = req.app.secret;

  console.log("parts length:["+ parts.length +"], secret:["+ secret +"]");
  console.log(parts);
	//var parts = authHeader;

	if (parts.length == 2) {
		var scheme = parts[0];
		var credentials = parts[1];

		if (/^Bearer$/i.test(scheme)) {
		    var token = credentials;
        console.log("token");
        console.log(token);

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
