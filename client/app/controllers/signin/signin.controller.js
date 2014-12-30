'use strict';

angular.module('writeonMvpStep1App')
	.controller('SigninCtrl', function ($scope, $http) {
		console.log('in SigninCtrl');
		$scope.username = '';
		$scope.password = '';

		$scope.submit = function(){
			var data = {};
			data.username = $scope.user.name;
			data.password = $scope.user.password;
			//console.log(data);

			//abstract to an auth API service
			$http.post('/api/users/signin', data).
			success(function(outdata, status, headers, config) {
				//console.log(outdata);
				window.localStorage.setItem("writeon.authtoken", outdata.token);
				window.localStorage.setItem("writeon.username", data.username);
				//now redirect to users home page, where token is checked for
				window.location = "/home"; //will prob need to change this to come from header referer
			}).
			error(function(data, status, headers, config) {
				console.log("Invalid login attempt: " + data);
				$scope.signinForm.$setValidity("unauthorised", false);
			});
		};
	});
