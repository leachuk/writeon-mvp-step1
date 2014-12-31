'use strict';

angular.module('writeonMvpStep1App')
  .factory('API', ['$resource', '$q', function ($resource, $q) {
    
    var service = {};

    service.Article = {};
    service.Article.getArticle = function(doctype,accountId) {
      var r=$resource('/api/article/:type/:id', {},
                      {
                          getArticle: { method: 'GET', params: { type: 'DefaultArticle', id: '12344' }}
                      });

      return r.getArticle({type: doctype,id: accountId}).$promise.then(function(data) {
        return new Article(data); //do we want to tie the model to the service, or do this in the controller?
      });
    };

    return service;

  }]);
