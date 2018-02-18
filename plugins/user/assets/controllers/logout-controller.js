angular.module("EmmetBlue")

.controller('userLogoutController', function($scope, utils, $cookies, $location){
	utils.serverRequest("/user/session/deactive?resourceId="+utils.userSession.getID(), "GET").then(function(response){
		$cookies.remove(utils.globalConstants.USER_COOKIE_IDENTIFIER);

		$location.path('user/login');
	}, function(error){
		utils.errorHandler(error);
	})
})