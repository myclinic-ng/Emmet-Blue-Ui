angular.module("EmmetBlue")

.controller('userHomeController', function($scope, utils, $cookies, $location, $timeout){
	$scope.redirectMessage = "<span>You are being redirected to your dashboard</span> <br/>"+utils.userSession.getDashboard();
	$location.path(utils.userSession.getDashboard());
})