'use strict';

require('rootpath')()
var _ = require('lodash');
var config = require('server/config/environment');
var couchnano = require("nano")(config.couchuri);
var dbNameArticles = config.dbNameArticles;
var async = require('async');

var UserModel = require('server/models/User');
var SocialListModel = require('server/models/SocialList.ListItem.All.js');
var SocialListPartialModelConverter = require('server/models/SocialList.ListItem.Partial.js');

var _dbUtils = require('server/services/dbUtils/dbUtils.controller').DbUtils;
var _authUtils = require('server/services/authUtils/authUtils.controller').AuthUtils;

function SocialListArticleService(){};

// ********************************************************************************************************************************** //
//
// Article and Content Services
//
// ********************************************************************************************************************************** //

SocialListArticleService.prototype.createArticle = function(req, jsondata, doctitle, func_callback){
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
	    	//var couchsetup = require("nano")({ url : config.couchuri, cookie: returnSuccess.cookie});
			//var couchDb = couchsetup.use(dbtable);
			// couchDb.insert(jsondata, doctitle, function (err, body, headers){
			// 	if(!err) {
			// 		console.log(body);
			// 	}else{
			// 		console.log(err);
			// 	}

			// 	callback(err, body);
			// });

			//need to find way of using cookie authentication in jugglingdb model schema connection - DONE, booyah
			var articleModelAuth = SocialListModel(returnSuccess.cookie);
			articleModelAuth.create(req.body, function(err, result){
				if(!err){
					console.log("SocialListArticleService createArticle: success");
					console.log(result);
					callback(result);
				}else{
					console.log("error");
					callback(err);
				}
			});
	    }
	},
	function(err, results) {
	    console.log(results);
	    func_callback(err, results);
	});
};

SocialListArticleService.prototype.getArticle = function(req, func_callback){
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

SocialListArticleService.prototype.deleteArticle = function(req, func_callback){
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

SocialListArticleService.prototype.listAllUserArticles = function(req, username, func_callback){
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
SocialListArticleService.prototype.listMyArticles = function(req, func_callback){
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
	    	console.log("CouchDBService listMyArticles: returnSuccess");
	    	console.log(returnSuccess.cookie);
	    	console.log(returnSuccess.username);
			var articleModelAuth = SocialListModel(returnSuccess.cookie, {returnAll: getAllData});
			articleModelAuth.all({where:{authorName: returnSuccess.username}}, function(err, body){
				if(!err){
					console.log("success result");
					//convert list of full article model to a partial model
					var updatedBody = SocialListPartialModelConverter(body);
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

SocialListArticleService.prototype.updateArticle = function(req, func_callback) {
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

SocialListArticleService.prototype.insertArticle = function(username, docname, field, value, callback) {
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

exports.SocialListArticleService = new SocialListArticleService;






