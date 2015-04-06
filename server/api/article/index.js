'use strict';

var express = require('express');
var controller = require('./article.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/getarticle/:id', controller.getArticle);
router.get('/listAllUserArticles/:username', controller.listAllUserArticles);
router.post('/saveArticle', controller.saveArticle);
router.post('/updateArticle', controller.updateArticle);
router.post('/insertArticle', controller.insertArticle);
router.get('/listAllArticles', controller.listAllArticles);
router.get('/listByAuthor/:username', controller.listByAuthor);
router.get('/listMyArticles', controller.listMyArticles);
router.post('/deleteArticle', controller.deleteArticle);
router.post('/updateArticle', controller.updateArticle);

router.get('/testcookie', controller.testCookie);
router.post('/testmodel', controller.testModel);
router.get('/testform', controller.testForm);

module.exports = router;