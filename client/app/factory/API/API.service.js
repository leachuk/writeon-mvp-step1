'use strict';

angular.module('writeonMvpStep1App')
  .factory('API', ['$resource', '$q', function ($resource, $q) {
    
    var service = {};

    //Article Service
    service.Article = {};
    service.Article.getArticle = function(id) {
      var r=$resource('/api/articles/getarticle/:id', {},
                      {
                          getArticle: { method: 'GET', params: { id: id }}
                      });

      return r.getArticle({id: id}).$promise.then(function(data) {
        return data;
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
                          listAllMyArticles: {method: 'GET', isArray: true, params: {getAllData: false}}
                      });
      return r.listAllMyArticles().$promise.then(function(data){
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
