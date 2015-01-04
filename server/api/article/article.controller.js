'use strict';

require('rootpath')();

var _ = require('lodash');
var couchDbHandlers = require('server/services/couchDbHandler/couchDbHandler.controller');
var couchService = couchDbHandlers.CouchDBService;

//remove once refactored to couchDbHandlers
var config = require('server/config/environment');
var couchnano = require("nano")(config.couchuri);

// Get list of articles
exports.index = function(req, res) {
  res.json([{articles: 'index test'}]);
};

exports.getArticle = function(req, res) {
	var type = req.param("type");
	var id = req.param("id");
	var dbTable = req.param("dbtable"); //todo: change to email when configured
	console.log("getArticle type: " + type);
	console.log("getArticle id: " + id);
	
	couchService.getArticle(dbTable, type, id, function(err, result){
	    if (!err){
	      console.log(result);
	      res.send(result);
	    } else {
	      console.log(err);
	      res.send(err);
	    }
	});

	//res.send({Title: 'Server Test Title', BodyText: 'Body text from the server'});
};

exports.saveArticle = function(req, res) {
	console.log("Article controller, saveArticle");
	console.log(req.body);
	console.log("save article");
	var articleData = req.body.Article;
	var title = req.body.Article.Title;
	var dbTable = req.body.User.Name; //todo: change to email when configured

	console.log(req.body.Article.Title);
	console.log("title: " + title);
	console.log("dbTable: " + dbTable);

	console.log(articleData);
	console.log(dbTable);

	couchService.saveArticle(dbTable, articleData, title, function(err, result){
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

	couchService.listAllUserArticles(username, function(err, result){
		if(!err){
			res.send(result);
		}else{
			res.send(err);
		}
	});
};

