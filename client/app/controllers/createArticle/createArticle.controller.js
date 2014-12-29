'use strict';

angular.module('writeonMvpStep1App')
  .controller('CreateArticleCtrl', function ($scope) {
    $scope.article = {
    	bodyText :''
    };
  });
