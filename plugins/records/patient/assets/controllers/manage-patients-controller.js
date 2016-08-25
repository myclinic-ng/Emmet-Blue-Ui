angular.module("EmmetBlue")

.controller("recordsPatientManagePatientsController", function($scope, utils){

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
	  
	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest("/patients/patient/view", "GET");

		return request;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
	.withFixedHeader()
	.withButtons([
		{
			text: '<u>N</u>ew Patient',
			action: function(){
				$("#new_patient").modal("show");
			},
			key: {
        		key: 'n',
        		ctrlKey: false,
        		altKey: true
        	}
		},
        {
        	extend: 'print',
        	text: '<u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	}
        },
        {
        	extend: 'copy',
        	text: '<u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: false,
        		altKey: true
        	}
        }
	]);

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn("PatientUUID").withTitle("Patient Number"),
		utils.DT.columnBuilder.newColumn("PatientFirstName").withTitle("First Name"),
		utils.DT.columnBuilder.newColumn("PatientLastName").withTitle("Last Name"),
		utils.DT.columnBuilder.newColumn("PatientDateOfBirth").withTitle("Date Of Birth"),
		utils.DT.columnBuilder.newColumn("PatientAddress").withTitle("Address"),
		utils.DT.columnBuilder.newColumn("PatientPhoneNumber").withTitle("Phone Number")
	]

	$scope.dtInstance = {};
	$scope.reloadTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.saveNewPatient = function(){
		var patient = $scope.newPatient;

		console.log($scope.newPatient);

		var request = utils.serverRequest("/patients/patient/new", "POST", patient);

		request.then(function(response){
			utils.notify("Operation Successful", $scope.newPatient.firstName+" "+$scope.newPatient.lastName+"'s record has been saved successfully", "success");
			$scope.newPatient = {};
			$("#new_patient").modal("hide");
			$scope.reloadTable();
		}, function(response){
			utils.errorHandler(response);
		});
	}
})