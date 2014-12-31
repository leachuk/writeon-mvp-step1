'use strict';

var _ = require('lodash');

// Get list of articles
exports.index = function(req, res) {
  res.json([{articles: 'index test'}]);
};

exports.getArticle = function(req, res) {
	var type = req.param("type");
	var id = req.param("id");
	console.log("getArticle type: " + type);
	console.log("getArticle id: " + id);
	return res.send({Title: 'Server Test Title', BodyText: 'Body text from the server'});
}