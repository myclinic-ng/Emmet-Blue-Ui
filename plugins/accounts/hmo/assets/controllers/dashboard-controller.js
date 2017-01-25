angular.module("EmmetBlue")

.controller("accountsHmoDashboardController", function($scope, utils){
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment, pageTitle){
		var urlPart = "plugins/accounts/hmo/assets/includes/";
		$scope.pageTitle = pageTitle;
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
				$scope.pageSegment = urlPart+"hmo-unprocessed-requests.html";
				break;
			}
			case "load-documents":{
				$scope.pageSegment = "plugins/accounts/hmo/documents.html";
				break;
			}
			case "update-database":{
				utils.alert("Feature Unsupported", "This feature requires a csv or json preformatted data file to be uploaded, this is currently unsupported by major HMOs and several health care providers. Contact an administrator for more information", "info");
				break;
			}
		}
	}

	$scope.patientTypes = [];
	$scope.loadPatientTypes = function(){
		$(".sp").addClass("fa-spin");
		if (typeof (utils.userSession.getID()) !== "undefined"){
			var requestData = utils.serverRequest("/accounts-biller/department-patient-types-report-link/view-by-staff?resourceId="+utils.userSession.getID(), "GET");
			requestData.then(function(response){
				for (var i = response.length - 1; i >= 0; i--) {
					$scope.patientTypes.push(response[i].PatientTypeID);
				}
				$scope.loadUnlockedPatients();
			}, function(responseObject){
				utils.errorHandler(responseObject);
			});
		}
	}

	$scope.loadPatientTypes();

	$scope.loadUnlockedPatients = function(){
		$(".sp").addClass("fa-spin");
		var req = utils.serverRequest("/patients/patient/view-unlocked-profiles?patienttype="+$scope.patientTypes.join(","), "GET");

		req.then(function(response){
			$scope.unlockedPatients = response;
			$scope.lastRefreshTime = (new Date()).toLocaleTimeString();
			$(".sp").removeClass("fa-spin");
		})
	}

	$scope.loadPageSegment('view-database', 'View Patient Database');
})