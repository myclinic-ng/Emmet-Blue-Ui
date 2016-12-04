angular.module("EmmetBlue")

.controller("pharmacyStoreDashboardController", function($scope, utils){
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/pharmacy/assets/includes/";
		switch(segment){
			case "manage-inventories":{
				$scope.pageSegment = urlPart+"new-patient-registration.html";
				break;
			}
			case "store-management":{
				$scope.pageSegment = urlPart+"dashboard-store-inventory.html";
				break;
			}
			case "dispensation-log":{
				$scope.pageSegment = urlPart+"dispensory.html";
				break;
			}
			case "update-database":{
				utils.alert("Feature Unsupported", "This feature requires a csv or json preformatted data file to be uploaded, this is currently unsupported by major HMOs and several health care providers. Contact an administrator for more information", "info");
				break;
			}
		}
	}

	$scope.loadPageSegment('store-management');
})