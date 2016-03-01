'use strict';

require('rootpath')();
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var couchDbHandlers = require('server/services/couchDbHandler/couchDbHandler.controller');
var authHandlers = require('server/services/auth/auth.controller');

//create user database on signup
exports.signup = function(req, res) {
  var couchService = couchDbHandlers.Service;

  couchService.createNewUser(req, function(err, result){
    if (!err){
      res.send(result);
    } else {
      res.send(err);
    }
  });
};

//testing authentication endpoint
//not secured to the same ip
exports.getuser = function(req, res){
  console.log("in getuser");
  var username = req.param("username");
  var couchService = couchDbHandlers.Service;
  couchService.getUser(req, username, function(err, result){
    if (!err){
      res.send(result);
    } else {
      res.send(err);
    }
  });
};


exports.authenticate = function(req, res, next){
  console.log("in users.authenticate");
  var token = null;
  var parts = req.headers.authorization.split(' ');
  var authService = authHandlers.AuthService;
  var clientip = req.ip;

  if (parts.length == 2) {
    var scheme = parts[0];
    var credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
        token = credentials;

        authService.decodetoken(req, token, function(result){
          //only successfully authenticate from the same IP address. Stops token sharing/spoofing.
          if (result == null){
            console.log("Invalid token");
            return next(new Error("Bad token. Permission denied."));
          } else if (clientip == result.ip){
            res.json(result);
          } else {
            // return next(new UnauthorizedError('credentials_bad_format', {
            //   message : 'Authorization origin declined'
            // }));
            console.log("Authorization origin declined");
            //return next(new Error("Permission denied."));
            res.status(401);
            return next(new Error("Permission denied."));
          }

        });
    } else {
      console.log("Invalid Authorization Header. Format is Authorization: Bearer [token]");
      return next(new Error('Invalid Authorization Header. Format is Authorization: Bearer [token]'));
    }
  } else {
    console.log("Format is Authorization: Bearer [token]");
    return next(new UnauthorizedError('credentials_bad_format', {
      message : 'Format is Authorization: Bearer [token]'
    }));
  }
}

//sign in a user. differs from authenticate as this is a user driven action, i.e. via login form.
//generates a unique jwt for subsequent requests
exports.signin = function(req, res){
  console.log("in signin");
  var username = req.body.username;
  var password = req.body.password;
  var clientip = req.ip;
  var couchService = couchDbHandlers.Service;
  var returnMessage = {};

  couchService.authenticate(username, password, function(err, result, headers){
    if (!err){
      console.log("success");
      console.log(headers);
      var cookieheader = headers['set-cookie'];
      var profile = { username: result.name,
                      cookie: cookieheader[0],
                      ok: result.ok,
                      roles: result.roles,
                      ip: clientip };
      // We are encoding the profile inside the token
      var token = jwt.sign(profile, req.app.get('secret'), { expiresInMinutes: 60 * 5 });

      returnMessage["success"] = true;
      returnMessage["token"] = token;
      //res.json({ token: token });
      res.send(returnMessage);
    }else{
      console.log("error:" + err);
      returnMessage["success"] = false;
      returnMessage["message"] = err.reason;
      res.status(401).send(returnMessage);
    }
  });

};

exports.isuservalid = function(req, res){
  console.log("in user:isuservalid controller");
  var username = req.param("username");
  var couchService = couchDbHandlers.Service;
  couchService.isUserValid(req, username, function(err, result){
    if (!err){
      res.send(result);
    } else {
      res.send(err);
    }
  });
};
