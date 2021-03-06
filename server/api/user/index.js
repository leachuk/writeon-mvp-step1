'use strict';

var appDir = require('path').dirname(require.main.filename);

var express = require('express');
var controller = require('./user.controller');
var router = express.Router();

var authService = require(appDir + '/services/auth/auth.controller').AuthService;
authService.initUserAuthorization();
//var acl = authService.acl();

var userValidationService = require(appDir + '/services/recruitunit/validation/user').UserValidationService;

router.post('/signup', userValidationService.signup(), controller.signup);
//router.post('/signin', controller.signin);
router.get('/getuser/:username', controller.getthisuser);//secured to specific user making the request
router.get('/getspecifieduser/:username', authService.checkUserIsAuthorisedOperation('read'),controller.getuser);//secured through acl
router.post('/authenticate', controller.authenticate);
router.get('/isuservalid/:username', controller.isuservalid);

module.exports = router;
