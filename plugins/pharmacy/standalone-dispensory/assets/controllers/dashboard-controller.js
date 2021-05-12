angular.module("EmmetBlue")

.controller("pharmacyStandaloneDispensoryDashboardController", function($scope, utils){
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/pharmacy/standalone-dispensory/assets/includes/";
		switch(segment){
			case "new-dispensation":{
				$scope.pageSegment = urlPart+"new-dispensation.html";
				break;
			}
			case "dispensation-log":{
				$scope.pageSegment = "plugins/pharmacy/assets/includes/dispensory.html";
				break;
			}
			case "billing-workspace":{
				$scope.pageSegment = "plugins/pharmacy/standalone-dispensory/billing-workspace.html";
				break;
			}
			case "transactions":{
				$scope.pageSegment = "plugins/pharmacy/standalone-dispensory/transactions.html";
				break;
			}
		}
	}

	$scope.loadPageSegment('new-dispensation');
})