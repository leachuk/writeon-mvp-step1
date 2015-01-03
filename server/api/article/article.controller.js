'use strict';

require('rootpath')();

var _ = require('lodash');
var couchDbHandlers = require('server/services/couchDbHandler/couchDbHandler.controller');

// Get list of articles
exports.index = function(req, res) {
  res.json([{articles: 'index test'}]);
};

exports.getArticle = function(req, res) {
	var type = req.param("type");
	var id = req.param("id");
	console.log("getArticle type: " + type);
	console.log("getArticle id: " + id);
	
	res.send({Title: 'Server Test Title', BodyText: 'Body text from the server'});
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

	var couchService = couchDbHandlers.CouchDBService;

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

	//res.send({result: "document created"});

};

