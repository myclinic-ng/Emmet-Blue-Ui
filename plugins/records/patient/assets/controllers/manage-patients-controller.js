angular.module("EmmetBlue")

.controller("recordsPatientManagePatientsController", function($scope, utils){
	$scope.utils = utils;
	$scope.disablers = {
		enable_camera: true,
		take_snapshot: false,
		snapshot_taken: false
	};

	$scope.eDisablers = function(option){
		switch(option){
			case "enable":{
				$scope.disablers.take_snapshot = true;
				$scope.disablers.enable_camera = false;
				$scope.disablers.snapshot_taken = false;
				break;
			}
			case "take":{
				$scope.disablers.take_snapshot = false;
				$scope.disablers.enable_camera = false;
				$scope.disablers.snapshot_taken = true;
				break;
			}
			case "retake":{
				$scope.disablers.take_snapshot = true;
				$scope.disablers.enable_camera = false;
				$scope.disablers.snapshot_taken = false;
				break;
			}
		}
	}

	var self = this;

	  $scope.recordSubmitURL = "http://192.168.173.1/EmmetBlueApi/v1/patients/patient/new";


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

		        $("#save-all").on("click", function(e) {
		            e.preventDefault();
		            e.stopPropagation();
		            dzClosure.processQueue();
		        });

		        this.on("sending", function(data, xhr, formData) {
		        	$scope.newPatient.patientPassport = $("#passport").attr("src");
		        	angular.forEach($scope.newPatient, function(value, key){
		        		formData.append(key, value);
		        	});
		        });

		        this.on("errormultiple", function(file, errorMessage, xhr){
	  				utils.alert("Error", "Unable to save record", "error")
		        })

		        this.on("successmultiple", function(file, errorMessage, xhr){
	  				utils.alert("Info", "Record Uploaded successfully", "success");
	  				$scope.newPatient = {};
	  				$("#passport").attr("src", "plugins/records/patient/assets/images/passport-placeholder.png");
	  				$scope.eDisablers("enable");
	  				$("#new_patient").modal("hide");
	  				$scope.reloadTable();
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
	.withOption('createdRow', function(row, data, dataIndex){
		utils.compile(angular.element(row).contents())($scope);
	});

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn("PatientUUID").withTitle("Patient Number").notVisible(),
		utils.DT.columnBuilder.newColumn("PatientFullName").withTitle("Name"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(actionMarkup).notSortable()
	]

	function actionMarkup(data, type, full, meta){
		var list = "<ul class='icons-list text-nowrap'>"+
						"<li class='dropdown'>"+
							"<a href='#' class='dropdown-toggle' data-toggle='dropdown'><i class='icon-menu9'></i></a>"+

							"<ul class='dropdown-menu dropdown-menu-right'>"+
					        	"<li><a href='#' ng-click='loadPatientProfile("+data.PatientID+")'><i class='icon-user'></i> View Profile</a></li>"+
					        	"<li><a href='#'><i class='icon-cog'></i> Modify Profile</a></li>"+
							"</ul>"+
						"</li>"+
					"</ul>";

		return list;
	}

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

	$scope.patientProfile = {};
	$scope.patientProfileMeta = {};
	$scope.loadPatientProfile = function(id){
		var loadProfile = utils.serverRequest("/patients/patient/view?resourceId="+id, "GET");

		loadProfile.then(function(response){
			$scope.patientProfileMeta = response[0];
			console.log($scope.patientProfileMeta["PatientIdentificationDocumentUrl"]);
			delete response[0];
			$scope.patientProfile = response;
		}, function(response){
			utils.errorHandler(response);
		})
	}	
})