'use strict';

var appDir = require('path').dirname(require.main.filename);

var _ = require('lodash');
var async = require('async');

var couchDbHandlers = require(appDir + '/services/couchDbHandler/couchDbHandler.controller');
var couchService = couchDbHandlers.Service;

//var TestModel = require(appDir + '/models/JugglingModelTest');
var ArticleModel = require(appDir + '/models/Article');

// Get list of articles
exports.index = function(req, res) {
  res.json([{articles: 'index test'}]);
};

exports.getArticle = function(req, res, next) {
	// var type = req.param("type");
	// var id = req.param("id");
	//var dbTable = req.param("dbtable");
	// console.log("getArticle type: " + type);
	// console.log("getArticle id: " + id);
  console.log("setting app handler to use methods defined by controller:" + req.query.modelId);
  var applicationHandler = require(appDir + req.param('modelId'));
  var appService = applicationHandler.Service;

  var modelPath = req.param("model");
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

exports.createArticle = function(req, res) {
	console.log("Article controller, saveArticle");
	console.log(req.body);

  // Pass require path from client in req.query.modelId
  // for now make it the literal path to the controller, to be an id with a lookup on the server.
  console.log("setting app handler to use methods defined by controller:" + req.query.modelId);
  var applicationHandler = require(req.query.modelId);
  var appService = applicationHandler.Service;

	appService.createArticle(req, function(err, result){
	    if (!err){
	      //console.log(result);
	      res.send(result);
	    } else {
	      console.log(err);
	      res.send(err);
	    }
	});
};

exports.saveComparison = function(req, res) {
  console.log("Article controller, saveComparison");
  console.log(req.body);

  // Pass require path from client in req.query.modelId
  // for now make it the literal path to the controller, to be an id with a lookup on the server.
  console.log("setting app handler to use methods defined by controller:" + req.query.modelId);
  var applicationHandler = require(appDir + req.query.modelId);
  var appService = applicationHandler.Service;

  appService.createComparison(req, {}, "", function(err, result){
    if (!err){
      //console.log(result);
      res.send(result);
    } else {
      console.log(err);
      res.send(err);
    }
  });
};

//Todo: For testing, to be refactored into RecruitUnit client once working
exports.compare = function(req, res) {
  console.log("Article controller, compare");
  console.log(req.body);

  // Pass require path from client in req.query.modelId
  // for now make it the literal path to the controller, to be an id with a lookup on the server.
  console.log("setting app handler to use methods defined by controller:" + req.query.modelId);
  var applicationHandler = require(appDir + '/services/recruitunit/articles/recruitUnitContentService.controller');
  var appService = applicationHandler.Service;
  var recruitUnitUtils = require(appDir + '/services/recruitunit/utils/recruitUnitUtilityService.controller').Service;

  var testSourceDoc = {};
  var comparisonDoc = {};
  var returnSuccess = null;

  console.log("appService.getTestSourceAndComparisonDocuments");

  async.series({
      getTestSourceAndComparisonDocuments: function(callback){
        appService.getTestSourceAndComparisonDocuments(req, function(err, result){
          if (!err){
            //console.log(result);
            returnSuccess = result;
            callback(err, result);
          } else {
            console.log(err);
            res.send(err);
          }
        });
      },
      compare: function(callback){
        testSourceDoc = returnSuccess.getTestSourceDoc;
        comparisonDoc = returnSuccess.getComparisonDoc;
        console.log("recruitUnitUtils.compare");
        recruitUnitUtils.compare(testSourceDoc, comparisonDoc, function(err, result) {
          console.log("compare results:")
          //console.log(result);
          _.forEach(result, function (value, key) {
            console.log("key[" + key + "], rule[" + value.rule + "], result[" + value.result + "]");
          });
          if (!err){
            //console.log(result);
            callback(null,result);
          } else {
            console.log(err);
            callback(err, null);
          }
        });
      }
    },
    function(err, result) {
      console.log("getting source and comparison doc results");
      if (!err){
        console.log(result);
        res.send(result.compare);
      } else {
        console.log(err);
        res.send(err);
      }
    });
};

exports.updateArticle = function(req,res){
    console.log("setting app handler to use methods defined by controller:" + req.query.modelId);
    var applicationHandler = require(appDir + req.query.modelId);
    var appService = applicationHandler.Service;

    appService.updateArticle(req, function(err, result){
    	if(!err){
			res.send(result);
		}else{
			res.send(err);
		}
    });
};

exports.listAllUserArticles = function(req, res){
	var username = req.param("username");
	console.log("username: " + username);

	couchService.listAllUserArticles(req, username, function(err, result){
		if(!err){
			res.send(result);
		}else{
			res.send(err);
		}
	});
};


//get articles of the authenticated user
exports.listMyArticles = function(req, res){
	console.log("article.controller listMyArticles");
  console.log("setting app handler to use methods defined by controller:" + req.query.modelId);
  var applicationHandler = require(req.query.modelId);
  var appService = applicationHandler.Service;
	// TODO. Create a design doc to handle list document query. Is this done?
  appService.listMyArticles(req, function(err, result){
		if(!err){
			res.send(result);
		}else{
			res.send(err);
		}
	});
};

exports.listMyTestContent = function(req, res){
  console.log("article.controller listMyTestContent");
  console.log("setting app handler to use methods defined by controller:" + req.query.modelId);
  var applicationHandler = require(appDir + req.query.modelId);
  var appService = applicationHandler.Service;

  appService.listMyTestContent(req, function(err, result){
    if(!err){
      res.send(result);
    }else{
      res.send(err);
    }
  });
};

exports.listByAuthor = function(req, res){
	console.log("article.controller listByAuthor");

};

exports.deleteArticle = function(req, res){
	console.log("article.controller deleteArticle");

 	couchService.deleteArticle(req, function(err, result){
		if(!err){
			res.send(result);
		}else{
			res.send(err);
		}
	});
};

//search for articles which match json criteria. req modelId, modelType, searchJson
exports.search = function(req, res){
  console.log("article.controller search");
  console.log("setting app handler to use methods defined by controller:" + req.query.modelId);
  var applicationHandler = require(appDir + req.query.modelId);
  var appService = applicationHandler.Service;

  appService.search(req, function(err, result){
    if(!err){
      res.send(result);
    }else{
      res.send(err);
    }
  });
};



