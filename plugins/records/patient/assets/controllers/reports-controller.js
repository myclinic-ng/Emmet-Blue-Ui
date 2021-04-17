angular.module("EmmetBlue")

.controller("recordsReportsController", function($scope, utils){
	$scope.pageSegment = "";
	$scope.dateRange = (new Date()).toLocaleDateString()+ " - " +(new Date()).toLocaleDateString();
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/records/patient/assets/includes/reports/";
		switch(segment){
			case "patient-registrations":{
				$scope.pageSegment = urlPart+"patient-registrations.html";
				break;
			}
			case "patient-visits-list":{
				$scope.pageSegment = urlPart+"patient-visits-list.html";
				break;
			}
		}
	}

	$scope.loadPageSegment('patient-registrations');

	$scope.$watch("dateRange", function(value){
		var dates = value.split(" - ");
		utils.storage.currentReportDateRange = dates;
	})
})