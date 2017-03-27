angular.module("EmmetBlue")

.controller('labNewPatientController', function($scope, utils, patientEventLogger, $rootScope){
	$scope.loadImage = utils.loadImage;
	$scope.patient = {};

	$scope.$watch(function(){
		return utils.storage.processedNewPatient;
	}, function(nv){
		if (typeof nv != "undefined"){
			$scope.patientNumber = nv.patientUuid;
			$scope.patientLab = nv.labId;
			$scope.currentRequestId = nv.investigationId;
			$scope.patient.clinicalDiagnosis = nv.clinicalDiagnosis;
			$scope.patient.investigationRequired = nv.investigationRequired;
			$scope.patient.requestedBy = nv.requestedBy;
			$scope.patient.dateRequested = nv.dateRequested;
			$scope.loadPatientProfile();
		}
	})

	$scope.loadPatientProfile = function(){
		var patient = utils.serverRequest("/patients/patient/search", "POST", {
			"query":$scope.patientNumber,
			"from":0,
			"size":1
		});

		patient.then(function(response){
			if (typeof response.hits.hits[0] !== "undefined"){
				var profile = response.hits.hits[0]["_source"];
				$scope.patient.firstName = profile["first name"];
				$scope.patient.lastName = profile["last name"];
				$scope.patient.gender = profile["gender"];
				$scope.patient.phoneNumber = profile["phone number"];
				$scope.patient.dateOfBirth = profile["date of birth"];
				$scope.patient.address = profile["home address"];
				$scope.patient.patientID = profile["patientid"];
				$scope.patient.picture = profile["patientpicture"];	
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}

	function loadLabs(){
		utils.serverRequest("/lab/lab/view", "GET").then(function(response){
			$scope.labs = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadLabs();

	$scope.investigationTypeArray = []
	$scope.$watch(function(){
		return $scope.patientLab;
	}, function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			utils.serverRequest("/lab/investigation-type/view-by-lab?resourceId="+newValue, "GET").then(function(response){
				$scope.investigationTypes = response;
				angular.forEach(response, function(value, key){
					$scope.investigationTypeArray[value.InvestigationTypeID] = value;
				})
			}, function(error){
				utils.errorHandler(error);
			});
		}		
	});

	$scope.savePatient = function(){
		var patient = $scope.patient;

		console.log(patient);
		var result = utils.serverRequest("/lab/patient/new", "POST", patient);
		result.then(function(response){
			utils.alert("Operation successful", "New patient registered successfully", "success");

			utils.serverRequest("/lab/lab-request/close-request", "POST", {"request": $scope.currentRequestId, "staff": utils.userSession.getID()})
			.then(function(response){
				$rootScope.$broadcast("ReloadQueue");
			}, function(error){
				utils.errorHandler(error);
			});

			$("#_new_patient").modal("hide");
			$rootScope.$broadcast("reloadLabPatients", {});
			if (typeof $scope.patient.patientID !== "undefined"){
				var eventLog = patientEventLogger.lab.newPatientRegisteredEvent(
					$scope.patient.patientID,
					$scope.investigationTypeArray[$scope.patient.investigationTypeRequired].InvestigationTypeName, 
					response.lastInsertId
				);
				eventLog.then(function(response){
					//patient registered event logged
				}, function(response){
					utils.errorHandler(response);
				});
			}
		}, function(error){
			utils.errorHandler(error);
		});
	}
});