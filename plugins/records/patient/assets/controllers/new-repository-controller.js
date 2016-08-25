angular.module("EmmetBlue")

.controller("recordsPatientNewRepositoryController", function($scope, utils, $log){	
	var patientRequest = utils.serverRequest("/patients/patient/view", "GET");
	patientRequest.then(function(response){
		$scope.patients = response;

		angular.forEach(response, function(val, key){
			$scope.patients[key]["PatientFullName"] = val.PatientFirstName + " " + val.PatientLastName;
		});
	}, function(response){
		utils.errorHandler(response);
	})


	$scope.show_name = false;
	$scope.show_phone = false;
	$scope.show_number = true;

	$scope.patient = "";

	$scope.filterOption = function(option){
		if (option == "name"){
			$scope.show_name = true;
			$scope.show_phone = false;
			$scope.show_number = false;
		}
		if (option == "phone"){
			$scope.show_name = false;
			$scope.show_phone = true;
			$scope.show_number = false;
		}
		if (option == "number"){
			$scope.show_name = false;
			$scope.show_phone = false;
			$scope.show_number = true;
		}
	}

	var self = this;

	  $scope.recordSubmitURL = "http://192.168.173.1/EmmetBlueApi/v1/patients/patient-repository/new";

	  self.dropzoneConfig = {
	  	url: $scope.recordSubmitURL,
	  	paramName: "file",
	    parallelUploads: 100,
	    dictDefaultMessage: 'Drop files here to upload <span>or CLICK</span>',
	    dictErrorMessage: 'An error has occurred, please try again',
	    maxFileSize: 30,
	    addRemoveLinks: true,
	    autoProcessQueue: false,
	    uploadMultiple: true,
	    MaxFiles: 20,
	    init: function() {
		        dzClosure = this;

		        document.getElementById("submit-all").addEventListener("click", function(e) {
		            e.preventDefault();
		            e.stopPropagation();
		            dzClosure.processQueue();
		        });

		        this.on("sendingmultiple", function(data, xhr, formData) {
		        	formData.append("name", $("#name").val());
			  		formData.append("patient", $scope.patient);
			  		formData.append("description", $("#description").val());
		        });

		        this.on("errormultiple", function(file, errorMessage, xhr){
	  				utils.alert("Error", "Unable to save record", "error")
		        })

		        this.on("successmultiple", function(file, errorMessage, xhr){
	  				utils.alert("Info", "Record Uploaded successfully", "success");
	  				$("#name").val("");
	  				$("#patient").val("");
	  				$("#description").val("");
		        });

		        this.on("queuecomplete", function() {
				  dzClosure.removeAllFiles();
				});
		    }
	  };
})