'use strict';

angular.module('writeonMvpStep1App')
  .controller('ListAllArticleCtrl', function ($scope, API) {
    $scope.articles = [];
    $scope.articleDeleteAll = false;
    $scope.deleteChecked = {};

    $scope.deleteArticle = function(){
    	angular.forEach($scope.articles, function(value, key){
    		if (value.deletechecked) {
    			API.Article.delete(value.id, value._rev).then(function(data){
    				console.log(data);
    			});
    		}
    	});
    };

    API.Article.listAllMyArticles().then(function(data){
        //convert to frontend UI Article model. Refactor to service
	    angular.forEach(data,function(value,index){
	        console.log(value);
	    });

        $scope.articles = data;
        $scope.articleCount = data.length;
    });

  });
