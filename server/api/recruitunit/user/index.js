'use strict';

require('rootpath')();

var express = require('express');
var controller = require('./user.controller');
var router = express.Router();

var authService = require('server/services/auth/auth.controller').AuthService;
authService.initUserAuthorization();
//var acl = authService.acl();

router.post('/signin', controller.signin);
router.get('/getuserdetails/:userguid', authService.checkUserIsAuthorisedOperation('read'),controller.getUserFromGuid);//secured through acl
router.post('/updateuser/:useremail', authService.checkUserIsAuthorisedOperation('update'),controller.updateUser);

module.exports = router;
