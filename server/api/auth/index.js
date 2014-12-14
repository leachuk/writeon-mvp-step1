'use strict';

var express = require('express');
var controller = require('./auth.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/checktoken', controller.checktoken);
router.post('/decodetoken', controller.decodetoken);

module.exports = router;