'use strict';

angular.module('writeonMvpStep1App')
	.controller('SigninCtrl', function ($scope, $http) {
		console.log('in SigninCtrl');



		$scope.submit = function(){
			var data = {};
			data.username = $scope.signin.username;
			data.password = $scope.signin.password;
			console.log(data);

			$http.post('/api/users/signin', data).
			success(function(data, status, headers, config) {
				console.log(data);
			}).
			error(function(data, status, headers, config) {
				console.log("Invalid login attempt: " + data);
			});
		};
	});
