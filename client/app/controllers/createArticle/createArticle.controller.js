'use strict';

angular.module('writeonMvpStep1App')
  .controller('CreateArticleCtrl', function ($scope, $rootScope, $q, $moment, authenticationService, API) {

    $scope.article = {
        title: '',
    	bodyText :''
    };

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
            createdDateFormatted: $moment().format('MMMM Do YYYY, H:mm:ss'),
            lastUpdatedDate: Date.now(),
            lastUpdatedDateFormatted: $moment().format('MMMM Do YYYY, H:mm:ss')
        });

        console.log("In submitArticle: articleModel >");
        console.log(articleModel);

        //save article
        //the controllerId enables different controllers to be defined per application, so different models and behaviour can be defined
        var controllerId = "server/services/couchDbHandler/couchDbHandler.controller"; //eventually replace with an id which does a lookup to the path server side
        API.Article.saveArticle(articleModel, controllerId).then( function( articledata ){
                console.log(articledata);
        });
    };

  });
