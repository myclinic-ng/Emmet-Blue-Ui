angular.module("EmmetBlue")

.controller('humanResourcesDepartmentGroupController', function($scope, utils, DTOptionsBuilder, DTColumnBuilder){
	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		var departmentGroups = utils.serverRequest('/human-resources/department-group/view', 'GET');

		departmentGroups.then(function(response){
			console.log(response);
		});
		return departmentGroups;
	});
});