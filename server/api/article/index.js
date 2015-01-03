'use strict';

var express = require('express');
var controller = require('./article.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:type/:id', controller.getArticle);
router.post('/saveArticle', controller.saveArticle);
router.post('/updateArticle', controller.updateArticle);

module.exports = router;