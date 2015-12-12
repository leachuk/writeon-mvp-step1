'use strict';

require('rootpath')();

var _ = require('lodash');

var couchDbHandlers = require('server/services/recruitunit/articles/recruitUnitContentService.controller');
var couchService = couchDbHandlers.RecruitUnitContentService;

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
	couchService.getArticle(req, function(err, result){
	    if (!err){
	      console.log(result);
	      //res.send(result);
	      req.result = result;
	      next();
	    } else {
	      console.log(err);
	      //res.send(err);
	      next(err);
	    }
	});
	//res.send({Title: 'Server Test Title', BodyText: 'Body text from the server'});
};

exports.saveArticle = function(req, res) {
	console.log("RecruitUnit Article controller, saveArticle");
	console.log(req.body);

	couchService.createArticle(req, {}, "", function(err, result){
	    if (!err){
	      console.log(result);
	      res.send(result);
	    } else {
	      console.log(err);
	      res.send(err);
	    }
	});

};

exports.updateArticle = function(req,res){
    var docname = req.body.docname;
    var fieldparam = req.body.field;
    var valueparam = req.body.value;

    couchService.updateArticle("username_example", docname, fieldparam, valueparam, function(err, result){
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
	// TODO. Create a design doc to handle list document query
 	couchService.listMyArticles(req, function(err, result){
		if(!err){
			res.send(result);
		}else{
			res.send(err);
		}
	});
};

exports.listByAuthor = function(req, res){
	console.log("sociallist.controller listByAuthor");

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




