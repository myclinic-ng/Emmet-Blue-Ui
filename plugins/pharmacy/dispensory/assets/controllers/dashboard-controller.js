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
			case "new-dispensation":{
				$scope.pageSegment = urlPart+"store-management.html";
				break;
			}
			case "dispensation-log":{
				$scope.pageSegment = urlPart+"dispensory.html";
				break;
			}
			case "forward":{
				$scope.pageSegment = urlPart+"statistics-dashboard.html";
				break;
			}
		}
	}

	$scope.loadPageSegment('queue');
})