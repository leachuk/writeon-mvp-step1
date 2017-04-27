'use strict';

var appDir = require('path').dirname(require.main.filename);

var jwt = require('jsonwebtoken');
var _ = require('lodash');

var couchDbHandlers = require(appDir + '/services/couchDbHandler/couchDbHandler.controller');
var authHandlers = require(appDir + '/services/auth/auth.controller');

//create user database on signup
exports.signup = function(req, res) {
  var applicationHandler = require(appDir + req.query.modelId);
  var appService = applicationHandler.Service;

  appService.createNewUser(req, function(err, result){
    if (!err){
      res.send(result);
    } else {
      res.status(401).send(err);
    }
  });
};

//testing authentication endpoint
//not secured to the same ip, can be secured at the endpoint using acl
//don't think this should be used
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

//secured to authenticated user making the request
exports.getthisuser = function(req, res, next) {
  console.log("in getthisuser");
  var username = req.param("username");
  var couchService = couchDbHandlers.Service;
  var authService = authHandlers.AuthService;

  authService.fulldecodetoken(req, res, function (err, result) {
    if (!err && username == result.username){
      couchService.getUser(req, username, function (err, result) {
        if (!err) {
          res.send(result);
        } else {
          res.send(err);
        }
      });
    } else {
      console.log("Authorization origin declined");
      res.status(401);
      return next(new Error("Permission denied."));
    }
  });
}

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

      //todo: refactor this to use proper async serial flow control rather than callback hell
      //using non authed method as already within an authenticated call
      couchService.getUserNoAuthentication(req, result.name, function (err, getUserResult) {
        if (!err) {
          //object passed back to client side as token. Currently jwt token is only signed, not encrypted, so the payload can be openly read. DO NOT place secure data in here.
          var profile = { username: result.name,
            cookie: cookieheader[0],
            ok: result.ok,
            roles: result.roles,
            ip: clientip };
          // We are encoding the profile inside the token
          var token = jwt.sign(profile, req.app.get('secret'), { expiresInMinutes: 60 * 24 * 30 }); //30 days expiry

          returnMessage["success"] = true;
          returnMessage["token"] = token;

          res.send(returnMessage);
        } else {
          res.send(err);
        }
      });
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
