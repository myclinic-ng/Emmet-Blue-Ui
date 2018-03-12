angular.module("EmmetBlue")

.controller('userHomeController', function($scope, utils, $cookies, $location, $timeout){
	if (typeof utils.userSession.getDashboard() !== "undefined"){
		$scope.redirectMessage = "<span>You are being redirected to your dashboard</span> <br/>"+utils.userSession.getDashboard();
		$location.path(utils.userSession.getDashboard());		
	}
	else {
		$scope.redirectMessage = "Unable to determine dashboard";
		$location.path("/user/404");
	}
})