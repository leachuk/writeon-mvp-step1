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
	var title = req.body.title;
	var bodyText = req.body.bodyText;

	var couchService = couchDbHandlers.CouchDBService;

	var articleData = {Title: title, BodyText: bodyText};

	couchService.saveArticle(articleData, title, function(err, result){
	    if (!err){
	      console.log(result);
	      res.send(result);
	    } else {
	      console.log(err);
	      res.send(err);
	    }
	});

	return res.send({Title: title, BodyText: bodyText});
};

