'use strict';

require('rootpath')()
var _ = require('lodash');
var config = require('server/config/environment');
//var couchnano = require("nano")(config.couchuri);
var dbNameArticles = config.dbNameArticles;
var async = require('async');

var couchDbHandlers = require('server/services/couchDbHandler/couchDbHandler.controller');
var couchService = couchDbHandlers.Service;

var recruitUnitUtils = require('server/services/recruitunit/utils/RecruitUnitUtilityService.controller').Service;

//var UserModel = require('server/models/User');
var ContentItemModel = require('server/models/RecruitUnit.Job.All.js');
//var ContentItemListPartialModelConverter = require('server/models/RecruitUnit.Job.Partial.js');
var ComparisonTestModel = require('server/models/RecruitUnit.ComparisonTest.js');

var _dbUtils = require('server/services/dbUtils/dbUtils.controller').DbUtils;
var _authUtils = require('server/services/authUtils/authUtils.controller').AuthUtils;

function RecruitUnitContentService(){};

// ********************************************************************************************************************************** //
//
// Article and Content Services
//
// ********************************************************************************************************************************** //

RecruitUnitContentService.prototype.createArticle = function(req, func_callback){
	console.log("in RecruitUnitContentService, createArticle");
	console.log(req.body);

  var Model = require(req.param('modelType'));

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
			var articleModelAuth = Model(returnSuccess.cookie);
			articleModelAuth.create(req.body, function(err, result){
        if(!err){
          console.log("RecruitUnitContentService createArticle: success");
          console.log(result);
          var successReturn = { //ensure success param returned to client
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

RecruitUnitContentService.prototype.getArticle = function(req, modelPath, func_callback){
	var returnSuccess = null;
  var Model = require(modelPath); //def needed (should refactor so consistent. Get from req modelType), passed in from other functions, eg in getTestSourceAndComparisonDocuments
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
			var docModel = Model(returnSuccess.cookie, {returnAll: getAllData});
        docModel.find(id, function(err, body){
				if(!err){
					console.log("success result");
					//console.log(body);
          var jsonBody = JSON.parse(JSON.stringify(body));

					callback(null, jsonBody);
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

//not used.
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
        articleModelAuth.all({where:{submitTo: returnSuccess.username}}, function(err, body){
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

RecruitUnitContentService.prototype.listMyTestContent = function(req, func_callback){
  //var listResultJson = null;
  var listResultArray = [];
  var _this = this;

  var requestParams = req.query;
  var getAllData = requestParams.getAllData;

  var comparisonDocId = req.param('comparisonRulesDocId');

  async.waterfall([
        authenticate,
        listMyArticles,
        getTestAndComparisonResults,
        appendComparisonResultsToArticleList,
  ],function (err, result) {
    // result now equals result of last run function
  });
  function authenticate(callback){
    _authUtils.authenticateToken(req, function(err, result){
      //console.log("authToken result:");
      //console.log(result);
      callback(null, result) //first callback param always reserved for error callbacks
    });
  }
  function listMyArticles(returnSuccess, callback){
    console.log("RecruitUnitContentService listMyTestContent: returnSuccess");
    console.log(returnSuccess.cookie);
    console.log(returnSuccess.username);
    var articleModelAuth = ContentItemModel(returnSuccess.cookie, {returnAll: getAllData});
    articleModelAuth.all({where:{submitTo: returnSuccess.username, published: true}}, function(err, body){
      if(!err){
        console.log("success result");
        listResultArray = body; //listResultArray used later for combining with test results
        callback(null, listResultArray);
      }else{
        console.log("articleModelAuth error");
        callback(err, null);
      }
    });
  }
  function getTestAndComparisonResults(articleList, callback){
    var testSourceAndComparisonDocList = [];
    async.each(articleList, function(value, callback) {
      //console.log(value);
      req.params.testsourceid = comparisonDocId;
      req.params.comparisonid =  value.id;

      _this.getTestSourceAndComparisonDocuments(req, function(err, result){
        if (!err){
          //console.log(result);
          testSourceAndComparisonDocList.push(result);
          callback();
        } else {
          console.log(err);
          res.send(err);
        }
      });
    }, function (err) {
      if (err) { callback(err, null); }
      callback(null, testSourceAndComparisonDocList);
    });
  }
  function appendComparisonResultsToArticleList(comparisonAndTestList, callback) {
    var testResult = [];

    async.each(comparisonAndTestList, function(value, callback) {
        recruitUnitUtils.compare(value.getTestSourceDoc, value.getComparisonDoc, function (err, result) {
          console.log("compare results:")
          //console.log(result);
          // _.forEach(result, function (value, key) {
          //   console.log("key[" + key + "], rule[" + value.rule + "], result[" + value.result + "]");
          // });
          if (!err) {
            //console.log(result);
            //callback(null, result);
            testResult.push(result);
            callback();
          } else {
            console.log(err);
            callback(err, null);
          }
        });
    }, function (err) {
      if (err) { callback(err, null); }

      var combinedTestResultWithDocList = [];
      for (var i=0; i < listResultArray.length; i++){
        var testResultItem = _.find(testResult,['docId',listResultArray[i].id]);
        combinedTestResultWithDocList.push({"document": listResultArray[i], "testResult": testResultItem});
      }
      console.log(combinedTestResultWithDocList);
      func_callback(null, combinedTestResultWithDocList);
    });
  }

};



RecruitUnitContentService.prototype.updateArticle = function(req, func_callback) {
	var returnSuccess = null;
	var articleUpdateModel = null;
	//var dbtable = dbNameArticles;

	var id = req.param("id");
  var Model = require(req.param("modelType"));

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
			var articleModelAuth = Model(returnSuccess.cookie, {returnAll: true});
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
					console.log("updateArticle success");
					//console.log(body);
          var successReturn = { //ensure succees param returned to client
            data: body,
            success: true
          };
					callback(null, successReturn);
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

//find articles which match input json parameters
RecruitUnitContentService.prototype.search = function(req, func_callback){
  //var listResultJson = null;
  //var listResultArray = [];
  var returnSuccess = null;

  var Model = require(req.param('modelType'));
  var searchJson = req.param('searchJson');
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
      search: function(callback){
        console.log("RecruitUnitContentService search: returnSuccess");
        console.log(returnSuccess.cookie);
        console.log(returnSuccess.username);
        var articleModelAuth = Model(returnSuccess.cookie, {returnAll: getAllData});
        articleModelAuth.all({where: JSON.parse(searchJson)}, function(err, searchresults){
          if(!err){
            console.log("success result");
            //optional todo: convert list of full article model to a partial model

            callback(null, searchresults);
          }else{
            console.log("articleModelAuth error");
            callback(err, null);
          }
        });
      }
    },
    function(err, results) {
      console.log(results);
      func_callback(err, results.search);
    });
};

//get test results for specified user and inject the result into the return data
RecruitUnitContentService.prototype.getUserTestResults = function(req, func_callback){
  //var listResultJson = null;
  //var listResultArray = [];
  var returnSuccess = null;
  var _this = this; //so we can re-use internal prototype functions

  var Model = require(req.param('modelType'));
  var ComparisonRulesModel = require('server/models/RecruitUnit.ComparisonTest.js');
  var userEmail = req.param('authorEmail');
  var requestParams = req.query;
  var getAllData = requestParams.getAllData;

  var authCookie;
  var searchJson = '{"authorEmail": "' + userEmail + '"}';
  var comparisonDocListArray = [];

  async.waterfall([
    authToken,
    search,
    getComparisonRulesDocs,
    injectTestResults
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
  function search(returnSuccess, callback){
    console.log("RecruitUnitContentService getUserTestResults>search");
    console.log(authCookie);
    console.log(returnSuccess.username);
    var articleModelAuth = Model(authCookie, {returnAll: getAllData});
    articleModelAuth.all({where: JSON.parse(searchJson)}, function(err, searchresults){
      if(!err){
        console.log("success result");
        callback(null, searchresults);
      }else{
        console.log("articleModelAuth error");
        callback(err, null);
      }
    });
  }
  function getComparisonRulesDocs(userDocResults, callback){
    console.log("RecruitUnitContentService getUserTestResults > getComparisonRulesDocs");

    var testSourceAndComparisonDocList = [];
    async.each(userDocResults, function(value, callback) {
      //get users unique comparison document
      var comparisonRulesModelAuth = ComparisonRulesModel(authCookie, {returnAll: true});
      var comparisonSearchJson = '{"authorEmail": "' + value.submitTo + '"}';
      comparisonRulesModelAuth.all({where: JSON.parse(comparisonSearchJson)}, function (err, comparisonDocResults) {
        if (!err) {
          console.log("comparisonRulesModelAuth success result");
          if (comparisonDocResults.length > 0) {
            comparisonDocListArray.push(comparisonDocResults[0]);//force return first item in case there are multiple comparison documents returned
          }
          callback();
        } else {
          console.log("articleModelAuth error");
          callback(err, null);
        }
      });
    }, function (err) {
      if (err) { callback(err, null); }
      var uniqueComparisonDocListArray = _.uniqBy(comparisonDocListArray, 'authorName');
      callback(null, userDocResults, uniqueComparisonDocListArray);
    });
  }
  function injectTestResults(testSearchResults, comparisonDocSearchResults, callback){
    console.log("RecruitUnitContentService getUserTestResults > injectTestResults");

    var testResult = [];

    async.each(testSearchResults, function(testDocItem, callback) {
      var comparisonJsonArray = [];
      for(var i=0; i < comparisonDocSearchResults.length; i++){
        comparisonJsonArray.push(comparisonDocSearchResults[i].toJSON());//convert from model schema object to JSON object for lodash
      }
      var comparisonJson = _.find(comparisonJsonArray,{ 'authorEmail': testDocItem.submitTo })
      if (comparisonJson !== undefined) {
        recruitUnitUtils.compare(comparisonJson, testDocItem.toJSON(), function (err, result) {
          // console.log("compare results:")
          // console.log(result);
          // _.forEach(result, function (value, key) {
          //   console.log("key[" + key + "], rule[" + value.rule + "], result[" + value.result + "]");
          // });
          if (!err) {
            //console.log(result);
            //callback(null, result);
            testResult.push(result);
            callback();
          } else {
            console.log(err);
            callback(err, null);
          }
        });
      } else {
        callback();
      }
    }, function (err) {
      if (err) { callback(err, null); }

      var combinedTestResultWithDocList = [];
      for (var i=0; i < testSearchResults.length; i++){
        var testResultItem = _.find(testResult,['docId',testSearchResults[i].id]);
        combinedTestResultWithDocList.push({"document": testSearchResults[i], "testResult": testResultItem});
      }
      console.log(combinedTestResultWithDocList);
      callback(null, combinedTestResultWithDocList);
    });
  }

}

// ********************************************************************************************************************************** //
//
// Comparison Services
//
// ********************************************************************************************************************************** //

RecruitUnitContentService.prototype.getTestSourceAndComparisonDocuments = function(req, func_callback) {
  console.log("in RecruitUnitContentService, getTestSourceAndComparisonDocuments");
  console.log(req.body);

  var _this = this; //so we can re-use internal prototype functions
  var sourceTestModelPath = "server/models/RecruitUnit.ComparisonTest.js";
  var comparisonModelPath = "server/models/RecruitUnit.Job.All.js";
  var testSourceDocId = req.param("testsourceid"); //the document which contains the comparison test rules and values
  var comparisonDocId = req.param("comparisonid"); //the submitted recruiters document
  //console.log("testSourceDocId:" + testSourceDocId);
  //console.log("comparisonDocId:" + comparisonDocId);

  //get the source and comparison json
  async.series({
      getTestSourceDoc: function(callback){
        req.params.id = testSourceDocId;
        _this.getArticle(req, sourceTestModelPath, function(err, result){
          if (!err){
            callback(err, result);
          } else {
            callback(err, result);
          }
        });
      },
      getComparisonDoc: function(callback){
        req.params.id = comparisonDocId;
        _this.getArticle(req, comparisonModelPath, function(err, result){
          if (!err){
            callback(err, result);
          } else {
            callback(err, result);
          }
        });
      }
    },
    function(err, result) {
      console.log("getting source and comparison doc results");
      //console.log(result);
      func_callback(err, result);
    });

}

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


exports.Service = new RecruitUnitContentService;






