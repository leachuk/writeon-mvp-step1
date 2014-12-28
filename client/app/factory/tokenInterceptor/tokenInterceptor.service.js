'use strict';

angular.module('writeonMvpStep1App')
  .factory('tokenInterceptor', function ($q, $window) {
    // Service logic
    // ...
    console.log('in tokenInterceptor');
    var meaningOfLife = 42;

    // Public API here
    return {
      request : function(config) {
        // do something on success
        console.log('tokenInterceptor, request');
        //console.log(config);
        config.headers = config.headers || {};
        //console.log($window.localStorage.getItem('writeon.authtoken'));
        if (!config.headers.Authorization && $window.localStorage.getItem('writeon.authtoken')) {
          config.headers.Authorization = 'Bearer ' + $window.localStorage.getItem('writeon.authtoken')
        };

        console.log(config);
        return config;
      },

      response : function(response) {
        //console.log('tokenInterceptor, response');
        //console.log(response);
        // do something on success
        return response;
      }
    };
  });


