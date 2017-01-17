angular.module("EmmetBlue")

.controller("accountsNewPatientHmoProfileController", function($scope, utils){
	$scope.utils = utils;
	$scope.loadPatient = function(patient){
    	// var patient = $scope.patientUuid;
    	var query = {
			query: patient,
			from: 0,
			size: 1
		};

    	var req = utils.serverRequest('/patients/patient/search', 'POST', query);

    	req.then(function(response){
    		var result = response.hits.hits;
			if (result.length != 1){
				utils.alert("Unable to load profile", "You have sent an ambiguous request to the server. Please refine your search query and try again. It is recommended to use an actual patient number for search.", "info");
			}
			else {
				$scope.patientProfile = result[0]["_source"];
				$scope.isProfileReady = true;
				$scope.hmoPatient["PatientID"] = $scope.patientProfile.patientid;
				functions.loadHmoPatientFieldTitles($scope.patientProfile.patienttype);
				utils.notify("Profile loaded successfully", "", "info");
			}
    	}, function(error){
    		utils.errorHandler(error);
    	})
    }

	var functions = {
		loadHmoPatientFieldTitles: function(id){
			var sendForprofileFieldTitles = utils.serverRequest('/accounts-biller/hmo-field-title/view-by-patient-type?resourceId='+id, 'GET');

			sendForprofileFieldTitles.then(function(response){
				$scope.profileFieldTitles = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		}
	}

	$scope.profileFieldTitles = {};
	$scope.hmoPatient = {};

	$("#document").on("change", function(){
		$scope.documentUploaded();
	});

	$scope.documentUploaded = function(){
		var file = document.getElementById('document').files[0];
  		var reader = new FileReader();
  		reader.onloadend = function(e){
  			var data = e.target.result;
  			$scope.hmoPatient.documents = data;
  		}
  		reader.readAsDataURL(file);
	}

	$scope.submit = function(){
		$scope.hmoPatient.patientId = $scope.patientProfile.patientid;
		var hmoPatient = utils.serverRequest('/accounts-biller/hmo-field-value/new', 'post', $scope.hmoPatient);
		hmoPatient.then(function(response){
			utils.alert('Operation Successful', 'The patient HMO registration was completed successfully', 'success', 'both');
			$scope.hmoPatient = {};
			$scope.isProfileReady = false;
			$('#new-hmoPatient-registration').modal('hide');
		}, function(error){
			utils.errorHandler(error, true);
		});
	}
	
});