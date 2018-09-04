'use strict';

// ******* This is the sample handler, which uses the 'Article' model. ******** //
// ******* Each application will have it's own, which in turn calls the specific app model ****** //
var appDir = require('path').dirname(require.main.filename);

var _ = require('lodash');
var config = require(appDir + '/config/environment');
var couchnano = require("nano")(config.couchuri);
var dbNameArticles = config.dbNameArticles;
var async = require('async');

var UserModel = require(appDir + '/models/User');
var ArticleModel = require(appDir + '/models/Article');

var _dbUtils = require(appDir + '/services/dbUtils/dbUtils.controller').DbUtils;
var _authUtils = require(appDir + '/services/authUtils/authUtils.controller').AuthUtils;

function CouchDBService(){};

CouchDBService.prototype.asyncTest = function(value1, value2, func_callback){
	console.log("in async test");
	async.series({
	    one: function(callback){
	        setTimeout(function(){
	            callback(null, 1);
	        }, 200);
	    },
	    two: function(callback){
	        setTimeout(function(){
	            callback(null, 2);
	        }, 100);
	    }
	},
	function(err, results) {
	    // results is now equal to: {one: 1, two: 2}
	    console.log(results);
	    func_callback(results);
	});
};

// ********************************************************************************************************************************** //
//
// User and Authentication Services
//
// ********************************************************************************************************************************** //

CouchDBService.prototype.createNewUser = function(req, func_callback){
//When a user signs up, create the user
	var couchadmin = require("nano")(config.couchuriadmin);
	var dbname = dbNameArticles;
	var returnMessage = {};
  var appkey = req.body.key;

	//console.log("createNewUser: dbname["+ dbname +"], useremail["+ useremail +"], userpassword["+ userpassword +"]");

  this.isValidAppKey(appkey, req, function(err, isValidKeyResult){
    console.log("isValidAppKey:" + isValidKeyResult);

    if (isValidKeyResult){
      async.series({
          createUser: function(callback){
            //create user in _users table

            var userModel = UserModel(req.body, {});

            //var _users = couchadmin.use("_users");
            //var json = {"_id":"org.couchdb.user:" + useremail,"name":useremail,"roles":[],"type":"user","password":userpassword};
            //_users.insert(json, "", function(error, body, headers){
            req.body.name = req.body.email; //couchdb requirement
            req.body.id = "org.couchdb.user:" + req.body.email; //couchdb requirement. the name part of _id and the name field must match.
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

CouchDBService.prototype.getUser = function(req, username, func_callback){
  console.log("couchdb service getUser, username: " + username);

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
            console.log("CouchDBService getUser: success");
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

//used in signin method, at server/api/user/user.controller.js
CouchDBService.prototype.getUserNoAuthentication = function(req, username, func_callback){
  console.log("couchdb service getUserNoAuthentication, username: " + username);

  async.series({
      getUser: function(callback){
        //check the requested username is the authenticated user. May need to change, but should provide sufficient security
        //if (returnAuthToken.username == username) {
        var userModelAuth = UserModel(null, null);
        userModelAuth.find("org.couchdb.user:" + username, function (err, result) {
          if (!err) {
            console.log("CouchDBService getUser: success");
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

//Allow an authenticated user to check if another user exists.
//Use: A recruiter wants to view and submit a developers form at /developer/<dev userid>. This confirms the form is valid.
CouchDBService.prototype.isUserValid = function(req, username, func_callback){
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

CouchDBService.prototype.authenticate = function(username, password, callback){
	var username = username;
	var password = password;
	console.log("username:" + username);
	couchnano.auth(username, password, function (err, body, headers) {
		console.log("in couchnano.auth");
		//console.log(body);
		if (!err) {
			console.log(headers);
		}else{
			console.log(err);
			//return err.message;
		}

		if (headers && headers['set-cookie']) {
		//cookies[user] = headers['set-cookie'];
		}

		callback(err, body, headers);
	});
};

CouchDBService.prototype.isValidUser = function(req, username, func_callback){
  console.log("couchdb service isValidUser, username: " + username);

  var returnAuthToken = null;
  //Todo: fix this up to work with _users.get below.
  async.series({
      authToken: function(callback){
        _authUtils.authenticateToken(req, function(err, result){
          //console.log("authToken result:");
          //console.log(result);
          returnAuthToken = result; //decoded json token
          callback(err, result);
        });
      },
      isUserValid: function(callback){
          //create an authUtils service which checks the requested user exists. Return true/false
      }
    },
    function(err, results) {
      console.log("getUser results:");
      console.log(results);
      func_callback(err, results.getUser);
    });
};
// ********************************************************************************************************************************** //
//
// Article and Content Services
//
// ********************************************************************************************************************************** //

//Todo: refactor to remove unnecessary method params 'jsondata, doctitle'
CouchDBService.prototype.createArticle = function(req, jsondata, doctitle, func_callback){
	console.log("in CouchDBService, saveArticle");
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
        var articleModelAuth = ArticleModel(returnSuccess.cookie);
        articleModelAuth.create(req.body, function(err, result){
          if(!err){
            console.log("CouchDBService createArticle: success");
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

CouchDBService.prototype.getArticle = function(req, func_callback){
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

CouchDBService.prototype.deleteArticle = function(req, func_callback){
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

CouchDBService.prototype.listAllUserArticles = function(req, username, func_callback){
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
CouchDBService.prototype.listMyArticles = function(req, func_callback){
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
	  //   	var couchsetup = require("nano")({ url : config.couchuri, cookie: returnSuccess.cookie});
	  //   	console.log("listMyArticles: returnSuccess");
	  //   	console.log(returnSuccess.cookie);
	  //   	console.log(returnSuccess.username);
			// var couchDb = couchsetup.use(dbtable);
			// //list can only return ALL documents or those with the key match. Cannot be queried, this requires a design doc.
			// //http://wiki.apache.org/couchdb/Formatting_with_Show_and_List
			// couchDb.list({include_docs: true, key:"Test Article 7"},function(err, body) {
			// 	if (!err) {
			// 		// body.rows.forEach(function(doc) {
			// 		//   listResultArray.push(doc);
			// 		//   console.log(doc);
			// 		// });
			// 		callback(null, body);
			// 		console.log(body);
			// 	}else{
			// 		callback(err, null);
			// 		console.log(err);
			// 	}
			// });
	    	console.log("CouchDBService listMyArticles: returnSuccess");
	    	console.log(returnSuccess.cookie);
	    	console.log(returnSuccess.username);
			var articleModelAuth = ArticleModel(returnSuccess.cookie, {returnAll: getAllData});
			articleModelAuth.all({where:{authorName: returnSuccess.username}}, function(err, body){
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
	    func_callback(err, results.listMyArticles);
	});
};

// CouchDBService.prototype.updateArticle = function(username, docname, fieldparam, valueparam, callback) {
// //change to batch field/param update. looks like an array of json objects can be passed.
// 	var dbtable = dbNameArticles;
// 	var db = couchnano.use(dbtable);
//     console.log("node params. docname["+ docname +"], field["+ fieldparam +"], value["+ valueparam +"]");
//     var returnbody = null;
//     db.atomic("example",
//         "in-place",
//         docname,
//         [{field: fieldparam, value: valueparam},{field: "field2", value: "field2foo"}],
//         function (err, body) {
//             if (!err) {
//                 console.log(body);
//             }else{
//                 console.log(err);
//             }

//             callback(err, body);
//         });

// };

CouchDBService.prototype.updateArticle = function(req, func_callback) {
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

CouchDBService.prototype.insertArticle = function(username, docname, field, value, callback) {
	var dbtable = dbNameArticles;
	var db = couchnano.use(dbtable);
	var json = {fieldfoo: value};

	db.insert(json, docname, function (err, body) {
    if(!err) {
    	console.log(body);
    } else {
		console.log(err);
    }
    // db.insert({foo: "bar", "_rev": body.rev}, "foobar",
    // function (error, response) {
    //   if(!error) {
    //     console.log("it worked");
    //   } else {
    //     console.log("sad panda");
    //   }
    // });
    callback(err, body);
  });
};

CouchDBService.prototype.testCookie = function(req, res, func_callback) {
	console.log("In testCookie");
	var clientip = req.ip;
	var returnSuccess = null;
	var returnError = null;

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(req, function(err, result){
		    	//console.log("authToken result:");
		    	//console.log(result);
		    	returnSuccess = result;
		    	callback(err, result);
		    });
	    },
	    getSessionWithCookie: function(callback){
	    	console.log("getSessionWithCookie result:");
	    	console.log(returnSuccess.cookie);
			var couchsetup = require("nano")({ url : config.couchuri, cookie: returnSuccess.cookie});
			var returnSuccess2 = null;
			var returnError2 = null;
			couchsetup.session(function(err, session) {
				if (!err) {
					returnSuccess2 = session;
					console.log(session);
					console.log('user is %s and has these roles: %j',
						session.userCtx.name, session.userCtx.roles);

					callback(returnError2, returnSuccess2);
				} else {
					returnError2 = err;
				}
			});
	    }
	},
	function(err, results) {
	    // results is now equal to: {one: 1, two: 2}
	    console.log(results);
	    func_callback(err, results);
	});
};

CouchDBService.prototype.isValidAppKey = function(key, req, func_callback) {
  console.log("In isValidAppKey");
  var couchadmin = require("nano")(config.couchuriadmin);

  var token = null;
  var clientip = req.ip;
  var host = req.headers.host;
  console.log("current client ip: " + clientip);
  console.log("current hostname: " + host);

  var returnSuccess = null;
  var returnError = null;

  async.series({
      checkKey: function(callback){
        var _projectFiles = couchadmin.use(config.dbNameProjects);
        _projectFiles.get("recruitUnit-project", {}, function(err, body) { //TODO:recruitUnit-project should be passed in. Stored in couchdb.
          if(!err) {
            console.log(body);
            var appKey = body.key;
            var appHost = body.validHosts; //host can be easily spoofed in /etc/hosts. Also using IP
            var appIp = body.validIps;
            var isEnabled = body.isEnabled;
            //until I can find a way to do this properly, I'm relaxing the conditions here. The JWT and appKey should suffice for security and control
            //if (appKey == key && host.indexOf(appHost) != -1 && appIp.indexOf(clientip) != -1 && isEnabled){
            if (appKey == key && isEnabled){
              var returnMessage = {
                "success": true
              }
              callback(null,returnMessage);
            } else {
              var returnMessage = {
                "success": false,
                "message": "missing or invalid application key"
              }
              callback(returnMessage,null);
            }
          } else {
            var returnMessage = {
              success: false,
              message: err
            }
            callback(returnMessage, null);
          }
        });
      }
  },
  function(err, results) {
    func_callback(err, results.checkKey);
  });
};

//wrapper for nano find which enables mango query support
//Note: mango queries may have performance issues with large data sets. Also create map/reduce version.
CouchDBService.prototype.find = function(req, func_callback){
  var returnSuccess = null;
  var dbtable = dbNameArticles;
  var db = couchnano.use(dbtable);

  var selector = req.body;

  async.series({
      authToken: function(callback){
        _authUtils.authenticateToken(req, function(err, result){
          returnSuccess = result;
          callback(err, result);
        });
      },
      find: function(callback){
        //probably need to use admin version
        var selectorJson = JSON.parse(selector);
        db.find(_.omit(selectorJson,"jobSpecDocId"), function (err, body) {
          console.log("in couchnano.find");
          if (!err) {
            console.log(body);
          }else{
            console.log(err);
          }
          callback(err, body);
        });
      }
    },
    function(err, results) {
      console.log(results);
      func_callback(err, results.find.docs);
    });
};

exports.Service = new CouchDBService;






