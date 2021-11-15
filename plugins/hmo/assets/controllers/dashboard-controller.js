angular.module("EmmetBlue")

.controller("hmoDashboardController", function($scope, utils, $location){
	$scope.loadImage = utils.loadImage;
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/hmo/";
		switch(segment){
			case "patients":{
				$scope.pageSegment = urlPart+"patients.html";
				$scope.pageTitle = "Patients";
				$scope.pageLink = "hmo/patients";
				break;
			}
			case "requests":{
				$scope.pageSegment = urlPart+"patient-workspace.html";
				$scope.pageTitle = "Admitted Patients Workspace";
				$scope.pageLink = "hmo/patient-workspace";
				break;
			}
			case "claims":{
				$("#_diagnosis-log").modal("show");
				break;
			}
			case "support":{
				utils.alert("Coming soon", "", "info");
				break;
			}
		}
	}

	$scope.loadPageSegment('patients');
})