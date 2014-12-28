'use strict';

angular.module('writeonMvpStep1App')
	.controller('SigninCtrl', function ($scope, $http) {
		console.log('in SigninCtrl');



		$scope.submit = function(){
			var data = {};
			data.username = $scope.signin.username;
			data.password = $scope.signin.password;
			//console.log(data);

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
			});
		};
	});
