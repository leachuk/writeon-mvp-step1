'use strict';

require('rootpath')()
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var config = require('server/config/environment');
var async = require('async');

var acl = require('acl');
var redisClient = require('redis').createClient(config.redisPort, config.redisHost, {no_ready_check: true});
acl = new acl(new acl.redisBackend(redisClient));

var couchDbHandlers = require('server/services/couchDbHandler/couchDbHandler.controller');
var couchService = couchDbHandlers.Service;
var DeveloperUserModel = require('server/models/RecruitUnit.User.Developer.js');
var RecruiterUserModel = require('server/models/RecruitUnit.User.Recruiter.js');
var JobDocumentModel = require('server/models/RecruitUnit.Job.All.js');

var _dbUtils = require('server/services/dbUtils/dbUtils.controller').DbUtils;
var _authUtils = require('server/services/authUtils/authUtils.controller').AuthUtils;
var _recruitUnitUserUtils = require('server/services/recruitunit/users/RecruitUnitUserService.controller').Service;


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
            if(req.body.jobRole.indexOf("recruiter") != -1){
              var UserModel = require('server/models/RecruitUnit.User.Recruiter.js');
            }else if(req.body.jobRole.indexOf("developer") != -1){
              var UserModel = require('server/models/RecruitUnit.User.Developer.js');
            }
            var userModel = UserModel(req.body, {});

            req.body.name = req.body.email; //couchdb requirement
            req.body.id = "org.couchdb.user:" + req.body.email; //couchdb requirement. the name part of _id and the name field must match.
            req.body.userGuid = _authUtils.generateUUID();

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
                acl.addUserRoles(req.body.email, req.body.jobRole.toLowerCase());

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
              "roles" : resultData.roles,
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

RecruitUnitUserService.prototype.getUserFromGuidNoAuth = function(userGuid, func_callback){
  console.log("RecruitUnitUserService getUserFromGuidNoAuth, userguid: " + userGuid);

  async.series({
      getUserFromGuid: function(callback){
        var UserModel = require('server/models/RecruitUnit.User.Developer.js');//I'm assuming this function is only called by recruiters who are submitting to developer. Otherwise need logic around this to change the model.
        var userModelNoAuth = UserModel(null, {returnAll: true});
        userModelNoAuth.all({where: {userGuid: userGuid}}, function(err, result){
          if (!err && result != null && result.length > 0) {
            console.log("getUserFromGuid: success");
            console.log(result);
            var resultData = result[0];
            var returnMessage = { //ensure success param returned to client
              "success": true,
              "data": {
                "displayName" : resultData.displayName,
                "email" : resultData.email,
                "roles" : resultData.roles,
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
}

RecruitUnitUserService.prototype.updateUser = function(req, username, updateData, func_callback){
  console.log("RecruitUnitUserService updateUser, username: " + username + ", updateData" + updateData);

  var returnTokenSuccess = null;
  var userUpdateModel = null;

  async.series({
      //ensure current request has authentication token
      authToken: function(callback){
        _authUtils.authenticateToken(req, function(err, result){
          //console.log("authToken result:");
          //console.log(result);
          returnTokenSuccess = result; //decoded json token
          callback(err, result);
        });
      },
      getUser: function(callback){
        if(returnTokenSuccess.roles.indexOf("recruiter") != -1){
          var UserModel = require('server/models/RecruitUnit.User.Recruiter.js');
        }else if(returnTokenSuccess.roles.indexOf("developer") != -1){
          var UserModel = require('server/models/RecruitUnit.User.Developer.js');
        }
        var userModelAuth = UserModel(returnTokenSuccess.cookie, {returnAll: true});
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
            var updatedUserToken = returnTokenSuccess;
            returnTokenSuccess.isComparisonFormEnabled = body.isComparisonFormEnabled;
            // We are encoding the profile inside the token
            var token = jwt.sign(updatedUserToken, req.app.get('secret'), { expiresInMinutes: 60 * 5 });//recreate the user profile with the updated attributes for sending and saving on the client.

            var successReturn = { //ensure success param returned to client
              data: body,
              token: token,
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

RecruitUnitUserService.prototype.getDevEmailFromDocId = function(req, docId, func_callback){
  console.log("RecruitUnitUserService getDevEmailFromDocId, docId: " + docId);

  var returnSuccess = null;
  var _this = this; //so we can re-use internal prototype functions
  var authCookie;

  async.waterfall([
    authToken,
    getUserGUIDFromDoc,
    getUserEmailFromGuid
  ],function (err, result) {
    // result now equals result of last run function
    //console.log(result);
    func_callback(err, result);
  });
  function authToken(callback){
    _authUtils.authenticateToken(req, function(err, result){
      //console.log("authToken result:");
      //console.log(result);
      authCookie = result.cookie;
      callback(null, result);
    });
  }
  function getUserGUIDFromDoc(returnSuccess, callback){
    console.log("RecruitUnitContentService getUserTestResults>search");
    console.log(authCookie);
    console.log(returnSuccess.username);
    var jobModelAuth = JobDocumentModel(authCookie, {returnAll: true});
    //only get if dev has set displayDevEmail to true
    jobModelAuth.all({where: {id: docId, published: true, displayDevEmail: true}}, function(err, results){
      if(!err){
        console.log("success result");
        var userGUID = results.length > 0 ? results[0].submitTo : "";
        callback(null, userGUID);
      }else{
        console.log("articleModelAuth error");
        callback(err, null);
      }
    });
  }
  function getUserEmailFromGuid(userGUID, callback){
    if (userGUID.length > 0){
      _recruitUnitUserUtils.getUserFromGuidNoAuth(userGUID, function(err, result){
        if(!err){
          callback(null, result.data);
        }else{
          console.log(err);
          callback(err, null)
        }
      });
    } else {
      callback(new Array()); //the first callback param returns error. Return empty array.
    }
  }
};

exports.Service = new RecruitUnitUserService;






