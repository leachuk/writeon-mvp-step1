'use strict';

angular.module('writeonMvpStep1App')
  .factory('API', ['$resource', function ($resource) {

    var service = {};

    //Article Service
    service.Article = {};
    service.Article.getArticle = function(id, modelPath) {
      var r=$resource('/api/articles/getarticle/:id', {},
                      {
                          getArticle: { method: 'GET', params: { id: id, modelId: modelPath }}
                      });

      return r.getArticle({id: id}).$promise.then(function(data) {
        return data;
      });
    };

    service.Article.saveArticle = function(modelData,controllerId) {
      console.log(modelData);
      var r=$resource('/api/articles/saveArticle', {},
                      {
                          saveArticle: { method: 'POST', params: {'modelId': controllerId}}
                      });

      return r.saveArticle(modelData).$promise.then(function(data) {
        return data;
      });
    };

    service.Article.listAllMyArticles = function() {
      var r=$resource('/api/articles/listMyArticles', {},
                      {
                          listAllMyArticles: {method: 'GET', isArray: true, params: {getAllData: false}}
                      });
      return r.listAllMyArticles().$promise.then(function(data){
        return data;
      });
    };

    service.Article.delete = function(id, rev) {
      console.log("delete, id:" + id + ", rev:" + rev);
      var r=$resource('/api/articles/deleteArticle', {},
                      {
                          deleteArticle: {method: 'POST', params: { id: id, rev: rev}}
                      });
      return r.deleteArticle().$promise.then(function(data){
        return data;
      });
    };

    service.Article.updateArticle = function(docData) {
      var r=$resource('/api/articles/updateArticle', {},
                      {
                          updateArticle: { method: 'Post', params: { updateData: docData }}
                      });

      return r.updateArticle({updateData: docData}).$promise.then(function(data) {
        return data;
      });
    };

    //User Service
    service.User = {};
    service.User.getUser = function(userid) {
      var r=$resource('/api/users/getuser/:username', {},
                      {
                          getUser: { method: 'GET', params: {username: '' }}
                      });

      return r.getUser({username: userid}).$promise.then(function(data) {
        return new User(data);
      });
    };

    return service;

  }]);
