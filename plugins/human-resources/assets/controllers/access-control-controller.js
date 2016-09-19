angular.module("EmmetBlue")

.controller("humanResourcesAccessControlController", function($scope, utils){
	$scope.departments = {};
	$scope.departmentGroups = [];

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
	loadDepartments();
})