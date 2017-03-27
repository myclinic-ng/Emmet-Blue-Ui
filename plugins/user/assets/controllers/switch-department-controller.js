angular.module("EmmetBlue")

.controller('userSwitchDepartmentController', function($scope, utils, $cookies, $location, $timeout){
	$scope.loadImage = utils.loadImage;
	var req = utils.serverRequest("/human-resources/staff/view-staff-profile?resourceId="+utils.userSession.getID(), "GET");

	req.then(function(response){
		$scope.currentStaffInfo = response[0];
	}, function(error){
		utils.errorHandler(error);
	})

	utils.serverRequest("/human-resources/staff-department/view-secondary-departments?resourceId="+utils.userSession.getID(), "GET")
	.then(function(response){
		$scope.switchableDepartments = response;
	}, function(error){
		utils.errorHandler(error);
	})

	function updateCookieDashboardUrl(url){
		var cookie = $cookies.getObject(utils.globalConstants.USER_COOKIE_IDENTIFIER);
		cookie.dashboard = url;
		$cookies.putObject(utils.globalConstants.USER_COOKIE_IDENTIFIER, cookie);
		
		$location.path(url);
	}

	$scope.switch = function(){
		var data = {
			"staff": utils.userSession.getID(),
			"department":$scope.department
		};

		utils.serverRequest("/user/account/get-switch-data", "POST", data)
		.then(function(response){
			updateCookieDashboardUrl(response.Url);
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.returnToPrimaryDept = function(){
		utils.serverRequest("/human-resources/staff/view-root-url?resourceId="+utils.userSession.getID(), "GET").then(function(response){
			updateCookieDashboardUrl(response.Url);
		}, function(error){
			utils.errorHandler(error);
		})
	}
})