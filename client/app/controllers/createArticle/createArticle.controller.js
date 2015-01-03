'use strict';

angular.module('writeonMvpStep1App')
  .controller('CreateArticleCtrl', function ($scope, $rootScope, authenticationService, API) {

    $scope.article = {
    	bodyText :''
    };

    API.Article.getArticle('UserArticle','54321').then(function(data){
        $scope.model = new Article(data);
        console.log(data);
    });

    $scope.submitArticle = function(){
        var rootscope = $rootScope;
        var title = $scope.article.title;
        var bodyText = $scope.article.bodyText;

        var articleModel = new Article({
                                        Title: title, 
                                        BodyText: bodyText
                                        });
        
        console.log(articleModel);

        API.User.getUser(rootscope.user.username).then(function(data){
            $scope.usermodel = new User(data);
            console.log(data);
            API.Article.saveArticle($scope.usermodel, articleModel).then(function(data){
                console.log(data);
            });
        });
    };

  });
