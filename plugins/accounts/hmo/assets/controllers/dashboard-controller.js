angular.module("EmmetBlue")

.controller("accountsHmoDashboardController", function($scope, utils){
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/accounts/hmo/assets/includes/";
		switch(segment){
			case "new-patient":{
				$scope.pageSegment = urlPart+"new-patient-registration.html";
				break;
			}
			case "view-database":{
				$scope.pageSegment = urlPart+"hmo-patients-database.html";
				break;
			}
			case "verify-identity":{
				$("#identityVerifier").modal("show");
				break;
			}
			case "update-database":{
				utils.alert("Feature Unsupported", "This feature requires a csv or json preformatted data file to be uploaded, this is currently unsupported by major HMOs and several health care providers. Contact an administrator for more information", "info");
				break;
			}
		}
	}

	$scope.loadPageSegment('view-database');
})