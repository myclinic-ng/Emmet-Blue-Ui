angular.module("EmmetBlue")

.controller("nursingManageController", function($scope, utils){
	$scope.pageSegment = "";
	var urlPart = "plugins/nursing/";
	$scope.loadPageSegment = function(segment){
		switch(segment){
			case "new-observation-chart":{
				$scope.pageSegment = "plugins/nursing/assets/includes/observation-chart-form.html";
				break;
			}
			case "view-observation-chart":{
				$scope.pageSegment = "plugins/nursing/observation-chart.html";
				break;
			}
		}
	}
})