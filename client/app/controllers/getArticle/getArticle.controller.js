'use strict';

angular.module('writeonMvpStep1App')
  .controller('GetArticleCtrl', function ($scope, $stateParams, API) {
    $scope.articleId = $stateParams.id;

    API.Article.getArticle($scope.articleId).then(function(data){
        console.log(data);
        $scope.article = data;
    });
  });
