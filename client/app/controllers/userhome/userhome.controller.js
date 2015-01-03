'use strict';

angular.module('writeonMvpStep1App')
  .controller('UserHomeCtrl', function ($scope, $rootScope, $http, $location) {
  	var rootscope = $rootScope;
  	rootscope.user = {};

    $scope.message = 'Hello user home';
    $scope.user = {};
    var data = {};
    data.username = window.localStorage.getItem("writeon.username") || null;
    if(data.username != null){
	    $http.post("/api/users/authenticate", data)
		    .success(function(data, status, headers, config) {
				console.log(data);
				$scope.user.details = data;
				rootscope.user = data;
				//new redirect to users home page, where token is checked for
			})
			.error(function(data, status, headers, config) {
				console.log('Authorization error');
				window.location = "/";
				//may want to redirect to login or index page here
				//console.log(data);
			});
	} else {
		//$scope.message = 'invalid username';
		$location.path("/");
	}
  });
