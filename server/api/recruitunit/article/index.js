'use strict';

require('rootpath')();

var express = require('express');
var controller = require('./article.controller');
var router = express.Router();

var authService = require('server/services/auth/auth.controller').AuthService;
//authService.initAuthorization();
var acl = authService.acl();

router.get('/', controller.index);
router.put('/createjobsubmission', authService.checkUserIsAuthorisedOperation('create'), controller.createJobSubmission);
router.post('/toggledevemaildisplay', authService.checkUserIsAuthorisedOperation('update'), controller.toggleDevEmailDisplay);


module.exports = router;
