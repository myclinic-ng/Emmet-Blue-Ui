angular.module("EmmetBlue")

.controller('humanResourcesStaffManagementController', function($scope, utils){
	var functions = {
		loadDepartments: function(){
			var loadDepartments = utils.serverRequest('/human-resources/department/view', 'GET');

			loadDepartments.then(function(response){
				angular.forEach(response, function(val, key){
					if (typeof $scope.departments[val.GroupName] !== "undefined"){
						$scope.departments[val.GroupName].push(val);
					}
					else
					{
						$scope.departments[val.GroupName] = [val];
					}
				})

				console.log($scope.departments);
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		},
		loadRoles: function(department){
			var loadRoles = utils.serverRequest('/human-resources/role/view-by-department?resourceId='+department, 'GET');

			loadRoles.then(function(response){
				$scope.roles = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		},
		newStaffCreated: function(){
			utils.alert("Operation Successful", "You have successfully registered a new staff", "success", "notify", "both");
			$scope.newStaff = {};
		},
	}

	functions.loadDepartments();
	$scope.departments = {};
	$scope.newStaff = {
		staff:{},
		department:{},
		role:{}
	};
	$scope.$watch(function(){
		return $scope.newStaff.department.departmentId;
	}, function(newValue){
		functions.loadRoles(newValue);
	})

	$scope.submitNewStaffForm = function(){
		var newStaff = $scope.newStaff;

		var save = utils.serverRequest('/human-resources/staff/new-staff-with-department-and-role', 'POST', newStaff);

		save.then(function(response){
			functions.newStaffCreated();
		}, function(response){
			utils.errorHandler(response);
		});
	}
})