angular.module("EmmetBlue")

.controller("mortuaryManageBodiesController", function($scope, utils, $location){
	$scope.pageSegment = "";
	var urlPart = "plugins/mortuary/";
	$scope.loadPageSegment = function(segment){
		switch(segment){
			case "new-body":{
				$scope.pageSegment = "plugins/mortuary/assets/includes/new-body-template.html";
				break;
			}
			case "view-bodies":{
				// $scope.pageSegment = "plugins/mortuary/assets/includes/view-body.html";
				$location.path("mortuary/view-bodies")
				break;
			}
		}
	}

	$scope.loadPageSegment("new-body");
})