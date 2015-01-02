'use strict';

var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

router.post('/signup', controller.signup);
router.post('/signin', controller.signin);
router.get('/getuser/:username', controller.getuser);
router.post('/authenticate', controller.authenticate);

module.exports = router;