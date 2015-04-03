'use strict';

angular.module('writeonMvpStep1App')
  .controller('ListAllArticleCtrl', function ($scope, API) {
    $scope.articles = [];

    API.Article.listAllMyArticles().then(function(data){
        //console.log(data);

        //convert to frontend UI Article model. Refactor to service
	    angular.forEach(data,function(value,index){
	        console.log(value);
	    });

        $scope.articles = data;
        $scope.articleCount = data.length;
    });



  });
