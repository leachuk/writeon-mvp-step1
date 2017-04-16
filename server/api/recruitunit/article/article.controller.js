'use strict';

var appDir = require('path').dirname(require.main.filename);

var _ = require('lodash');

var applicationHandler = require(appDir + '/services/recruitunit/articles/recruitUnitContentService.controller');
var appService = applicationHandler.Service;

exports.index = function(req, res) {
  res.json([{articles: 'index test'}]);
};

exports.getArticle = function(req, res, next) {
  console.log("in recruitunit getArticle");
  var applicationHandler = require(appDir + '/services/recruitunit/articles/recruitUnitContentService.controller.js');
  var appService = applicationHandler.Service;
  var modelPath = appDir + '/models/RecruitUnit.Job.All.js';

  appService.getArticle(req, modelPath, function(err, result){
    if (!err){
      //console.log(result);
      res.send(result);
    } else {
      //console.log(err);
      res.send(err);
    }
  });
};

exports.createJobSubmission = function(req, res) {
	console.log("Recruitunit controller, saveArticle");
	console.log(req.body);

  // Pass require path from client in req.query.modelId
  // for now make it the literal path to the controller, to be an id with a lookup on the server.
  console.log("setting app handler to use methods defined by controller:" + req.query.modelId);

	appService.createJobSubmission(req, function(err, result){
	    if (!err){
	      //console.log(result);
	      res.send(result);
	    } else {
	      console.log(err);
	      res.send(err);
	    }
	});
};

exports.toggleDevEmailDisplay = function(req, res) {
  console.log("Recruitunit controller, toggleDevEmailDisplay");

  appService.toggleDevEmailDisplay(req, function(err, result){
    if (!err){
      //console.log(result);
      res.send(result);
    } else {
      console.log(err);
      res.send(err);
    }
  });
};

exports.getUserTestResults = function(req, res){
  console.log("Recruitunit controller getUserTestResults");

  appService.getUserTestResults(req, function(err, result){
    if(!err){
      res.send(result);
    }else{
      res.send(err);
    }
  });
};




