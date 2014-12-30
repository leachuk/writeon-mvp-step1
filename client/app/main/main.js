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
        templateUrl: 'app/views/userHome.html',
        controller: 'UserHomeCtrl'
      });
  });