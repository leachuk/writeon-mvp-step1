'use strict';

require('rootpath')();

var _ = require('lodash');
var couchDbHandlers = require('server/services/couchDbHandler/couchDbHandler.controller');

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

exports.updateArticle = function(req,res){
    var db = couchnano.use("db_app_document");
    var docname = req.body.docname;
    var fieldparam = req.body.field;
    var valueparam = req.body.value;
    console.log("node params. docname["+ docname +"], field["+ fieldparam +"], value["+ valueparam +"]");
    var returnbody = null;
    db.atomic("example",
        "in-place",
        docname,
        [{field: fieldparam, value: valueparam},{field: "field2", value: "field2foo"}],
        function (error, response) {
            if (error) {
                console.log("update error");
            }else{
                returnbody = response;
                console.log("update worked:");
                console.log(response);
            }
        });
    
    res.send(returnbody);
//    db.update = function(obj, key, callback) {
//     var db = this;
//     db.get(key, function (error, existing) { 
//      if(!error) obj._rev = existing._rev;
//      db.insert(obj, key, callback);
//     });
//    }
//    
//    db.update({title: 'The new one 3'}, docname, function(err, res) {
//     if (err) return console.log('No update!');
//     console.log('Updated!');
//    });
//    res.send("saved \n");
};

