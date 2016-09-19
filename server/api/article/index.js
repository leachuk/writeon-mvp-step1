'use strict';

require('rootpath')();

var express = require('express');
var controller = require('./article.controller');
var router = express.Router();

var authService = require('server/services/auth/auth.controller').AuthService;
//authService.initAuthorization();
var acl = authService.acl();

router.get('/', controller.index);
router.get('/getarticle/:id', authService.checkUserIsAuthorisedOperation('read'), controller.getArticle);
router.get('/listAllUserArticles/:username', controller.listAllUserArticles);//todo: secure me
router.put('/createArticle', authService.checkUserIsAuthorisedOperation('create'), controller.createArticle);
router.post('/saveComparison', controller.saveComparison);
//router.post('/insertArticle', controller.insertArticle);
router.get('/listMyArticles', authService.checkUserIsAuthorisedOperation('read'), controller.listMyArticles);
router.get('/listMyTestContent', authService.checkUserIsAuthorisedOperation('read'), controller.listMyTestContent);
router.get('/listByAuthor/:username', controller.listByAuthor); //todo fix authService.checkUserIsAuthorisedUrl(), need to escape url.
router.post('/deleteArticle', controller.deleteArticle);
router.post('/updateArticle/:id', controller.updateArticle);
router.get('/compare/:testsourceid/:comparisonid', controller.compare);
router.get('/search', controller.search); //optional todo: might want to secure endpoint with authService.checkUserIsAuthorisedUrl()
router.get('/getUserTestResults', controller.getUserTestResults); //ToDo: Need to find a way of abstracting the endpoints so they can be specifically created for the application. I.e. This shouldn't be set here.

router.get('/testcookie', controller.testCookie);
router.post('/testmodel', controller.testModel);
router.get('/testform', controller.testForm);
router.get('/testcompare', controller.compare);

module.exports = router;
