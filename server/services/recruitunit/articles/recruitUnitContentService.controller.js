'use strict';

require('rootpath')()
var _ = require('lodash');
var config = require('server/config/environment');
//var couchnano = require("nano")(config.couchuri);
var dbNameArticles = config.dbNameArticles;
var async = require('async');

var couchDbHandlers = require('server/services/couchDbHandler/couchDbHandler.controller');
var couchService = couchDbHandlers.Service;

//var UserModel = require('server/models/User');
var ContentItemModel = require('server/models/RecruitUnit.Job.All.js');
var ContentItemListPartialModelConverter = require('server/models/RecruitUnit.Job.Partial.js');
var ComparisonTestModel = require('server/models/RecruitUnit.ComparisonTest.js');


var _dbUtils = require('server/services/dbUtils/dbUtils.controller').DbUtils;
var _authUtils = require('server/services/authUtils/authUtils.controller').AuthUtils;

function RecruitUnitContentService(){};

// ********************************************************************************************************************************** //
//
// Article and Content Services
//
// ********************************************************************************************************************************** //

RecruitUnitContentService.prototype.createArticle = function(req, jsondata, doctitle, func_callback){
	console.log("in RecruitUnitContentService, createArticle");
	console.log(req.body);

	var returnSuccess = null;
	var dbtable = dbNameArticles; //still required here?

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(req, function(err, result){
		    	//console.log("authToken result:");
		    	//console.log(result);
		    	returnSuccess = result;
		    	callback(err, result);
		    });
	    },
	    createArticle: function(callback){
			var articleModelAuth = ContentItemModel(returnSuccess.cookie);
			articleModelAuth.create(req.body, function(err, result){
        if(!err){
          console.log("RecruitUnitContentService createArticle: success");
          console.log(result);
          var successReturn = { //ensure succees param returned to client
            data: result,
            success: true
          };
          callback(null, successReturn);
        }else{
          console.log("error");
          callback(err, null);
        }
			});

	    }
	},
	function(err, results) {
	    console.log(results);
	    func_callback(err, results.createArticle);
	});
};

RecruitUnitContentService.prototype.getArticle = function(req, func_callback){
	var returnSuccess = null;
	var dbtable = dbNameArticles;

	var requestParams = req.query;
	var getAllData = requestParams.getAllData;
	console.log("getAllData:" + getAllData);
	var id = req.param("id");
	console.log("id:" + id);

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(req, function(err, result){
		    	returnSuccess = result;
		    	callback(err, result);
		    });
	    },
	    getArticle: function(callback){
			var articleModelAuth = ArticleModel(returnSuccess.cookie, {returnAll: getAllData});
			articleModelAuth.find(id, function(err, body){
				if(!err){
					console.log("success result");
					console.log(body);
					callback(null, body);
				}else{
					console.log("articleModelAuth error");
					callback(err, null);
				}
			});
	    }
	},
	function(err, results) {
	    console.log(results);
	    func_callback(err, results.getArticle);
	});
};

RecruitUnitContentService.prototype.deleteArticle = function(req, func_callback){
	var returnSuccess = null;
	var dbtable = dbNameArticles;

	var id = req.param("id");
	var rev = req.param("rev");
	console.log("id:" + id);

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(req, function(err, result){
		    	returnSuccess = result;
		    	callback(err, result);
		    });
	    },
	    deleteArticle: function(callback){
	    	var couchsetup = require("nano")({ url : config.couchuri, cookie: returnSuccess.cookie});
			var couchDb = couchsetup.use(dbtable);
			couchDb.destroy(id, rev, function(err, body) {
				if(!err){
					console.log("success result");
					console.log(body);
					callback(null, body);
				}else{
					console.log("couch nano error");
					callback(err, null);
				}
			});
	    }
	},
	function(err, results) {
	    console.log(results);
	    func_callback(err, results.deleteArticle);
	});
};

RecruitUnitContentService.prototype.listAllUserArticles = function(req, username, func_callback){
	//var listResultJson = null;
	//var listResultArray = [];
	var returnSuccess = null;
	var dbtable = dbNameArticles;

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(req, function(err, result){
		    	//console.log("authToken result:");
		    	//console.log(result);
		    	returnSuccess = result;
		    	callback(err, result);
		    });
	    },
	    listArticles: function(callback){
        var couchsetup = require("nano")({ url : config.couchuri, cookie: returnSuccess.cookie});
			  var couchDb = couchsetup.use(dbtable);
        couchDb.list({key:"Test Title 1"},function(err, body) {
          if (!err) {
            // body.rows.forEach(function(doc) {
            //   listResultArray.push(doc);
            //   console.log(doc);
            // });
            callback(null, body);
            console.log(body);
          }else{
            callback(err, null);
            console.log(err);
          }
        });
	    }
	},
	function(err, results) {
	    console.log(results);
	    func_callback(err, results);
	});
};

//params = getAllData(true|false)
RecruitUnitContentService.prototype.listMyArticles = function(req, func_callback){
	//var listResultJson = null;
	//var listResultArray = [];
	var returnSuccess = null;
	var dbtable = dbNameArticles;

	var requestParams = req.query;
	var getAllData = requestParams.getAllData;

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(req, function(err, result){
		    	//console.log("authToken result:");
		    	//console.log(result);
		    	returnSuccess = result;
		    	callback(err, result);
		    });
	    },
	    listMyArticles: function(callback){
	    	console.log("RecruitUnitContentService listMyArticles: returnSuccess");
	    	console.log(returnSuccess.cookie);
	    	console.log(returnSuccess.username);
			var articleModelAuth = ContentItemModel(returnSuccess.cookie, {returnAll: getAllData});
			articleModelAuth.all({where:{authorName: returnSuccess.username}}, function(err, body){
				if(!err){
					console.log("success result");
					//convert list of full article model to a partial model
					var updatedBody = ContentItemListPartialModelConverter(body);
					//console.log(updatedBody);
					callback(null, updatedBody);
				}else{
					console.log("articleModelAuth error");
					callback(err, null);
				}
			});
	    }
	},
	function(err, results) {
	    console.log(results);
	    func_callback(err, results.listMyArticles);
	});
};

RecruitUnitContentService.prototype.updateArticle = function(req, func_callback) {
	var returnSuccess = null;
	var articleUpdateModel = null;
	var dbtable = dbNameArticles;

	var id = req.param("id");
	console.log("updateData");
	console.log(req.param("updateData"));
	console.log(typeof req.param("updateData"))
	var updateData = req.param("updateData");
	console.log("id:" + id);

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(req, function(err, result){
		    	returnSuccess = result;
		    	callback(err, result);
		    });
	    },
	    getArticle: function(callback){
			var articleModelAuth = ArticleModel(returnSuccess.cookie, {returnAll: true});
			articleModelAuth.find(id, function(err, body){
				if(!err){
					console.log("update get success result");
					console.log(body);
					articleUpdateModel = body;
					callback(null, body);
				}else{
					console.log("update get error");
					callback(err, null);
				}
			});
	    },
	    updateArticle: function(callback){
	    	console.log("update articleModel result");
	    	console.log(articleUpdateModel);
	    	console.log("updateData")
	    	console.log(updateData);
	    	console.log(typeof updateData);
	    	articleUpdateModel.updateAttributes(updateData, function(err, body){
				if(!err){
					console.log("updateArticle success result");
					console.log(body);
					callback(null, body);
				}else{
					console.log("updateArticle get error");
					callback(err, null);
				}
			});

	    }
	},
	function(err, results) {
	    console.log(results);
	    func_callback(err, results.updateArticle);
	});
};

// ********************************************************************************************************************************** //
//
// Comparison Services
//
// ********************************************************************************************************************************** //

RecruitUnitContentService.prototype.createComparison = function(req, jsondata, doctitle, func_callback){
  console.log("in RecruitUnitContentService, createComparison");
  console.log(req.body);

  var returnSuccess = null;

  async.series({
      authToken: function(callback){
        _authUtils.authenticateToken(req, function(err, result){
          //console.log("authToken result:");
          //console.log(result);
          returnSuccess = result;
          callback(err, result);
        });
      },
      createArticle: function(callback){
        var articleModelAuth = ComparisonTestModel(returnSuccess.cookie);
        articleModelAuth.create(req.body, function(err, result){
          if(!err){
            console.log("RecruitUnitContentService createComparison: success");
            console.log(result);
            var successReturn = { //ensure succees param returned to client
              data: result,
              success: true
            };
            callback(null, successReturn);
          }else{
            console.log("error");
            callback(err, null);
          }
        });

      }
    },
    function(err, results) {
      console.log(results);
      func_callback(err, results.createArticle);
    });
};

RecruitUnitContentService.prototype.compare = function(sourceDocId, comparisonDocId, func_callback){
  console.log("in RecruitUnitContentService, compare");
  //make sure JSON structure in sourceDocId matches specified elements in comparisonDocId.
  //then return JSON report for each element which matches saying if it is greater, less or equal to the source
  
};

///////  Private Functions /////////
function assertGreaterThan(sourceValue, comparisonValue){
  return sourceValue > comparisonValue;  
}

function assertLessThan(sourceValue, comparisonValue){
  return sourceValue < comparisonValue;
}

function assertEqualTo(sourceValue, comparisonValue){
  return sourceValue === comparisonValue;
}

exports.Service = new RecruitUnitContentService;






