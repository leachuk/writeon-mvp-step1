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
        var rootscope = $rootScope; //rootscope contains the username decoded from the secure auth token
        var title = $scope.article.title;
        var bodyText = $scope.article.bodyText;
        var usermodel = {};
        usermodel.Name = rootscope.user.username;

        $scope.usermodel = usermodel; //for test display only

        var articleModel = new Article({
                                        Title: title, 
                                        BodyText: bodyText
                                        });

        console.log(articleModel);

        //save article
        API.Article.saveArticle(usermodel, articleModel).then( function( articledata ){
                console.log(articledata);
        });
    };

  });
