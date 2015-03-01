'use strict';

angular.module('writeonMvpStep1App', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'angular-momentjs'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider
    .otherwise('/');

  $locationProvider.html5Mode(true);
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('tokenInterceptor');
});