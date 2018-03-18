'use strict';

var appDir = require('path').dirname(require.main.filename);

var express = require('express');
var controller = require('./article.controller');
var router = express.Router();

var authService = require(appDir + '/services/auth/auth.controller').AuthService;

router.get('/', controller.index);
router.get('/getarticle/:id', authService.checkUserIsAuthorisedOperation('read'), controller.getArticle);
router.put('/createjobsubmission', authService.checkUserIsAuthorisedOperation('create'), controller.createJobSubmission);
router.post('/toggledevemaildisplay', authService.checkUserIsAuthorisedOperation('update'), controller.toggleDevEmailDisplay);
router.get('/getusertestresults', controller.getUserTestResults);
router.post('/find', authService.checkUserIsAuthorisedOperation('read'), controller.find);
router.post('/getJobItemSpecDocs', authService.checkUserIsAuthorisedOperation('read'), controller.getJobItemSpecDocs);

module.exports = router;
