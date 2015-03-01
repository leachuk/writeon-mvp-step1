'use strict';

angular.module('writeonMvpStep1App')
  .controller('CreateArticleCtrl', function ($scope, $rootScope, $q, $moment, authenticationService, API) {

    $scope.article = {
        title: '',
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
            title: title, 
            bodyText: bodyText,
            authorName: rootscope.user.username,
            authorEmail: rootscope.user.username,
            createdDate: Date.now(),
            createdDateFormatted: $moment().format('MMMM Do YYYY, H:mm:ss')
        });

        console.log("In submitArticle: articleModel >");
        console.log(articleModel);

        //save article
        API.Article.saveArticle(articleModel).then( function( articledata ){
                console.log(articledata);
        });
    };

  });
