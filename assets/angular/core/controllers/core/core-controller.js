angular.module("EmmetBlue")

.controller('coreController', function($scope, $location, $routeParams, CONSTANTS, utils){
	$scope.loadImage = utils.loadImage;
	$scope.$on('$routeChangeSuccess', function(event, current, previous){
		var path = ($location.path()).split('/');
		var userDashboard = ("/"+utils.userSession.getDashboard()).split("/");
		delete path[path.length - 1];
		delete userDashboard[userDashboard.length - 1];

		var dirPath = path.join("/");
		var dirUserDashboard = userDashboard.join("/");
		if (path[1] !== "" && dirUserDashboard !== dirPath){
			if (path[1] != "user"){
				utils.alert("Request cannot be processed", "This is usually due to a request for an inexistent resource or lack of permission to access the requested resource. Please contact an administrator if this error persists", "info");
				$location.path('user/home');
			}
		}
		else {
		}

		delete path[path.length - 1];

		var moduleMenu = CONSTANTS.TEMPLATE_DIR +
						 path.join('/')+
						 CONSTANTS.MODULE_MENU_LOCATION;
		var moduleHeader = CONSTANTS.TEMPLATE_DIR +
						 path.join('/')+
						 CONSTANTS.MODULE_HEADER_LOCATION;

		$scope.moduleMenu = moduleMenu;
		$scope.moduleHeader = moduleHeader;
	});

	var checkLogin = function(){
		if ($location.path() != '/user/login'){
			utils.userSession.cookie();
		}
	}

	$scope.currentYear = (new Date()).getFullYear();

	$scope.isAuthPage = function(){
		if ($location.path() == '/user/login'){
			return true;
		}

		return false;
	}

	$scope.logout = function(){
		utils.userSession.clear();
	}

	var loadUserProfile = function(){
		if ($location.path() != '/user/login'){
			var req = utils.serverRequest("/human-resources/staff/view-staff-with-department-and-role?uuid="+utils.userSession.getUUID(), "GET");

			req.then(function(response){
				$scope.currentStaffDepartmentInfo = response[0];
				utils.storage.currentStaffDepartmentID = response[0].DepartmentID;
			}, function(error){
				utils.errorHandler(error);
			})

			var req2 = utils.serverRequest("/human-resources/staff/view-staff-profile?resourceId="+utils.userSession.getID(), "GET");

			req2.then(function(response){
				$scope.currentStaffInfo = response[0];
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}

	$scope.staffProfileExists = function(){
		return typeof $scope.currentStaffInfo != "undefined";
	}

	$scope.showEmmetBlueInfo = function(){
		utils.alert("Emmetblue "+$scope.currentYear, "This software has been designed for and deployed to St. Gerard's Catholic Hospital. Unless stated otherwise, every part of the system is considered a property of Emmetblue and are presently in the closed-source domain with appropriate licenses. Contact an appropriate department for help or samueladeshina73@gmail.com for technical support.", "info");
	}

	checkLogin();
	loadUserProfile();	
});