angular.module("EmmetBlue")

.controller('userSetupController', function($scope, utils, $cookies, $location, $timeout){
	$scope.redirectMessage = "Please wait, we are putting things in place...";
	var req = utils.serverRequest("/human-resources/staff/view-staff-role/"+utils.userSession.getID(), "GET");
	req.then(function(response){
		redirectUser(response.RoleID);
	}, function(error){
		utils.errorHandler(error);
	});

	var redirectUser = function(role){
		if (role == 1){
			//is business owner
			var businessType = utils.userSession.getBusinessInfo().BusinessType.toLowerCase();

			switch(businessType){
				case "pharmacy":{
					bootstrap("pharmacy");
					break;
				}
				case "lab":{
					bootstrap("lab");
					break;
				}
				case "hospital":{
					bootstrap("hospital");
					break;
				}
				default:{
					//unknown business type
				}
			}

		}
		else {
			//not business owner
		}
	}

	var bootstrap = function(profile){
		var prefRole = "general";
		if (profile == "pharmacy"){
			prefRole = "standalone";
		}

		var req = utils.serverRequest("/setup/init/run?profile="+profile+"&pref-role="+prefRole, "GET");
		req.then(function(response){
			$scope.redirectMessage = "Redirecting to account activation page...";
			utils.notify("Default Accounts Created & Initialized Successfully", "Congratulations, Your EmmetBlue instance has been is ready for use", "success");

			window.location.assign('user/activate-profile');
		}, function(error){
			utils.errorHandler(error);
		})
	}
})