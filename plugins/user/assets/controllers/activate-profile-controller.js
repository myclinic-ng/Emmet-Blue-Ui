angular.module("EmmetBlue")

.controller('userActivateProfileController', function($scope, utils, $cookies, $location){
	$scope.activate = function(){
		var req = utils.serverRequest("/human-resources/staff/activate-profile/"+utils.userSession.getID(), "GET");
		req.then(function(response){
			utils.notify("Account activated successfully", "You are been redirected to the login page, please login again to begin", "success");
			utils.userSession.clear();
		}, function(error){
			utils.errorHandler(error);
		})
	}
})