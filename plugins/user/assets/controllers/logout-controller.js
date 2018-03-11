angular.module("EmmetBlue")

.controller('userLogoutController', function($scope, utils, $cookies, $location){
	utils.userSession.clear();
})