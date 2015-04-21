'use strict';

require('rootpath')();

var express = require('express');
var controller = require('./article.controller');
var router = express.Router();

var authService = require('server/services/auth/auth.controller').AuthService;
authService.initAuthorization();
var acl = authService.acl();

router.get('/', controller.index);
router.get('/getarticle/:id', function(req, res, next){
	var username = null;
	authService.fulldecodetoken(req, res, function(err, result){
		if(result){
			console.log("fulldecodetoken result");
			console.log(result);
			username = result.username;
		} else {
			console.log("fulldecodetoken error");
			console.log(err);
		}
	});

	acl.isAllowed(username, 'getarticle', ['view'], function(err, res){
	    if(res){
	        console.log("User member is allowed to view articles");
	        console.log(res);
	    } else {
	    	console.log("error");
	    	console.log(err);
	    }
	});
	next();
}, controller.getArticle);
//router.get('/getarticle/:id', acl.middleware(), controller.getArticle);
router.get('/listAllUserArticles/:username', controller.listAllUserArticles);
router.post('/saveArticle', controller.saveArticle);
router.post('/updateArticle', controller.updateArticle);
router.post('/insertArticle', controller.insertArticle);
router.get('/listAllArticles', controller.listAllArticles);
router.get('/listByAuthor/:username', controller.listByAuthor);
router.get('/listMyArticles', controller.listMyArticles);
router.post('/deleteArticle', controller.deleteArticle);
router.post('/updateArticle', controller.updateArticle);

router.get('/testcookie', controller.testCookie);
router.post('/testmodel', controller.testModel);
router.get('/testform', controller.testForm);

module.exports = router;