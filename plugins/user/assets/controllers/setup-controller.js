angular.module("EmmetBlue")

.controller('userSetupController', function($scope, utils, $cookies, $location, $timeout){
	var req = utils.serverRequest("/human-resources/staff/view-staff-role/"+utils.userSession.getID(), "GET");
	req.then(function(response){
		redirectUser(response.RoleID);
	}, function(error){
		utils.errorHandler(error);
	});

	var redirectUser = function(role){
		if (role == 1){
			//is business owner
			var businessType = utils.userSession.getBusinessInfo().BusinessType.toLower();

			switch(businessType){
				case "pharmacy":{
					
					break;
				}
				case "lab":{
					break;
				}
				case "hospital":{
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
})