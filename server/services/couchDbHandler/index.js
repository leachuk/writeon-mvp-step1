'use strict';

var express = require('express');
var controller = require('./couchDbHandler.controller');

var router = express.Router();

router.get('/', controller.index);
//router.get('/createNewUserDatabase', controller.createNewUserDatabase); //not yet exposed directly. Perhaps create a 'utility' directory for these private methods

module.exports = router;