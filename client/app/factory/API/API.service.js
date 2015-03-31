'use strict';

angular.module('writeonMvpStep1App')
  .factory('API', ['$resource', '$q', function ($resource, $q) {
    
    var service = {};

    //Article Service
    service.Article = {};
    service.Article.getArticle = function(doctype,accountId) {
      var r=$resource('/api/articles/:type/:id', {},
                      {
                          getArticle: { method: 'GET', params: { type: 'DefaultArticle', id: '12344' }}
                      });

      return r.getArticle({type: doctype,id: accountId}).$promise.then(function(data) {
        return new Article(data); //do we want to tie the model to the service, or do this in the controller? Should be decoupled. Do in controller.
      });
    };

    service.Article.saveArticle = function(model) {
      console.log(model);
      var r=$resource('/api/articles/saveArticle', {},
                      {
                          saveArticle: { method: 'POST', params: {}}
                      });

      return r.saveArticle(model).$promise.then(function(data) {
        return data; 
      });
    };

    service.Article.listAllMyArticles = function() {
      var r=$resource('/api/articles/listMyArticles', {}, 
                      {
                          listAllMyArticles: {method: 'GET', isArray: true, params: {}}
                      });
      return r.listAllMyArticles().$promise.then(function(data){
        return data;
      });
    }

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
