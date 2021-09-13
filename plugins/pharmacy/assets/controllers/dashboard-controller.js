angular.module("EmmetBlue")

.controller("pharmacyStoreDashboardController", function($scope, utils){
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/pharmacy/assets/includes/";
		switch(segment){
			case "manage-inventories":{
				$scope.pageSegment = urlPart+"dashboard-store-inventory.html";
				break;
			}
			case "store-management":{
				$scope.pageSegment = urlPart+"store-management.html";
				break;
			}
			case "dispensation-log":{
				$scope.pageSegment = urlPart+"dispensory.html";
				break;
			}
			case "summaries-statistics":{
				$scope.pageSegment = urlPart+"statistics-dashboard.html";
				break;
			}
			case "stock-values":{
				$scope.pageSegment = urlPart+"stock-values.html";
				break;
			}
			case "sales-pulse":{
				$scope.pageSegment = urlPart+"sales-pulse.html";
				break;
			}
		}
	}

	$scope.loadPageSegment('stock-values');
})