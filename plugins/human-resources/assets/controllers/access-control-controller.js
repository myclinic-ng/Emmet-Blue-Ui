angular.module("EmmetBlue")

.controller("humanResourcesAccessControlController", function($scope, utils){
	$scope.departments = {};
	$scope.resources = {};
	$scope.departmentGroups = [];

	$scope.department = {};

	var loadDepartments = function(){
		var loadDepartments = utils.serverRequest('/human-resources/department/view', 'GET');

		loadDepartments.then(function(response){
			angular.forEach(response, function(val, key){
				if (typeof $scope.departments[val.GroupName] !== "undefined"){
					$scope.departments[val.GroupName].push(val);
				}
				else
				{
					$scope.departments[val.GroupName] = [val];
					$scope.departmentGroups.push(val.GroupName);
				}
			})
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	var loadResources = function(role){
		var department = $scope.departmentSelector;
		var loadResources = utils.serverRequest('/permission/access-control/view-permissions?resourceId=0&role='+role+'&department='+department, 'GET');

		loadResources.then(function(response){
			$scope.resources = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	$scope.loadDepartment = function(department, name){
		$scope.departmentSelector = name;
		var rolePromise = utils.serverRequest('/human-resources/role/view-by-department?resourceId='+department, 'GET');

		rolePromise.then(function(response){
			$scope.department.role = response;
		}, function(response){
			utils.errorHandler(response);
		})

	}

	$scope.$watch("roleSelector", function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			loadResources(newValue);
		}
	})

	$scope.changePermission = function(resource, department, permission, status){
		var permissionChangeRequest = utils.serverRequest("/permission/access-control/set-permission", "POST", {
			"department":$scope.departmentSelector,
			"role": $scope.roleSelector,
			"resource-name":resource,
			"permission-department":department,
			"status":status,
			"permission":permission
		});

		permissionChangeRequest.then(function(response){
			utils.alert("Changes Saved", "ACL Updated successfully", "success", "notify");
		}, function(response){
			utils.errorHandler(response);
		})
	}

	loadDepartments();
})