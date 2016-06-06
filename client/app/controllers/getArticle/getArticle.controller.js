'use strict';

angular.module('writeonMvpStep1App')
  .controller('GetArticleCtrl', function ($scope, $stateParams, API, $moment) {
    $scope.articleId = $stateParams.id;

    var modelPath = "server/services/couchDbHandler/couchDbHandler.controller";
    API.Article.getArticle($scope.articleId, modelPath).then(function(data){
        console.log(data);
        $scope.article = data;
    });

    $scope.updateArticle = function(docData){
    	console.log("updateArticle function. docData:");

    	//insert new date to lastUpdatedDate
    	var now = $moment();
    	docData.lastUpdatedDate = now.valueOf();
        docData.lastUpdatedDateFormatted = now.format('MMMM Do YYYY, H:mm:ss');

    	console.log(docData);

	   	API.Article.updateArticle(docData).then(function(data){
	        console.log(data);
	    });
    }
  });
