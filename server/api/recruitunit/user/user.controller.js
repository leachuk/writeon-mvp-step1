'use strict';

require('rootpath')();
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var recruitUnitHandler = require('server/services/recruitunit/users/recruitUnitUserService.controller');
var recruitUnitUserService = recruitUnitHandler.Service;

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
  var updateData = req.body; //in POST body

  recruitUnitUserService.updateUser(req, useremail, updateData, function(err, result){
    if (!err){
      res.send(result);
    } else {
      res.send(err);
    }
  });
};

