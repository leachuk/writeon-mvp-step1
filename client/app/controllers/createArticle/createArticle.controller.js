'use strict';

angular.module('writeonMvpStep1App')
  .controller('CreateArticleCtrl', function ($scope, $rootScope, $q, authenticationService, API) {

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

        //save article
        API.User.getUser(rootscope.user.username)
            .then( function( userdata ){
                $scope.usermodel = new User(userdata);
                console.log(userdata);
                return API.Article.saveArticle($scope.usermodel, articleModel);
            }).then( function( articledata ){
                console.log(articledata);
            });
    };

  });
