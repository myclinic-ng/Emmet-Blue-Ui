angular.module("EmmetBlue")

.controller("admitPatientController", function($scope, utils){
	$scope.loadImage = utils.loadImage;

	$scope.initAdmissionForm = function(){
		$(".bigSpace").addClass("col-md-12").removeClass("col-md-8");
		$("#patientNumber").val("")
		$scope.showInfo = false;
		$scope.showDiagInfo = false;
		$scope.patientInfo = {};
		$scope.diagnosisInfo = {};
		$scope.newAdmission = {};
	}
	$scope.initAdmissionForm();

	var showBigSpace = function(){
		$(".bigSpace").addClass("col-md-8").removeClass("col-md-12");
		$scope.showInfo = true;
	}

	$scope.loadInfo = function(){
		query = {
			query: $("#patientNumber").val(),
			from: 0,
			size: 1
		};

		utils.serverRequest('/patients/patient/search', 'POST', query).then(function(response){
			if (angular.isDefined(response.hits.hits[0])){
				$scope.patientInfo = response.hits.hits[0]["_source"];
				$("#patientNumber").val($scope.patientInfo.patientuuid);
				showBigSpace();
				loadDiagnoses($scope.patientInfo.patientid);
			}
			else
			{
				utils.alert("Patient Number Error", "The patient number you have entered does not exist. Please check to make sure there's no typo and then try again", "error");
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}

	function autoSuggestInit(){
		$(".patientSearch").typeahead({
            hint: true,
            highlight: true
        },
        {
        	source: function(query, process){
        		query = {
					query: query,
					from: 0,
					size: 5
				};

        		utils.serverRequest('/patients/patient/search', 'POST', query).then(function(response){
	    			var data = [];
	        		angular.forEach(response.hits.hits, function(value){
	        			data.push(value["_source"]["first name"]+ " " + value["_source"]["last name"]);
	        		})

	        		data = $.map(data, function (string) { return { value: string }; });
	        		process(data);
	    		}, function(error){
	    			utils.errorHandler(error);
	    		})
        	}
        })
	}
	autoSuggestInit();

	function loadDiagnoses(patient){
		var req = utils.serverRequest('/patients/patient-diagnosis/view?resourceId='+patient, 'GET');

		req.then(function(response){
			$scope.diagnoses = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	function loadDiagnosis(diag){
		var req = utils.serverRequest('/patients/patient-diagnosis/view-by-id?resourceId='+diag, 'GET');

		req.then(function(response){
			$scope.diagnosisInfo = response;
			$scope.showDiagInfo = true;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	function loadWards(){
		var req = utils.serverRequest('/nursing/ward/view', 'GET');

		req.then(function(response){
			$scope.wards = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	function loadSections(ward){
		var req = utils.serverRequest('/nursing/ward-section/view?resourceId='+ward, 'GET');

		req.then(function(response){
			$scope.sections = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.$watch(function(){ return $scope.newAdmission.ward; }, function(nv){
		if (typeof nv != "undefined"){
			loadSections(nv);
		}
	});

	$scope.$watch(function(){ return $scope.newAdmission.diagnosis; }, function(nv){
		if (typeof nv != "undefined"){
			loadDiagnosis(nv);
		}
	});

	loadWards();

	$scope.save = function(){
		$scope.newAdmission.patient = $scope.patientInfo.patientid;
		$scope.newAdmission.consultant = utils.userSession.getID();

		if ($scope.causeOfAdmission !== 'diagnosis') {
			delete $scope.newAdmission.diagnosis
		}

		var req = utils.serverRequest('/consultancy/patient-admission/new', 'POST', $scope.newAdmission);

		req.then(function(response){
			utils.alert("Operation Successful", "Admission request for the selected patient has been processed successfully" , "success");
			$("#_patient-admission-form").modal("hide");
			$scope.initAdmissionForm();
		}, function(error){
			utils.errorHandler(error);
		});
	}
})