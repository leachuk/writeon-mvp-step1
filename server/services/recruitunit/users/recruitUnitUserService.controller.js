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

RecruitUnitUserService.prototype.getUser = function(req, username, func_callback){
  console.log("RecruitUnitUserService getUser, username: " + username);

  var returnAuthToken = null;
  async.series({
      authToken: function(callback){
        _authUtils.authenticateToken(req, function(err, result){
          //console.log("authToken result:");
          //console.log(result);
          returnAuthToken = result; //decoded json token
          callback(err, result);
        });
      },
      getUser: function(callback){
        //check the requested username is the authenticated user. May need to change, but should provide sufficient security
        //if (returnAuthToken.username == username) {
        var userModelAuth = UserModel(null, null);
        userModelAuth.find("org.couchdb.user:" + username, function (err, result) {
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
        //}else{
        //  var returnMessage = {
        //    "success": false,
        //    "message": "Unauthorised request for user details"
        //  }
        //  callback(returnMessage, null);
        //}
      }
    },
    function(err, results) {
      console.log("getUser results:");
      console.log(results);
      func_callback(err, results.getUser);
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

exports.Service = new RecruitUnitUserService;






