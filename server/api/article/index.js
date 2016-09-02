'use strict';

require('rootpath')();

var express = require('express');
var controller = require('./article.controller');
var router = express.Router();

var authService = require('server/services/auth/auth.controller').AuthService;
authService.initAuthorization();
var acl = authService.acl();

router.get('/', controller.index);
router.get('/getarticle/:id', controller.getArticle, authService.checkUserIsAuthorisedModel());
router.get('/listAllUserArticles/:username', controller.listAllUserArticles);
//router.post('/createArticle', authService.checkUserIsAuthorisedUrl(), controller.createArticle);//secure via url works
router.post('/createArticle', authService.checkUserIsAuthorisedModel(), controller.createArticle);//not secured via model. to fix.
router.post('/saveComparison', controller.saveComparison);
//router.post('/insertArticle', controller.insertArticle);
router.get('/listMyArticles', authService.checkUserIsAuthorisedUrl(), controller.listMyArticles);
router.get('/listMyTestContent', authService.checkUserIsAuthorisedUrl(), controller.listMyTestContent);
router.get('/listByAuthor/:username', controller.listByAuthor); //todo fix authService.checkUserIsAuthorisedUrl(), need to escape url.
router.post('/deleteArticle', controller.deleteArticle);
router.post('/updateArticle/:id', controller.updateArticle);
router.get('/compare/:testsourceid/:comparisonid', controller.compare);
router.get('/search', controller.search); //optional todo: might want to secure endpoint with authService.checkUserIsAuthorisedUrl()

router.get('/testcookie', controller.testCookie);
router.post('/testmodel', controller.testModel);
router.get('/testform', controller.testForm);
router.get('/testcompare', controller.compare);

module.exports = router;
