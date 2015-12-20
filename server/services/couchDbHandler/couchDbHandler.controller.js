'use strict';

// ******* This is the sample handler, which uses the 'Article' model. ******** //
// ******* Each application will have it's own, which in turn calls the specific app model ****** //
require('rootpath')()
var _ = require('lodash');
var config = require('server/config/environment');
var couchnano = require("nano")(config.couchuri);
var dbNameArticles = config.dbNameArticles;
var async = require('async');

var UserModel = require('server/models/User');//old model, not used
var UserJdbModel = require('server/models/UserJdb');//current jugglingdb model. obv rename once working.
var ArticleModel = require('server/models/Article');

var _dbUtils = require('server/services/dbUtils/dbUtils.controller').DbUtils;
var _authUtils = require('server/services/authUtils/authUtils.controller').AuthUtils;

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

	//console.log("createNewUser: dbname["+ dbname +"], useremail["+ useremail +"], userpassword["+ userpassword +"]");

	async.series({
	    createUser: function(callback){
	    	//create user in _users table

        var userModel = UserJdbModel();

        //var _users = couchadmin.use("_users");
        //var json = {"_id":"org.couchdb.user:" + useremail,"name":useremail,"roles":[],"type":"user","password":userpassword};
        //_users.insert(json, "", function(error, body, headers){
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
	    },
	    enableDatabaseAccess: function(callback){
	    	console.log("enableDatabaseAccess");
	    	var dbsecurity = couchadmin.use(dbname);
	    	dbsecurity.get("_security", function(err, body){
				  if (!err) {
				  	console.log("got _security body");
				    console.log(returnMessage);
				    var names = body.members.names; //TODO: may not scale well with many users, find alternative.
				    names.push(req.body.email);
				    //console.log(body);
            //add new user to the security table so they have access.
				    dbsecurity.insert(body, "_security", function(update_err, update_body){
				    	if(!err){
					    	console.log("update_body _security");
					    	console.log(update_body);
                var returnSuccess = {};
                returnSuccess["success"] = true;
                returnSuccess["message"] = "user access enabled";
					    	callback(null, returnSuccess);
				    	} else {
				    		console.log("update_err _security");
					    	console.log(update_err);
				    	}
				    });
				    //callback(null, body);
				  } else {
            var returnError = {};
            returnError["success"] = false;
            returnError["message"] = "got _security error";
				  	console.log("got _security error");
				  	console.log(err);
				  	callback(returnError, null);
				  }
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

};

CouchDBService.prototype.getUser = function(username, callback){
  console.log("couchdb service getUser, username: " + username);
  var _users = couchnano.db.use('_users');
  _users.get('org.couchdb.user:' +  username, function(err, body) {
    if (!err) {
      console.log(new UserModel(body));
      callback(null, new UserModel(body));
    }else{
      console.log(err);
      callback(err, null);
    }
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
// ********************************************************************************************************************************** //
//
// Article and Content Services
//
// ********************************************************************************************************************************** //

CouchDBService.prototype.createArticle = function(req, jsondata, doctitle, func_callback){
	console.log("in CouchDBService, saveArticle");
	console.log(req.body);

	var returnSuccess = null;
	var token = null;
	var parts = req.headers.authorization.split(' ');
	var secret = req.app.secret;
	var dbtable = dbNameArticles;

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(parts, secret, function(err, result){
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
	var token = null;
	var parts = req.headers.authorization.split(' ');
	var secret = req.app.secret;
	var dbtable = dbNameArticles;

	var requestParams = req.query;
	var getAllData = requestParams.getAllData;
	console.log("getAllData:" + getAllData);
	var id = req.param("id");
	console.log("id:" + id);

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(parts, secret, function(err, result){
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
	var token = null;
	var parts = req.headers.authorization.split(' ');
	var secret = req.app.secret;
	var dbtable = dbNameArticles;

	var id = req.param("id");
	var rev = req.param("rev");
	console.log("id:" + id);

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(parts, secret, function(err, result){
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
	var token = null;
	var parts = req.headers.authorization.split(' ');
	var secret = req.app.secret;
	var dbtable = dbNameArticles;

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(parts, secret, function(err, result){
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
	var token = null;
	var parts = req.headers.authorization.split(' ');
	var secret = req.app.secret;
	var dbtable = dbNameArticles;

	var requestParams = req.query;
	var getAllData = requestParams.getAllData;

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(parts, secret, function(err, result){
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
	var token = null;
	var parts = req.headers.authorization.split(' ');
	var secret = req.app.secret;
	var dbtable = dbNameArticles;

	var id = req.param("id");
	console.log("updateData");
	console.log(req.param("updateData"));
	console.log(typeof req.param("updateData"))
	var updateData = req.param("updateData");
	console.log("id:" + id);

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(parts, secret, function(err, result){
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
	var token = null;
	var parts = req.headers.authorization.split(' ');
	var secret = req.app.secret;
	var clientip = req.ip;
	var returnSuccess = null;
	var returnError = null;

	async.series({
	    authToken: function(callback){
		    _authUtils.authenticateToken(parts, secret, function(err, result){
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

exports.Service = new CouchDBService;






