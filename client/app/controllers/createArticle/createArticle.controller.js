'use strict';

angular.module('writeonMvpStep1App')
  .controller('CreateArticleCtrl', function ($scope, authenticationService, API) {
    $scope.article = {
    	bodyText :''
    };

    API.Article.getArticle('UserArticle','54321').then(function(data){
        $scope.model = new Article(data);
        console.log(data);
    });

    API.User.getUser('writeonmvpstep1-3@test.com').then(function(data){
        $scope.usermodel = new User(data);
        console.log(data);
    });

    $scope.submitArticle = function(){
        var title = $scope.article.title;
        var bodyText = $scope.article.bodyText;
        var jsondata = {}; 
        jsondata.Article = {Title: title, BodyText: bodyText}; //Todo use article model
        console.log(jsondata);
        console.log($scope.usermodel);

        API.Article.saveArticle($scope.usermodel, jsondata).then(function(data){
            console.log(data);
        });

    };

  });
