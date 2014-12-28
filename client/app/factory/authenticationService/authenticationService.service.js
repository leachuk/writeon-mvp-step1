'use strict';

angular.module('writeonMvpStep1App')
  .factory('authenticationService', function () {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      }
    };
  });
