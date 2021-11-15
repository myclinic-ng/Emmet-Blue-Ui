angular.module("EmmetBlue")

.controller("hmoPatientsController", function($scope, utils, $location){
	$scope.getGenderAvatar = utils.getGenderAvatar;
	$scope.patientTypes = {};
	$scope.patients = [];
	$scope.loadPatientTypes = function(){
		if (typeof (utils.userSession.getID()) !== "undefined"){
			var requestData = utils.serverRequest("/accounts-biller/department-patient-types-report-link/view-by-staff?resourceId="+utils.userSession.getID(), "GET");
			requestData.then(function(response){
				$scope.patientTypes = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			});
		}
	}

	$scope.loadPatientTypes();

	$scope.viewPatientType = function(patientType){
		var requestData = utils.serverRequest("/patients/patient/view-by-patient-type?resourceId="+patientType, "GET");
		requestData.then(function(response){
			$scope.patients = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}
})