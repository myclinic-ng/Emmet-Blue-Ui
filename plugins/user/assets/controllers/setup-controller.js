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
					bootstrapPharmacy();
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

	var bootstrapPharmacy = function(){
		var req = _requests.createDepartment('Pharmacy Quick Setup');
		req.then(function(response){
			$scope.deptId = response.lastInsertId;
			$scope.redirectMessage = "Creating a secure tunnel ...";
			_requests.createDepartmentUrl($scope.deptId, 'user/pharmacy-setup/index')
			.then(function(response){
				$scope.redirectMessage = "Enabling access to bootstrapped tunnel ...";
				_requests.assignSecondaryDepartment($scope.deptId, utils.userSession.getID())
				.then(function(response){
					_requests.switchDepartment($scope.deptId, utils.userSession.getID())
					.then(function(response){
						$scope.redirectMessage = "Redirecting to set-up page ...";
						updateCookieDashboardUrl(response.Url, response.DepartmentID);
					}, function(error){ utils.errorHandler(error) });
				}, function(error){ utils.errorHandler(error) });
			}, function(error){ utils.errorHandler(error) });
		}, function(error){
			utils.errorHandler(error);
		})
	}

	var _requests = {
		createDepartment: function(name){
			return utils.serverRequest("/human-resources/department/new", "POST", {
				name: name,
				groupId: 1
			});
		},
		createDepartmentUrl: function(id, url){
			return utils.serverRequest("/human-resources/department/new-root-url", "POST", {
				url: url,
				department: id
			});
		},
		assignSecondaryDepartment: function(dept, staff){
			return utils.serverRequest("/human-resources/staff-department/assign-secondary", "POST", {
				staff: staff,
				department: dept
			});
		},
		switchDepartment: function(dept, staff){
			return utils.serverRequest("/user/account/get-switch-data", "POST", {
				staff: staff,
				department: dept
			});
		}
	}


	function updateCookieDashboardUrl(url, department = ""){
		var cookie = $cookies.getObject(utils.globalConstants.USER_COOKIE_IDENTIFIER);
		cookie.dashboard = url;
		$cookies.putObject(utils.globalConstants.USER_COOKIE_IDENTIFIER, cookie);
		
		$location.path(url);
		if (department !== ""){
			utils.storage.currentStaffDepartmentID = department
		}
	}
})