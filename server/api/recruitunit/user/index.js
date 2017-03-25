'use strict';

var appDir = require('path').dirname(require.main.filename);

var express = require('express');
var controller = require('./user.controller');
var router = express.Router();

var authService = require(appDir + '/services/auth/auth.controller').AuthService;
authService.initUserAuthorization();
//var acl = authService.acl();

router.post('/signin', controller.signin);
router.get('/getuserdetails/:userguid', authService.checkUserIsAuthorisedOperation('read'),controller.getUserFromGuid);//secured through acl
router.post('/updateuser/:useremail', authService.checkUserIsAuthorisedOperation('update'),controller.updateUser);
router.get('/getdevemailfromdocid/:docid', authService.checkUserIsAuthorisedOperation('read'),controller.getDevEmailFromDocId);

module.exports = router;
