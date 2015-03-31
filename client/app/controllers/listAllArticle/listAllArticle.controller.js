'use strict';

angular.module('writeonMvpStep1App')
  .controller('ListAllArticleCtrl', function ($scope, API) {
    $scope.articles = [{name: 'foo'},{name: 'bar'}];


    API.Article.listAllMyArticles().then(function(data){
        console.log(data);
    });

  });
