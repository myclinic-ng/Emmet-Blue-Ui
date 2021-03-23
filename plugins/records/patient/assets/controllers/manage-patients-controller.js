angular.module("EmmetBlue")

.controller("recordsPatientManagePatientsController", function($scope, utils, patientEventLogger, $timeout){
	$scope.loadDeps = false;
	$scope.utils = utils;
	$scope.disablers = {
		enable_camera: true,
		take_snapshot: false,
		snapshot_taken: false
	};
	$scope.statesInNigeria = {};
	$scope.lgasInState = {};
	$scope.patientTypes = {};
	$scope.patientCategories = {};

	utils.loadNigeriaData().then(function(response){
		$scope.statesInNigeria = response;
	}, function(response){
		utils.errorHandler(response);
	});

	$scope.loadLGAs = function(){
		var state = $scope.newPatient['State Of Origin'];
		for (var i = 0, numOfStates = ($scope.statesInNigeria).length; i < numOfStates; i++){
			if ($scope.statesInNigeria[i].state.name == state){
				$scope.lgasInState = $scope.statesInNigeria[i].state.locals;
				return;
			}
		}
	}

	$scope.loadPatientTypes = function(categoryId){
		if (typeof categoryId !== "undefined"){
			var requestData = utils.serverRequest("/patients/patient-type/view-by-category?resourceId="+categoryId, "GET");
			requestData.then(function(response){
				$scope.patientTypes = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			});
		}
	}


	$scope.loadPatientCategories = function(){
		var requestData = utils.serverRequest("/patients/patient-type-category/view", "GET");
		requestData.then(function(response){
			$scope.patientCategories = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}

	$scope.$watch("patientCategory", function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			$scope.loadPatientTypes(newValue);	
		}
	})

	$scope.$watch("loadDeps", function(nv){
		if (nv == true){	
			$scope.loadPatientCategories();
		}
	})

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
	  	autoDiscover: false,
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

	        this.on("sendingmultiple", function(data, xhr, formData) {
	        	$scope.newPatient.patientPassport = $("#passport").attr("src");
	        	angular.forEach($scope.newPatient, function(value, key){
	        		if (typeof value !== "string"){
	        			angular.forEach(value, function(val, k){
	        				angular.forEach(val, function(v, _k){
	        					formData.append(key+"_"+k+"_"+_k, v);
	        				})
	        			});
	        		}
	        		else
	        		{
	        			formData.append(key, value);
	        		}
	        	});
	        });

	        this.on("errormultiple", function(file, errorMessage, xhr){
  				utils.alert("Error", "Unable to save record", "error")
	        })

	        this.on("successmultiple", function(file, errorMessage, xhr){
  				
	        });

	        this.on("queuecomplete", function() {
			  dzClosure.removeAllFiles();
			});
	    }
	};

	$scope.saveNewPatient = function(){

		var patient = $scope.newPatient;
		patient.createdBy = utils.userSession.getID();

		var request = utils.serverRequest("/patients/patient/new", "POST", patient);

		request.then(function(response){
			utils.notify("Operation Successful", $scope.newPatient.firstName+" "+$scope.newPatient.lastName+"'s record has been saved successfully", "success");
			$scope.newPatient = {};
			$("#new_patient").modal("hide");
		}, function(response){
			utils.errorHandler(response);
		});
	}

	$scope.patientProfile = {};
	$scope.patientProfileMeta = {};
	$scope.profileSelected = false;
	$scope.loadPatientProfile = function(id){
		if (!$scope.profileSelected){
			$("#patientTable").removeClass("col-md-12").addClass("col-md-3");
			$scope.profileSelected = true;
		}
		if (typeof(id) !== "undefined"){
			var loadProfile = utils.serverRequest("/patients/patient/view?resourceId="+id, "GET");

			loadProfile.then(function(response){
				$scope.patientProfileMeta = response[0];
				delete response[0];
				$scope.patientProfile = response;
			}, function(response){
				utils.errorHandler(response);
			})
		}
	}

	$scope.newPatient = {};
	$scope.newPatient.hospitalHistory = [];
	$scope.newPatient.diagnosis = [];
	$scope.newPatient.operation = [];
	$scope.newPatient.fingerprints = {};

	$scope.submitHospitalHistory = function(){
		if (typeof $scope.hospitalHistory !== "undefined"){
			$scope.newPatient.hospitalHistory.push($scope.hospitalHistory);
			$scope.hospitalHistory = {};
		}
		else {
			utils.alert("Incomplete information", "At least a field needs to be entered", "error");
		}
	}


	$scope.submitDiagnosis = function(){
		if (typeof $scope.diagnosis !== "undefined"){
			$scope.newPatient.diagnosis.push($scope.diagnosis);
			$scope.diagnosis = {};
		}
		else {
			utils.alert("Incomplete information", "At least a field needs to be entered", "error");
		}
	}

	$scope.submitOperation = function(){
		if (typeof $scope.operation !== "undefined"){
			$scope.operation.diagnosisType="operation";
			$scope.newPatient.operation.push($scope.operation);
			$scope.operation = {};
		}
		else {
			utils.alert("Incomplete information", "At least a field needs to be entered", "error");
		}
	}

	$("#document").on("change", function(){
		$scope.documentUploaded();
	});

	$scope.documentUploaded = function(){
		var file = document.getElementById('document').files[0];
  		var reader = new FileReader();
  		reader.onloadend = function(e){
  			var data = e.target.result;
  			$scope.newPatient.documents = data;
  		}
  		reader.readAsDataURL(file);
	}
	
	$scope.submit = function(){
  		$scope.newPatient.patientPassport = $("#passport").attr("src");

  		var data = $scope.newPatient;
  		if (typeof $scope.newPatient['First Name'] !== "undefined" || typeof $scope.newPatient['Last Name'] !== "undefined") {
  			data.patientName = $scope.newPatient['First Name'] + " " + $scope.newPatient['Last Name'];
  			data.createdBy = utils.userSession.getID();

	  		
			$('.loader').addClass('show');
	  		var submitData = utils.serverRequest("/patients/patient/new", "POST", data);

	  		submitData.then(function(response){
	  			$('.loader').removeClass('show');
	  			utils.alert("Operation Completed Successfully", "Submitted profile has been saved and activated", "success");

				var eventLog = patientEventLogger.records.newPatientRegisteredEvent(response.lastInsertId, response.lastInsertId);
				eventLog.then(function(response){
					//patient registered event logged
				}, function(response){
					utils.errorHandler(response);
				});

				$scope.newPatient = {};
				$scope.newPatient.hospitalHistory = [];
				$scope.newPatient.diagnosis = [];
				$scope.newPatient.operation = [];
				$scope.newPatient.fingerprints = {};

				$("#passport").attr("src", "plugins/records/patient/assets/images/passport-placeholder.png");
				$scope.eDisablers("enable");
				$("#new_patient").modal("hide");
				setTimeout(function(){
					if (typeof (response.lastInsertId) !== "undefined"){
						var _patient = utils.serverRequest("/patients/patient/view?resourceId="+response.lastInsertId, "GET");

						_patient.then(function(response){
							$scope.currentPatientCardData = response["_source"];
						}, function(response){
							utils.errorHandler(response);
						})
					}
				}, 1000);

				$("#patient_card").modal("show");
				loadPatients();
	  		}, function(response){
	  			$('.loader').removeClass('show');
	  			utils.errorHandler(response);
	  		})
  		}
  		else {
  			utils.alert("Incomplete information", "Both the firstname and lastname fields are compulsory fields", "error");
  		}
	}

	$scope.searched = {};
	$scope.searched.searchIcon = "icon-search4";

	$scope.searched.pageSize = $scope.searched.pageSizeInc = 10;
	$scope.searched.currentPage = 0;
	$scope.searched.fromCounter = 0;

	function search(url){
		$scope.searched.searchIcon = "fa fa-spinner fa-spin";
		if ($scope.searched.pageSize < 1){
			$scope.searched.pageSize = $scope.searched.pageSizeInc = 10;
		}
		var size = $scope.searched.pageSize;
		var from = $scope.searched.fromCounter;
		var request = utils.serverRequest(url+'&size='+size+'&from='+from, "GET");

		request.then(function(response){
			if (typeof response.hits !== 'undefined'){
				$scope.searched.totalPageCount = response.hits.total;
				$scope.searched.patients = response.hits.hits;
				$scope.searched.searchIcon = "icon-search4";
			}
		}, function(response){
			utils.errorHandler(response);
			$scope.searched.searchIcon = "icon-search4";
		})
	}

	$scope.pageChangeHandler = function(newPageNumber){
		$scope.searched.currentPage = newPageNumber;
		if (newPageNumber != 1)
		{
			$scope.searched.fromCounter = $scope.searched.pageSize * (newPageNumber - 1);
		}
		else
		{
			$scope.searched.fromCounter = 0;
		}
		$scope.search();
	}

	var loadPatients = function(){
		// var request = utils.serverRequest("/patients/patient/view", "GET");

		// request.then(function(response){
		// 	if (typeof response.hits !== "undefined"){				
		// 		$scope.searched.totalPageCount = response.hits.total;
		// 		$scope.searched.patients = response.hits.hits;	
		// 	}
		// }, function(response){
		// 	utils.errorHandler(response);
		// })
		search("/patients/patient/search?query=");
	}
	
	loadPatients();

	$scope.search = function(newSearch = false){
		var query = $scope.search.query;

		if (newSearch){
			$scope.searched.fromCounter = 0;
		}

		search("/patients/patient/search?query="+query);
	}

	$scope.catchEnterSearch = function(event){
		if (event.which == 13){
			$scope.search(true);
		}
	}

	$scope.fingerprintImage = ['', '', '', ''];
	$scope.fpStreamCounter = 0;
	$scope.fingerLoaded = [false, false, false, false];
	$scope.fingerprintCount = 4;

	function streamFingerprint(index, auto=true){
		var req = utils.serverRequest("/stream-fingerprint", "GET");
		req.then(function(response){
			if (response){
				$scope.fingerprintImage[index] = response;
				$scope.fingerLoaded[index] = true;
				if (auto && index < $scope.fingerprintCount){
					index++;
					console.log("Starting ", index);
					streamFingerprint(index);
				}
			}
			else {
				if ($scope.fpStreamCounter < 30){
					$timeout(function() {
						streamFingerprint(index, auto);
						$scope.fpStreamCounter++;
					}, 1000);
				}
				else {
					utils.notify("Scanner Timeout", "No Scan Detected. Please try again or contact an administrator", "info");
				}
			}
		})
	}

	$scope.streamFingerprint = function(count){
		$scope.fingerprintCount = count;
		$scope.fpStreamCounter = 0;
		console.log("Starting ", 0);
		streamFingerprint(0, true);	
	}

	$scope.rescanFinger = function(index){
		$scope.fingerLoaded[index] = false;
		$scope.fingerprintImage[index] = '';
		$scope.fpStreamCounter = 0;
		console.log("Starting", index);
		streamFingerprint(index, false)
	}


	$scope.biometricEnroll = function(){
		var req = utils.serverRequest("/biometrics/fingerprint-cache/clear-cache", "GET");
		req.then(function(response){
			$scope.fingerprintImage = ['', '', '', ''];
			$scope.fpStreamCounter = 0;
			$scope.fingerLoaded = [false, false, false, false];
			$("#biometric_new_patient_modal").modal("show");
			$scope.streamFingerprint(4);
		})
	}

	$scope.addFingerprintsToRegistration = function(){
		$scope.newPatient.fingerprints = {
			"left1":  "data:image/jpg;base64,"+$scope.fingerprintImage[0],
			"left2":  "data:image/jpg;base64,"+$scope.fingerprintImage[1],
			"right1": "data:image/jpg;base64,"+ $scope.fingerprintImage[2],
			"right2": "data:image/jpg;base64,"+ $scope.fingerprintImage[3]
		};
		$("#biometric_new_patient_modal").modal("hide");
	}

	$scope.totalQueueCount = 0;

	$scope.loadDoctors = function loadDoctors(){
		utils.serverRequest("/nursing/load-doctors/view-queue-count", "GET").then(function(response){
			$scope.totalQueueCount = 0;
			$scope.doctors = response;
			response.forEach(element => {
				$scope.addToQueueCount(element.queueCount);
			});
		}, function(error){
			utils.errorHandler(error);
		})

		$scope.loadDoctorQueue($scope.doctorInView);
	}

	$scope.loadDoctors();

	$scope.addToQueueCount = function(qty){
		$scope.totalQueueCount += parseInt(qty);
	}

	$scope.loadDoctorQueue = function(staff){
		const staffId = staff.StaffID;
		$scope.doctorInView = staff;
		utils.serverRequest("/consultancy/patient-queue/view?resourceId="+staffId, "GET").then(function(response){
			$scope.patientQueueInView = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}
})