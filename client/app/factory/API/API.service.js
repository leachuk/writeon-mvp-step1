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
        return new Article(data); //do we want to tie the model to the service, or do this in the controller?
      });
    };

    service.Article.saveArticle = function(usermodel, articlemodel) {
      var dataModel = {};
      dataModel.Article = articlemodel;
      dataModel.User = usermodel;
      console.log(dataModel);
      var r=$resource('/api/articles/saveArticle', {},
                      {
                          saveArticle: { method: 'POST', params: {}}
                      });

      return r.saveArticle(dataModel).$promise.then(function(data) {
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
