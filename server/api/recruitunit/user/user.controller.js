'use strict';

var appDir = require('path').dirname(require.main.filename);

var jwt = require('jsonwebtoken');
var _ = require('lodash');

var couchDbHandlers = require(appDir + '/services/couchDbHandler/couchDbHandler.controller');
var couchService = couchDbHandlers.Service;
var recruitUnitHandler = require(appDir + '/services/recruitunit/users/recruitUnitUserService.controller');
var recruitUnitUserService = recruitUnitHandler.Service;

//generates jwt token to be stored on the client
exports.signin = function(req, res){
  console.log("in signin");
  var username = req.body.username;
  var password = req.body.password;
  var clientip = req.ip;
  var returnMessage = {};

  couchService.authenticate(username, password, function(err, result, headers){
    if (!err){
      console.log("success");
      console.log(headers);
      var cookieheader = headers['set-cookie'];
      var userObject = result;

      //todo: refactor this to use proper async serial flow control rather than callback hell
      //using non authed method as already within an authenticated call
      recruitUnitUserService.getUserNoAuthentication(req, userObject, function (err, getUserResult) {
        if (!err) {
          //object passed back to client side as token. Currently jwt token is only signed, not encrypted, so the payload can be openly read. DO NOT place secure data in here.
          var profile = {
            username: userObject.name,
            cookie: cookieheader[0],
            ok: userObject.ok,
            roles: userObject.roles,
            isComparisonFormEnabled: getUserResult.data.isComparisonFormEnabled,
            userGuid: getUserResult.data.userGuid,
            ip: clientip };
          // We are encoding the profile inside the token
          var token = jwt.sign(profile, req.app.get('secret'), { expiresIn: 60 * 24 * 30 }); //token expiry set to 30 days

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
exports.getUserFromGuid = function(req, res){
  console.log("in recruitUnit getUserFromGuid");
  var userguid = req.param("userguid");

  recruitUnitUserService.getUserFromGuid(req, userguid, function(err, result){
    if (!err){
      res.send(result);
    } else {
      res.send(err);
    }
  });
};

exports.updateUser = function(req, res){
  console.log("in recruitUnit updateUser");
  var useremail = req.param("useremail");
  var updateData = req.body.updateJson;

  recruitUnitUserService.updateUser(req, useremail, updateData, function(err, result){
    if (!err){
      res.send(result);
    } else {
      res.send(err);
    }
  });
};

exports.getDevEmailFromDocId = function(req, res){
  console.log("in recruitUnit getDevEmailFromDocId");
  var docId = req.param("docid");

  recruitUnitUserService.getDevEmailFromDocId(req, docId, function(err, result){
    if (!err){
      res.send(result);
    } else {
      res.send(err);
    }
  });
};


