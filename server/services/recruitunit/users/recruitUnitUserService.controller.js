'use strict';

require('rootpath')()
var _ = require('lodash');
var config = require('server/config/environment');
//var couchnano = require("nano")(config.couchuri);
//var dbNameArticles = config.dbNameArticles;
var async = require('async');
var uuid = require('uuid');

var couchDbHandlers = require('server/services/couchDbHandler/couchDbHandler.controller');
var couchService = couchDbHandlers.Service;

var _dbUtils = require('server/services/dbUtils/dbUtils.controller').DbUtils;
var _authUtils = require('server/services/authUtils/authUtils.controller').AuthUtils;

function RecruitUnitUserService(){};

// ********************************************************************************************************************************** //
//
// User Services
//
// ********************************************************************************************************************************** //

RecruitUnitUserService.prototype.getUserNoAuthentication = function(req, userObj, func_callback){
  console.log("couchdb service getUserNoAuthentication, username: " + userObj.name);

  async.series({
      getUser: function(callback){
        //check the requested username is the authenticated user. May need to change, but should provide sufficient security
        //if (returnAuthToken.username == username) {
        var DeveloperUserModel = require('server/models/RecruitUnit.User.Developer.js');
        var RecruiterUserModel = require('server/models/RecruitUnit.User.Recruiter.js');
        var userModelAuth = userObj.roles.indexOf('developer') === -1 ? RecruiterUserModel(null, null) : DeveloperUserModel(null, null);
        userModelAuth.find("org.couchdb.user:" + userObj.name, function (err, result) {
          if (!err) {
            console.log("RecruitUnitUserService getUser: success");
            console.log(result);
            var returnMessage = { //ensure success param returned to client
              data: result,
              success: true
            };
            callback(null, returnMessage);
          } else {
            console.log("CouchDBService getUser: error");
            var returnMessage = {
              "success": false,
              "data": err,
              "message": "UserModel error"
            }
            callback(returnMessage, null);
          }
        });
      }
    },
    function(err, results) {
      console.log("getUserNoAuthentication results:");
      console.log(results);
      func_callback(err, results.getUser);
    });
};

RecruitUnitUserService.prototype.createNewUser = function(req, func_callback){
//When a user signs up, create the user
  var returnMessage = {};
  var appkey = req.body.key;
  console.log("appkey:" + appkey);
  //console.log("createNewUser: dbname["+ dbname +"], useremail["+ useremail +"], userpassword["+ userpassword +"]");

  couchService.isValidAppKey(appkey, req, function(err, isValidKeyResult){
    console.log("isValidAppKey:" + isValidKeyResult);

    if (isValidKeyResult){
      async.series({
          createUser: function(callback){
            if(req.body.jobRole == "recruiter"){
              var UserModel = require('server/models/RecruitUnit.User.Recruiter.js');
            }else if(req.body.jobRole == "developer"){
              var UserModel = require('server/models/RecruitUnit.User.Developer.js');
            }
            var userModel = UserModel(req.body, {});

            req.body.name = req.body.email; //couchdb requirement
            req.body.id = "org.couchdb.user:" + req.body.email; //couchdb requirement. the name part of _id and the name field must match.
            req.body.userGuid = uuid.v1();

            userModel.create(req.body, function(error, result){
              if (error) {
                console.log("create user error");
                console.log(error.message);
                returnMessage["success"] = false;
                returnMessage["message"] = error.message;
                callback(returnMessage,null);
                //return res.status(error["status-code"]).send(error.message);
                //response.send(error.message, error["status-code"]);
              } else {
                returnMessage["success"] = true;
                callback(null,returnMessage);
              }
              console.log(returnMessage);
            });
          }
        },
        function(err, results) {
          // results is now equal to: {one: 1, two: 2}
          console.log(results);
          if(!err){
            var successReturn = {
              data: results,
              success: true
            }
            func_callback(null, successReturn);
          } else {
            var errorReturn = {
              data: err,
              success: false
            }
            func_callback(errorReturn, null);
          }
        });
    } else { // not a valid app key
      returnMessage["success"] = false;
      returnMessage["data"] = err;
      func_callback(returnMessage, null);
    }
  });

};




//Allow an authenticated user to check if another user exists.
//Use: A recruiter wants to view and submit a developers form at /developer/<dev userid>. This confirms the form is valid.
RecruitUnitUserService.prototype.isUserValid = function(req, username, func_callback){
  console.log("couchdb service isUserValid, username: " + username);

  var returnAuthToken = null;
  async.series({
      //ensure current request has authentication token
      authToken: function(callback){
        _authUtils.authenticateToken(req, function(err, result){
          //console.log("authToken result:");
          //console.log(result);
          returnAuthToken = result; //decoded json token
          callback(err, result);
        });
      },
      getUser: function(callback){
        var userModelAuth = UserModel(null, null);
        userModelAuth.find("org.couchdb.user:" + username, function (err, result) {
          if (!err && result != null) {
            console.log("CouchDBService getUser: success");
            console.log(result);
            var returnMessage = { //ensure success param returned to client
              data: result.email,
              success: true
            };
            callback(null, returnMessage);
          } else {
            console.log("CouchDBService getUser: error");
            var returnMessage = {
              "success": false,
              "data": err,
              "message": "UserModel error"
            }
            callback(returnMessage, null);
          }
        });
      }
    },
    function(err, results) {
      console.log("isUserValid results:");
      console.log(results);
      func_callback(err, results.getUser);
    });
};

RecruitUnitUserService.prototype.getUserFromGuid = function(req, userguid, func_callback){
  console.log("RecruitUnitUserService getUserFromGuid, userguid: " + userguid);

  var returnSuccess = null;
  async.series({
    authToken: function(callback){
      _authUtils.authenticateToken(req, function(err, result){
        //console.log("authToken result:");
        //console.log(result);
        returnSuccess = result; //decoded json token
        callback(err, result);
      });
    },
    getUserFromGuid: function(callback){
      var UserModel = require('server/models/RecruitUnit.User.Developer.js');//I'm assuming this function is only called by recruiters who are submitting to developer. Otherwise need logic around this to change the model.
      var userModelAuthenticated = UserModel(returnSuccess.cookie, {returnAll: true});
      userModelAuthenticated.all({where: {userGuid: userguid}}, function(err, result){
        if (!err && result != null && result.length > 0) {
          console.log("getUserFromGuid: success");
          console.log(result);
          var resultData = result[0];
          var returnMessage = { //ensure success param returned to client
            "success": true,
            "data": {
              "displayName" : resultData.displayName,
              "jobRole" : resultData.jobRole,
              "userGuid" : resultData.userGuid
            }
          };
          callback(null, returnMessage);
        } else {
          console.log("checkSubmitToUserExists: error");
          var returnMessage = {
            "success": false,
            "data": err,
            "message": "UserModel error"
          }
          callback(returnMessage, null);
        }
      });
    }
  },
  function(err, results) {
    console.log("getUser results:");
    console.log(results);
    func_callback(err, results.getUserFromGuid);
  });
};

RecruitUnitUserService.prototype.updateUser = function(req, username, updateData, func_callback){
  console.log("couchdb service isUserValid, username: " + username);

  var returnSuccess = null;
  var userUpdateModel = null;

  async.series({
      //ensure current request has authentication token
      authToken: function(callback){
        _authUtils.authenticateToken(req, function(err, result){
          //console.log("authToken result:");
          //console.log(result);
          returnSuccess = result; //decoded json token
          callback(err, result);
        });
      },
      getUser: function(callback){
        if(returnSuccess.jobRole == "recruiter"){
          var UserModel = require('server/models/RecruitUnit.User.Recruiter.js');
        }else if(returnSuccess.jobRole == "developer"){
          var UserModel = require('server/models/RecruitUnit.User.Developer.js');
        }
        var userModelAuth = UserModel(returnSuccess.cookie, {returnAll: true});
        userModelAuth.find("org.couchdb.user:" + username, function (err, result) {
          if (!err && result != null) {
            console.log("RecruitUnitUserService getUser: success");
            console.log(result);
            userUpdateModel = result;
            callback(null, returnMessage);
          } else {
            console.log("RecruitUnitUserService updateUser: error");
            var returnMessage = {
              "success": false,
              "data": err,
              "message": "UserModel error"
            }
            callback(returnMessage, null);
          }
        });
      },
      updateUser: function(callback){
        console.log("RecruitUnitUserService updateUser result");
        console.log(userUpdateModel);
        console.log("updateData")
        console.log(updateData);
        console.log(typeof updateData);
        userUpdateModel.updateAttributes(updateData, function(err, body){
          if(!err){
            console.log("RecruitUnitUserService updateUser success");
            //console.log(body);
            var successReturn = { //ensure succees param returned to client
              data: body,
              success: true
            };
            callback(null, successReturn);
          }else{
            console.log("RecruitUnitUserService updateUser get error");
            callback(err, null);
          }
        });

      }
    },
    function(err, results) {
      console.log("RecruitUnitUserService updateUser results:");
      console.log(results);
      func_callback(err, results.updateUser);
    });
};

exports.Service = new RecruitUnitUserService;






