angular.module("EmmetBlue")

.controller('coreController', function($scope, $location, $routeParams, CONSTANTS, utils, $cookies){
	$scope.loadImage = utils.loadImage;
	$scope.userClient = utils.globalConstants.USER_CLIENT;

	$scope.businessInfo = {
		BusinessName: 'Emmetcare'
	}

	$scope.$on('$locationChangeStart', function(event, current, previous){
		var path = ($location.path()).split('/');
		var userDashboard = ("/"+utils.userSession.getDashboard()).split("/");
		delete path[path.length - 1];
		delete userDashboard[userDashboard.length - 1];

		var dirPath = path.join("/");
		var dirUserDashboard = userDashboard.join("/");
		if (path[1] !== "" && dirUserDashboard !== dirPath){
			if (path[1] != "user"){
				utils.notify("You have been redirected", "Unable to authorize your access to the requested page. Please use the switch department option to switch to a different department", "info");
				$location.path('user/home');
			}
		}
		else {
		}

		delete path[path.length - 1];

		var moduleMenu = CONSTANTS.TEMPLATE_DIR +
						 path.join('/').replace(/^\//g, '')+ //strip the first backslash
						 CONSTANTS.MODULE_MENU_LOCATION;
		var moduleHeader = CONSTANTS.TEMPLATE_DIR +
						 path.join('/').replace(/^\//g, '')+
						 CONSTANTS.MODULE_HEADER_LOCATION;

		$scope.moduleMenu = moduleMenu;
		$scope.moduleHeader = moduleHeader;
	});

	var checkLogin = function(){
		if ($location.path() != '/user/login'){
			utils.userSession.cookie();

			$.sessionTimeout({
				heading: 'h5',
				title: 'Session expiration',
				message: 'Your session is about to expire. Do you want to stay connected and extend your session?',
				keepAlive: false,
				warnAfter: 900000, //10 mins
				redirAfter: 1020000, //15 mins
				ignoreUserActivity: false,
				onWarn: function(){
				    var title = "IDLE TIMEOUT";
					var text = "Your session is about to expire. Click on the cancel button to stay connected and extend your session or click on Logout to close the current session"
					var close = true;
					var type = "info";
					var btnText = "Logout";

					var process = function(){
						$scope.logout();
					}

					utils.confirm(title, text, close, process, type, btnText);
				},
				onRedir: function(){
				    utils.notify('Your session has expired!', 'You are being redirected to the login page, please enter your username and password to access your account', 'info');
				    $scope.logout();
				}
			});
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
			$scope.businessInfo = utils.userSession.getBusinessInfo();
			$("#appTitle").text("Emmetblue - "+$scope.businessInfo.BusinessName);
			if (typeof utils.userSession.getID() !== "undefined"){
				var req = utils.serverRequest("/human-resources/staff/view-staff-with-department-and-role?uuid="+utils.userSession.getUUID(), "GET");

				req.then(function(response){
					if (typeof response[0] !== "undefined"){
						$scope.currentStaffDepartmentInfo = response[0];
						utils.storage.currentStaffDepartmentID = response[0].DepartmentID;
					}
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
	}

	$scope.staffProfileExists = function(){
		return typeof $scope.currentStaffInfo != "undefined";
	}

	$scope.showEmmetBlueInfo = function(){
		utils.alert("Emmetblue "+$scope.currentYear, "This software has been customized for and deployed to "+$scope.userClient.short_name+". Unless stated otherwise, every part of the system is considered a property of Emmetblue and are presently in the closed-source domain with appropriate licenses. Contact an appropriate department for help or samueladeshina73@gmail.com for technical support.", "info");
	}

	function updateCookieDashboardUrl(url, department = ""){
		var cookie = $cookies.getObject(utils.globalConstants.USER_COOKIE_IDENTIFIER);
		cookie.dashboard = url;
		$cookies.putObject(utils.globalConstants.USER_COOKIE_IDENTIFIER, cookie);

		if (department !== ""){
			utils.storage.currentStaffDepartmentID = department
		}

		$location.path(url);
	}

	$scope.$watch(function(){
		return utils.storage.currentStaffDepartmentID;
	}, function(nv){
		if (typeof nv !== "undefined"){
			var req = utils.serverRequest("/human-resources/department/view?resourceId="+nv, "GET");
			req.then(function(response){
				if (typeof response !== "undefined" && typeof response[0] !== "undefined"){
					$scope.currentDepartmentName = response[0].Name;
				}
			});	
		}
	})

	$scope.switch = function(id){
		var data = {
			"staff": utils.userSession.getID(),
			"department":id
		};

		utils.serverRequest("/user/account/get-switch-data", "POST", data)
		.then(function(response){
			updateCookieDashboardUrl(response.Url, response.DepartmentID);
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.returnToPrimaryDept = function(){
		utils.serverRequest("/human-resources/staff/view-root-url?resourceId="+utils.userSession.getID(), "GET").then(function(response){
			updateCookieDashboardUrl(response.Url, response.DepartmentID);
		}, function(error){
			utils.errorHandler(error);
		})
	}

	checkLogin();
	loadUserProfile();

	$scope.showSwitchLoader = false;
	$scope.loadSwitchableDepts = function(){
		if (typeof $scope.switchableDepartments == "undefined"){
			$scope.showSwitchLoader = true;
			utils.serverRequest("/human-resources/staff-department/view-secondary-departments?resourceId="+utils.userSession.getID(), "GET")
			.then(function(response){
				$scope.showSwitchLoader = false;
				$scope.switchableDepartments = response;
			}, function(error){
				$scope.showSwitchLoader = false;
				utils.errorHandler(error);
			})
		}
	}

	$scope.switchRandomColors = ["#41E1D7", "#E18441", "#6141E1", "#E14154", "#FFA03B","#41E1D7", "#E18441", "#6141E1", "#E14154", "#FFA03B","#41E1D7", "#E18441", "#6141E1", "#E14154", "#FFA03B"];

	var userSessionQrCodeHandler = function(){
		$(".userSessionQrCodeSvg").html(utils.generateQrCode(JSON.stringify(utils.userSession.cookie()), "user"));
	}

	$scope.showBillingMenu = false;

	$scope.toggleBillingMenu = function(){
		if (!$scope.showBillingMenu){
			$scope.getCurrentBusinessAccount();
		}
		$scope.showBillingMenu = !$scope.showBillingMenu;
	}

	$scope.getCurrentBusinessAccount = function(){
		utils.serverRequest('v1/business/get-account-balance', 'GET')
		.then(function(response){
			$scope.currentBusinessAccount = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}
});