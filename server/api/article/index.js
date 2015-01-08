'use strict';

var express = require('express');
var controller = require('./article.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/getarticle/:dbtable/:type/:id', controller.getArticle);
router.get('/listAllUserArticles/:username', controller.listAllUserArticles);
router.post('/saveArticle', controller.saveArticle);
router.post('/updateArticle', controller.updateArticle);
router.post('/insertArticle', controller.insertArticle);

module.exports = router;