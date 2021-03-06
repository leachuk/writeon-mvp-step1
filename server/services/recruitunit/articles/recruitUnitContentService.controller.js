'use strict';

var appDir = require('path').dirname(require.main.filename);

var _ = require('lodash');
var config = require(appDir + '/config/environment');
var dbNameArticles = config.dbNameArticles;
var constants = require(appDir + '/config/constants');
var async = require('async');

var BadJSONError = require(appDir + '/services/errors/badJSONError');

var couchDbHandlers = require(appDir + '/services/couchDbHandler/couchDbHandler.controller');
var couchService = couchDbHandlers.Service;

var recruitUnitUtility = require(appDir + '/services/recruitunit/utils/recruitUnitUtilityService.controller');
var recruitUnitUtils = recruitUnitUtility.Service;
var recruitUnitUserService = require(appDir + '/services/recruitunit/users/recruitUnitUserService.controller');
var recruitUnitUserUtils = recruitUnitUserService.Service;

//var UserModel = require(appDir + '/models/User');
var ContentItemModel = require(appDir + '/models/RecruitUnit.Job.All.js');
//var ContentItemListPartialModelConverter = require(appDir + '/models/RecruitUnit.Job.Partial.js');
var ComparisonTestModel = require(appDir + '/models/RecruitUnit.ComparisonTest.js');

var _dbUtils = require(appDir + '/services/dbUtils/dbUtils.controller').DbUtils;
var _authUtils = require(appDir + '/services/authUtils/authUtils.controller').AuthUtils;

function RecruitUnitContentService(){};

// ********************************************************************************************************************************** //
//
// Article and Content Services
//
// ********************************************************************************************************************************** //

RecruitUnitContentService.prototype.createArticle = function(req, func_callback){
	console.log("in RecruitUnitContentService, createArticle");
	console.log(req.body);

  var Model = require(appDir + req.param('modelType'));

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
  var Model = require(appDir + modelPath); //def needed (should refactor so consistent. Get from req modelType), passed in from other functions, eg in getTestSourceAndComparisonDocuments
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

//Todo: Deprecate. Should use jugglingDb model
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

RecruitUnitContentService.prototype.updateArticle = function(req, func_callback) {
	var returnSuccess = null;
	var articleUpdateModel = null;
	//var dbtable = dbNameArticles;

	var id = req.param("id");
  var Model = require(appDir + req.param("modelType"));
  var updateData = req.param("updateData");

	console.log("updateData");
	console.log(req.param("updateData"));
	console.log(typeof req.param("updateData"))
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

  var Model = require(appDir + req.param('modelType'));
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

  var Model = require(appDir + '/models/RecruitUnit.Job.All.js');
  var ComparisonRulesModel = require(appDir + '/models/RecruitUnit.ComparisonTest.js');
  var userEmail = req.param('authorEmail');
  var requestParams = req.query;
  var getAllData = requestParams.getAllData;
  var authCookie;

  try {
    var searchJson = JSON.parse(req.param('searchJson'));
  } catch(e) {
    throw new BadJSONError(constants.error.BAD_JSON_INPUT, e.stack);
  }
  searchJson.published = true;
  var comparisonDocListArray = [];

  async.waterfall([
    authToken,
    search,
    getUserEmailFromGuid,
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
    articleModelAuth.all({where: searchJson}, function(err, searchresults){
      if(!err){
        console.log("success result");
        callback(null, searchresults);
      }else{
        console.log("articleModelAuth error");
        callback(err, null);
      }
    });
  }
  function getUserEmailFromGuid(userDocResults, callback){
    if (userDocResults.length > 0){
      recruitUnitUserUtils.getUserFromGuidNoAuth(userDocResults[0].submitTo, function(err, result){
        if(!err){
          callback(null, userDocResults, result.data.email);
        }else{
          console.log(err);
        }
      });
    } else {
      callback(new Array()); //the first callback param returns error. Return empty array.
    }
  }
  function getComparisonRulesDocs(userDocResults, userEmail, callback){
    console.log("RecruitUnitContentService getUserTestResults > getComparisonRulesDocs");
    async.each(userDocResults, function(value, callback) { //loop over userDocResults
      //get users unique comparison document
      var comparisonRulesModelAuth = ComparisonRulesModel(authCookie, {returnAll: true});
      var comparisonSearchJson = '{"authorEmail": "' + userEmail + '"}';
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
      callback(null, userEmail, userDocResults, uniqueComparisonDocListArray);
    });
  }
  function injectTestResults(userEmail, testSearchResults, comparisonDocSearchResults, callback){
    console.log("RecruitUnitContentService getUserTestResults > injectTestResults");

    var testResult = [];

    async.each(testSearchResults, function(testDocItem, callback) {
      var comparisonJsonArray = [];
      for(var i=0; i < comparisonDocSearchResults.length; i++){
        comparisonJsonArray.push(comparisonDocSearchResults[i].toJSON());//convert from model schema object to JSON object for lodash
      }
      var comparisonJson = _.find(comparisonJsonArray,{ 'authorEmail': userEmail })
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

RecruitUnitContentService.prototype.createJobSubmission = function(req, func_callback){
  console.log("in RecruitUnitContentService, createJobSubmission");
  console.log(req.body);

  var JobModel = require(appDir + "/models/RecruitUnit.Job.All.js");

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
        var articleModelAuth = JobModel(returnSuccess.cookie);
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
            console.log("createArticle error");
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

RecruitUnitContentService.prototype.toggleDevEmailDisplay = function(req, func_callback) {
  console.log("in RecruitUnitContentService, toggleDevEmailDisplay");

  var _this = this;
  var currentDisplayDevEmail = null;
  req.params.modelType = '/models/RecruitUnit.Job.All.js'; //appDir is appended in subsequent calls
  req.params.updateData = null;

  async.series({
      getCurrentDisplayDevEmail: function(callback){
        _this.getArticle(req, req.params.modelType, function(err, result){
          if (!err){
            currentDisplayDevEmail = result.displayDevEmail;
            callback(err, result);
          } else {
            callback(err, result);
          }
        });
      },
      updateDisplayDevEmail: function(callback){
        req.params.updateData = { displayDevEmail: !currentDisplayDevEmail };
        _this.updateArticle(req, function(err, result){
          if (!err){
            callback(err, result);
          } else {
            callback(err, result);
          }
        });
      }
    },
    function(err, result) {
      //console.log("toggleDevEmailDisplay results");
      //console.log(result);
      func_callback(err, { "displayDevEmail": result.updateDisplayDevEmail.data.displayDevEmail });
    });
}

//support for couchdb2.0 mango query which was added to nano
RecruitUnitContentService.prototype.find = function(req, func_callback){
  console.log("in RecruitUnitContentService find");
  console.log(req.body);

  var returnSuccess = null;

  //todo: Need to wrap this in an authenticateToken function so only authenticated users can run queries against their own documents
  //currently this is open to allow anyone to query the whole db!
  req.body = JSON.stringify(req.body)
  couchService.find(req, function(err, body){
    if(!err){
      console.log("success result");
      //console.log(body);
      var jsonBody = JSON.parse(JSON.stringify(body));

      func_callback(null, jsonBody);
    }else{
      console.log("articleModelAuth error");

      func_callback(err, null);
    }
  });
};

// ********************************************************************************************************************************** //
//
// Comparison Services
//
// ********************************************************************************************************************************** //

RecruitUnitContentService.prototype.getTestSourceAndComparisonDocuments = function(req, func_callback) {
  console.log("in RecruitUnitContentService, getTestSourceAndComparisonDocuments");
  console.log(req.body);

  var _this = this; //so we can re-use internal prototype functions
  var sourceTestModelPath = appDir + "/models/RecruitUnit.ComparisonTest.js";
  var comparisonModelPath = appDir + "/models/RecruitUnit.Job.All.js";
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
            callback(err, result);//shouldn't these two callbacks be different
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

RecruitUnitContentService.prototype.getDevJobRequirementsFromRecruiterJobSpec = function(req, func_callback) {
  var returnAuthSuccess = null;
  var jobDescriptionResults = null;
  var selectorResults = null;

  async.series({
      authToken: function(callback){
        _authUtils.authenticateToken(req, function(err, result){
          returnAuthSuccess = result;
          callback(err, result);
        });
      },
      getJobDescriptionDocResults: function(callback){
        recruitUnitUtils.getJobDescriptionSpecDocs(returnAuthSuccess.username, returnAuthSuccess.cookie, function(err, results){
          if(!err){
            //console.log(results);
            jobDescriptionResults = results;
            callback(null, jobDescriptionResults);
          } else {
            console.log(err);
            callback("getJobDescriptionDocResults error", null);
          }
        });
      },
      getJobSpecsSearchSelector: function(callback){
        recruitUnitUtils.getMangoSelectorFromJobItem(jobDescriptionResults, function(err, result){
          if(!err){
            console.log(null, result);
            // for(var i=0; i < result.length; i++){
            //   console.log(jobDescriptionResults[i].id);
            //   _.assignIn(result[i], JSON.parse("{\"jobSpecDocId\":\"" + jobDescriptionResults[i].id + "\"}"));
            // }
            selectorResults = result;
            callback(null, result);
          } else {
            console.log(err, null);
            callback(err, null);
          }
        })
      },
      searchJobSpecs: function(callback){
        async.times(selectorResults.length, function(n, next) {
          req.body = selectorResults[n];

          couchService.find(req, function(err, body){
            if(!err){
              console.log("success searchJobSpecs n=" + n);
              _.forEach(body, function(item) {
                delete item.authorEmail ///remove personal info before returning to client
              });
              if (body.length > 0) {
                var jsonBody = JSON.parse(JSON.stringify(body));
                var combined = {};
                combined.jobSpec = _.find(jobDescriptionResults, {"id": JSON.parse(selectorResults[n]).jobSpecDocId});
                combined.searchResult = jsonBody;
                next(null,combined);
              }else{
                next();
              }
            }else{
              console.log("articleModelAuth error");
              callback(err, null);
            }
          });
        }, function(err, searchResultsTotal) {
          var filteredResults = _.pull(searchResultsTotal,undefined); //remove undefined from array
          func_callback(err, filteredResults);
        });
      }
    },
    function(err, results) {
      //console.log(results);
      func_callback(err, results.returnSearchResults);
    });
}

RecruitUnitContentService.prototype.getRecruiterJobSpecFromDevJobRequirements = function(req, func_callback) {
  var returnAuthSuccess = null;
  var jobDescriptionResults = null;
  var selectorResults = null;

  async.series({
      authToken: function(callback){
        _authUtils.authenticateToken(req, function(err, result){
          returnAuthSuccess = result;
          callback(err, result);
        });
      },
      getComparisonDocResults: function(callback){
        recruitUnitUtils.getComparisonTestDocs(returnAuthSuccess.username, returnAuthSuccess.cookie, function(err, results){
          if(!err){
            console.log("getRecruiterJobSpecFromDevJobRequirements > getComparisonTestDocs:")
            console.log(results);
            jobDescriptionResults = results;
            if (jobDescriptionResults.length == 0){
              func_callback(null, []);
            } else {
              callback(null, jobDescriptionResults);
            }
          } else {
            console.log(err);
            callback("getComparisonTestDocs error", null);
          }
        });
      },
      getJobSpecsSearchSelector: function(callback){
        recruitUnitUtils.getMangoSelectorFromJobItem(jobDescriptionResults, function(err, result){
          if(!err){
            console.log(null, result);
            // for(var i=0; i < result.length; i++){
            //   console.log(jobDescriptionResults[i].id);
            //   _.assignIn(result[i], JSON.parse("{\"jobSpecDocId\":\"" + jobDescriptionResults[i].id + "\"}"));
            // }
            selectorResults = result;
            callback(null, result);
          } else {
            console.log(err, null);
            callback(err, null);
          }
        })
      },
      searchJobSpecs: function(callback){
        async.times(selectorResults.length, function(n, next) {
          req.body = selectorResults[n];

          couchService.find(req, function(err, body){
            if(!err){
              console.log("success searchJobSpecs n=" + n);
              _.forEach(body, function(item) {
                delete item.authorEmail ///remove personal info before returning to client
              });
              if (body.length > 0) {
                var jsonBody = JSON.parse(JSON.stringify(body));
                var combined = {};
                combined.jobSpec = _.find(jobDescriptionResults, {"id": JSON.parse(selectorResults[n]).jobSpecDocId});
                combined.searchResult = jsonBody;
                next(null,combined);
              }else{
                next();
              }
            }else{
              console.log("articleModelAuth error");
              callback(err, null);
            }
          });
        }, function(err, searchResultsTotal) {
          var filteredResults = _.pull(searchResultsTotal,undefined); //remove undefined from array
          func_callback(err, filteredResults);
        });
      }
    },
    function(err, results) {
      //console.log(results);
      func_callback(err, results.returnSearchResults);
    });
}

RecruitUnitContentService.prototype.getDevComparisonTestDocs = function(req, func_callback) {
  var returnAuthSuccess = null;

  async.series({
      authToken: function(callback){
        _authUtils.authenticateToken(req, function(err, result){
          returnAuthSuccess = result;
          callback(err, result);
        });
      },
      getComparisonTestDocs: function(callback){
        recruitUnitUtils.getComparisonTestDocs(returnAuthSuccess.username, returnAuthSuccess.cookie, function(err, results){
          if(!err){
            console.log("getDevComparisonTestDocs > getComparisonTestDocs:")
            console.log(results);

            func_callback(null, results);
          } else {
            console.log(err);
            func_callback("getComparisonTestDocs error", null);
          }
        });
      }
    },
    function(err, results) {
      console.log(results);
      func_callback(err, "getDevComparisonTestDocs temp result");
    });
}

exports.Service = new RecruitUnitContentService;






