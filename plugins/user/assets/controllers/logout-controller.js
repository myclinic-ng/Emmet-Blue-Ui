angular.module("EmmetBlue")

.controller('userLogoutController', function($scope, utils, $cookies, $location){
	$cookies.remove(utils.globalConstants.USER_COOKIE_IDENTIFIER);

	$location.path('user/login');
})