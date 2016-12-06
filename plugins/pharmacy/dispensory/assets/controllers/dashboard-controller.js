angular.module("EmmetBlue")

.controller("pharmacyDispensoryDashboardController", function($scope, utils){
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/pharmacy/dispensory/assets/includes/";
		switch(segment){
			case "queue":{
				$scope.pageSegment = urlPart+"queued-requests.html";
				break;
			}
			case "dispensation-log":{
				$scope.pageSegment = "plugins/pharmacy/assets/includes/dispensory.html";
				break;
			}
		}
	}

	$scope.loadPageSegment('queue');
})