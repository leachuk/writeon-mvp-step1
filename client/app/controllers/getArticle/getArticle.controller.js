'use strict';

angular.module('writeonMvpStep1App')
  .controller('GetArticleCtrl', function ($scope, $stateParams, API) {
    $scope.articleId = $stateParams.id;

    API.Article.getArticle($scope.articleId).then(function(data){
        console.log(data);
        $scope.article = data;
    });

    $scope.updateArticle = function(docData){
    	console.log("updateArticle function. docData:");
    	console.log(docData);

	   	API.Article.updateArticle(docData).then(function(data){
	        console.log(data);
	        $scope.article = data;
	    });
    }
  });
