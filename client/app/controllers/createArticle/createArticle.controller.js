'use strict';

angular.module('writeonMvpStep1App')
  .controller('CreateArticleCtrl', function ($scope, authenticationService, API) {
    $scope.article = {
    	bodyText :''
    };
    //console.log("authenticationService: " + authenticationService.someMethod());
    //console.log(API.someMethod());

    //console.log(API);
    // API.Article.getArticle({id:'12345'}, function(data){
    //     $scope.model = new Article(data);
    //     //console.log($scope.model);
    // });

    console.log(API.Article.getArticle('UserArticle','54321'));

  });
