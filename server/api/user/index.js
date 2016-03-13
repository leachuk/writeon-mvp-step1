'use strict';

require('rootpath')();

var express = require('express');
var controller = require('./user.controller');
var router = express.Router();

var authService = require('server/services/auth/auth.controller').AuthService;
authService.initUserAuthorization();
//var acl = authService.acl();

router.post('/signup', controller.signup);
router.post('/signin', controller.signin);
router.get('/getuser/:username', authService.checkUserIsAuthorisedUrl(), controller.getuser);//todo: get this working
//router.get('/getuser/:username', controller.getuser);
router.post('/authenticate', controller.authenticate);
router.get('/isuservalid/:username', controller.isuservalid);

module.exports = router;
