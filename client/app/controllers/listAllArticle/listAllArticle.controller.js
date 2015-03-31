'use strict';

angular.module('writeonMvpStep1App')
  .controller('ListAllArticleCtrl', function ($scope, API) {
    $scope.articles = [];


    API.Article.listAllMyArticles().then(function(data){
        console.log(data);
        $scope.articles = data;
        $scope.articleCount = data.length;
    });

  });
