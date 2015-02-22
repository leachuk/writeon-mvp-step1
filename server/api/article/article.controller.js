'use strict';

require('rootpath')();

var _ = require('lodash');
var couchDbHandlers = require('server/services/couchDbHandler/couchDbHandler.controller');
var couchService = couchDbHandlers.CouchDBService;

//remove once refactored to couchDbHandlers
var config = require('server/config/environment');
var couchnano = require("nano")(config.couchuri);

var TestModel = require('server/models/JugglingModelTest');
var ArticleModel = require('server/models/Article');

// Get list of articles
exports.index = function(req, res) {
  res.json([{articles: 'index test'}]);
};

exports.getArticle = function(req, res) {
	var type = req.param("type");
	var id = req.param("id");
	//var dbTable = req.param("dbtable");
	console.log("getArticle type: " + type);
	console.log("getArticle id: " + id);
	
	couchService.getArticle(type, id, function(err, result){
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

	couchService.createArticle(req, articleData, title, function(err, result){
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

exports.insertArticle = function(req, res){
	console.log("in insertArticle");
	var docname = req.body.docname;
    var fieldparam = req.body.field;
    var valueparam = req.body.value;
    var dbTable = req.body.tablename; //req.body.User.Name; //todo: change to email when configured

    couchService.insertArticle(dbTable, docname, fieldparam, valueparam, function(err, result){
		if(!err){
			res.send(result);
		}else{
			res.send(err);
		}
	});
};

exports.testCookie = function(req, res){

	couchService.testCookie(req, res, function(err, result){
		if(!err){
			res.send(result);
		}else{
			res.send(err);
		}
	});
};

exports.testModel = function(req, res){

	console.log("in testModel");

	ArticleModel.create(req.body, function(err, result){
		if(!err){
			console.log("success");
			console.log(result);
			res.send(result);
		}else{
			console.log("error");
			res.send(err);
		}
	});

	//res.send("this:" + model);
};

exports.testForm = function(req, res){
	var forms = require('forms');
	var fields = forms.fields;
	var validators = forms.validators;

	var reg_form = forms.create({
	    username: fields.string({ required: true }),
	    password: fields.password({ required: validators.required('You definitely want a password') }),
	    confirm:  fields.password({
	        required: validators.required('don\'t you know your own password?'),
	        validators: [validators.matchField('password')]
	    }),
	    email: fields.email()
	});

	console.log(TestModel.schema.definitions.JugglingModelTest.properties.blaa);
	var model_form = forms.create(TestModel);

	res.send(model_form.toHTML());
};


