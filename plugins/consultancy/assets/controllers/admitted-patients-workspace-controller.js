angular.module("EmmetBlue")

.controller("consultancyPatientWorkspaceController", function($rootScope, $scope, utils, $http){
	consultancyPatientWorkspaceController($rootScope, $scope, utils, $http);
});

function consultancyPatientWorkspaceController($rootScope, $scope, utils, $http){
	$scope.loadImage = utils.loadImage;

	$scope.daysSpent = function(date){
		var today = (new Date()).toLocaleDateString();
		return utils.dateDiff(date, today);
	}
	
	$scope.patientProfileLoaded = false;
	$scope.patient = {};
	$scope.currentObservationType = 0;
	$scope.observationResult = {};
	$scope.staffNames = {};

	var loadObservationTypes = function(){
		var request = utils.serverRequest("/nursing/observation-type/view", "GET");

		request.then(function(response){
			$scope.observationTypes = response

		}, function(error){
			utils.errorHandler(error);
		});
	}();

	function loadConsultantsInNotes(id){
		var request = utils.serverRequest("/consultancy/consultation-sheet/get-filterable-consultants?resourceId="+id, "GET");

		request.then(function(response){
			$scope.consultantInNotes = response

		}, function(error){
			utils.notify("Unable to load filters", "Please see previous error(s)", "warning");
			utils.errorHandler(error);
		});
	}

	function loadStaffName(staffId){
		if (typeof $scope.staffNames[staffId] == 'undefined'){
			$scope.staffNames[staffId] = staffId;
			utils.getStaffFullName(staffId).then(function(response){
				$scope.staffNames[staffId] = response.StaffFullName;
			}, function(error){
				$scope.staffNames[staffId] = staffId;
			})
		}
	}

	$scope.toLocaleDateString = function(date){x
		return new Date(date).toLocaleDateString();
	}

	$scope.toDateString = function(date){
		return new Date(date).toDateString();
	}

	$scope.repositories = [];
	$scope.loadRepositories = function(){
		var request = utils.serverRequest("/patients/patient-repository/view-by-patient?resourceId="+$scope.admissionInfo.AdmissionInfo.PatientID, "GET");

		request.then(function(response){
			$scope.repositories = response;
			for (i  = 0; i < response.length; i++){
				loadStaffName(response[i].RepositoryCreator);
			}			
		}, function(error){
			utils.errorHandler(error);
		});
	}

	function reloadFields(id){
		utils.serverRequest('/nursing/observation-type/view?resourceId='+id, 'GET').then(function(response){
			$scope.currentObservationTypeName = response[0].ObservationTypeName;
		}, function(error){

		});

		utils.serverRequest('/nursing/observation-type-field/view?resourceId='+id, 'GET')
		.then(function(response){
			$scope.observationTypeFields = response;
			setTimeout(function(){
				$(".autosuggest").each(function(){
					var current = $(this);
					current.typeahead({
				        hint: true,
				        highlight: true,
				        minLength: 1
				    },
				    {
				    	source: function(query, process){
				    		utils.serverRequest("/nursing/observation-type-field-default/view?resourceId="+current.attr("data-id"), "GET").then(function(response){
				    			var data = [];
				        		angular.forEach(response, function(value){
				        			data.push(value.Value);
				        		})

				        		data = $.map(data, function (string) { return { value: string }; });
				        		process(data);
				    		}, function(error){
				    			utils.errorHandler(error);
				    		})
				    	}
				    })
				})
			}, 2000);
		}, function(error){
			utils.errorHandler(error);
		});
	}


	$scope.$watch("currentObservationType", function(nv){
		if (typeof nv != "undefined"){
			reloadFields(nv);
		}
	})

	$scope.loadPatient = function(){
		var req = utils.serverRequest("/nursing/ward-admission/view-admitted-patients?resourceId="+$scope.patientNumber, "GET");
		req.then(function(response){
			var data = {
				query: response[0].AdmissionInfo.PatientUUID,
				size: 1,
				from: 0
			}

			$scope.admissionInfo = response[0];
			loadStaffName($scope.admissionInfo.AdmissionInfo.Consultant);
			loadStaffName($scope.admissionInfo.AdmissionProcessedBy);
			utils.serverRequest("/patients/patient/search", "POST", data).then(function(response){
				$scope.patient = response.hits.hits[0]["_source"];
				$scope.patientProfileLoaded = true;
				$scope.loadRepositories();
				loadConsultationNotes();
				loadConsultantsInNotes($scope.admissionInfo.WardAdmissionID);
			}, function(error){
				utils.errorHandler(error);
			})
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.loadRepo = function(repo){
		$scope.currentRepository = repo;
		$("#repository-items").modal("show");
	}

	$scope.submitObservation = function(){
		var patient = $scope.patient.patientid;
		// var observationName = $scope.observation.InvestigationRequired+"("+$scope.observation.InvestigationTypeName+")";
		var observation = $scope.observationResult;
		var staffID = utils.userSession.getID();

		if (angular.equals(observation, {})){
			utils.alert("An error occurred", "Please make sure you've filled in at least one field to continue", "warning");
		}
		else {
			var data = {
				patientId: patient,
				observationType: $scope.currentObservationType,
				observationTypeName: $scope.currentObservationTypeName,
				observation: {
					"Primary Information":{
						"Observation Type": $scope.currentObservationType,
						"Carried Out By": staffID,
						"Date Of Observation": 'date'
					},
					"Deduction": observation
				},
				staffId: staffID
			};

			console.log(data);

			utils.serverRequest("/nursing/observation/new", "POST", data).then(function(response){
				utils.notify("Operation Completed Successfully", "Observation Published Successfuly", "success");
				$scope.observationResult = {};
				$scope.currentRepository = response.repoId;
				$rootScope.$broadcast("observationComplete");
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}


	$(".drug-search").typeahead({
        hint: true,
        highlight: true
    },
    {
    	source: function(query, process){
    		utils.serverRequest("/consultancy/drug-names/search?phrase="+query, "GET").then(function(response){
    			var data = [];
        		angular.forEach(response.hits.hits, function(value){
        			data.push(value["_source"].displayTermsList.term);
        		})

        		data = $.map(data, function (string) { return { value: string }; });
        		process(data);
    		}, function(error){
    			// utils.errorHandler(error);
    		})
    	}
    })

    $scope.searchDrug = function(){
		var drug = $("#conclusion-drug").val()

		$scope.searchDrugGroups = {
			name: drug
		}

		var successCallback = function(response){
			$scope.searchDrugGroups = response.data.drugGroup;
		}

		var errorCallback = function(error){
			
		}

		$http.get("https://rxnav.nlm.nih.gov/REST/drugs?name="+drug).then(successCallback, errorCallback);
	}
	$scope.currentNote = "";
	$scope.addDrugsToPrescriptionToList = function(){
		$("#modal-drugs").modal("hide");
		// utils.notify("Operation in progress", "Drugs are being added to the prescription list, please note that this might take a few seconds to complete", "info");
		angular.forEach($scope.searchDrugGroups.conceptGroup, function(value){
			if (typeof value.conceptProperties != "undefined"){
				for(var i = 0; i < value.conceptProperties.length; i++){
					if (typeof value.conceptProperties[i].selected != "undefined" && value.conceptProperties[i].selected == true){
						$scope.addPrescriptionToList(value.conceptProperties[i].name);
					}
				}
			}
		})
	}

	$scope.addPrescriptionToList = function(prescription){
		$scope.currentNote += "\r\n"+prescription+" (prescription)\r\n";
	}

	$scope.submitDiagnosisNote = function(){
		var note = {};
		note.consultant = utils.userSession.getID();
		note.admissionId = $scope.admissionInfo.WardAdmissionID;
		note.note = $scope.currentNote;

		var req = utils.serverRequest("/consultancy/consultation-sheet/new", "POST", note);
		req.then(function(response){
			$("#diagnosis-prescription-note").modal("hide");
			utils.alert("Operation Successful", "Your note has been added to this patients admission workspace successfully", "success");
			$scope.currentNote = "";
			loadConsultationNotes();
		}, function(error){
			utils.errorHandler(error);
		})
	}

	var loadConsultationNotes = function(){
		var req = utils.serverRequest("/consultancy/consultation-sheet/view?resourceId="+$scope.admissionInfo.WardAdmissionID, "GET");
		req.then(function(response){
			$scope.consultationNotes = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.discharge = function(){
		var title = "Discharge Prompt";
		var text = "Do you really want to discharge this patient?";
		var close = true;
		var callback = function(){
			$("#sudoModeModal").modal({
				keyboard: false,
				backdrop: "static"
			});
			$scope.currentSudoOperation = "discharge";
		}
		var type = "info";
		var btnText = "Discharge";

		utils.confirm(title, text, close, callback, type, btnText);
	}

	$scope.$on("sudo-mode-bypassed", function(){
		$("#sudoModeModal").modal("hide");

		switch($scope.currentSudoOperation){
			case "discharge":
			{
				var data = {
					admissionId: $scope.admissionInfo.PatientAdmissionID,
					dischargedBy: utils.userSession.getID(),
					staff: utils.userSession.getUUID()
				};

				var req = utils.serverRequest("/consultancy/patient-admission/discharge", "POST", data);

				req.then(function(response){
					utils.alert("Discharge Process Commenced", "The nursing stations has been notified about this patient's discharge successfully", "success");
				}, function(error){
					utils.errorHandler(error);
				})
				break;
			}
		}
	})	

	if (typeof utils.storage.currentWorkspacePatientToLoad != "undefined" && utils.storage.currentWorkspacePatientToLoad != null){
		$scope.patientNumber = utils.storage.currentWorkspacePatientToLoad;
		$scope.loadPatient();
	}
}