angular.module("EmmetBlue")

.controller('labPatientDatabaseController', function($scope, utils, $rootScope){
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		switch(segment){
			case "pending":{
				$scope.pageSegment = "plugins/lab/patients.html";
				break;
			}
			case "results":{
				$scope.pageSegment = "plugins/lab/published-results.html";
				break;
			}
		}
	}

	$scope.loadPageSegment('pending');
});