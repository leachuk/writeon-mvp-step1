'use strict';

angular.module('writeonMvpStep1App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .state('userhome', {
        url: '/home',
        templateUrl: 'app/templates/userHome.html',
        controller: 'UserHomeCtrl'
      });
  });