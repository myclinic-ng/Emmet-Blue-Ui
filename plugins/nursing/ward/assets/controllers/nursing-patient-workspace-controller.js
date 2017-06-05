angular.module("EmmetBlue")

.directive('ngObservationForm', function(){
	return {
		restrict: 'AE',
		scope: {
			patient: '=patient'
		},
		templateUrl: "plugins/nursing/ward/assets/includes/observation-template.html",
		controller: function($rootScope, $scope, utils){
			nursingPatientWorkspaceController($rootScope, $scope, utils);
		}
	}
})

.controller("nursingPatientWorkspaceController", function($rootScope, $scope, utils){
	nursingPatientWorkspaceController($rootScope, $scope, utils);
});

function nursingPatientWorkspaceController($rootScope, $scope, utils){
	$scope.loadImage = utils.loadImage;
	
	$scope.patientProfileLoaded = false;
	$scope.patient = {};
	$scope.currentObservationType;
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

	$scope.daysSpent = function(date){
		var today = (new Date()).toLocaleDateString();
		return utils.dateDiff(date, today);
	}

	$scope.toLocaleDateString = function(date){x
		return new Date(date).toLocaleDateString();
	}

	$scope.toDateString = function(date){
		return new Date(date).toDateString();
	}

	$scope.toTimeString = function(date){
		return new Date(date).toLocaleTimeString();
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
		$scope.patientProfileLoaded = false;
		var req = utils.serverRequest("/nursing/ward-admission/view-admitted-patients?resourceId="+$scope.patientNumber, "GET");
		req.then(function(response){
			if (typeof response[0] !== "undefined" && typeof response[0].AdmissionInfo !== "undefined"){
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
					loadMostRecentObservation();
					loadMostRecentNote();
					loadMostRecentTreatment();
					$scope.loadRepositories();
					loadConsultationNotes();
					loadConsultantsInNotes($scope.admissionInfo.WardAdmissionID);
				}, function(error){
					utils.errorHandler(error);
				})
			}
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

	$scope.loadRepositories = function(){
		var request = utils.serverRequest("/patients/patient-repository/view-by-patient?resourceId="+$scope.patient.patientid, "GET");

		request.then(function(response){
			$scope.patient.repositories = response;				
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.loadRepo = function(repo){
		$scope.currentRepository = repo;
		$("#repository-items").modal("show");
	}

	$scope.getFieldName = function(id){
		var name = $(".observationData[data-id='"+id+"']").attr("data-value-name");

		return name;
	}

	

	$scope.submitLikeThat = function(){
		$("#dirtyValuesPresentModal").modal("hide");
		$scope.process();
	}

	$scope.submitObservation = function(){
		var patient = $scope.patient.patientid;
		// var observationName = $scope.observation.InvestigationRequired+"("+$scope.observation.InvestigationTypeName+")";
		var observation = {};
		var staffID = utils.userSession.getID();

		var data = [];
		$(".observationData").each(function(){
			observation[$(this).attr("data-value-name")] = $(this).val();
			if ($(this).val() != ""){
				data.push({
					"field":$(this).attr("data-id"),
					"value":$(this).val()
				})
			}
		})

		if (angular.equals($scope.observationResult, {})){
			utils.alert("An error occurred", "Please make sure you've filled in at least one field to continue", "warning");
		}
		else {
			var req = utils.serverRequest("/nursing/observation-type-field-dirty-value/contains-dirt", "POST", data);
			req.then(function(response){
				if (!angular.equals(response, {}) && response.conclusion){
					$scope.dirtyValues = response;
					delete $scope.dirtyValues.conclusion;
					$("#dirtyValuesPresentModal").modal("show");
				}
				else {
					$scope.process();
				}
			}, function(error){
			});
		}

		$scope.process = function(){
			function success(){
				$scope.data = {
					patientId: patient,
					observationType: $scope.currentObservationType,
					observationTypeName: $scope.currentObservationTypeName,
					observation: {
						"Meta Information":{
							"Observation Type": $scope.currentObservationTypeName,
							"Carried Out By": $scope.staffFullName,
							"Date Of Observation": (new Date()).toDateString()+", "+(new Date()).toLocaleTimeString()
						},
						"Deduction/Conclusions": observation
					},
					staffId: staffID
				};

				utils.serverRequest("/nursing/observation/new", "POST", $scope.data).then(function(response){
					utils.notify("Operation Completed Successfully", "Observation Published Successfuly", "success");
					$scope.observationResult = {};
					$scope.currentRepository = response.repoId;
					$rootScope.$broadcast("observationComplete");
					utils.serverRequest("/nursing/nursing-station-departments/log-patient-processing", "POST", {
						patient: $scope.data.patientId,
						nurse: $scope.data.staffId,
						observation: $scope.currentObservationTypeName,
						department: utils.storage.currentStaffDepartmentID
					}, function(response){
						console.log(response);
					});

				}, function(error){
					utils.errorHandler(error);
				})
			}

			if (typeof $scope.staffFullName != "undefined"){
				success();
			}
			else {
				utils.getStaffFullName(staffID).then(function(response){
					$scope.staffFullName = response.StaffFullName;
					success();
				}, function(error){
					$scope.staffFullName = "ID: ".staffID;
				})
			}
		}
	}

	if (typeof utils.storage.currentWorkspacePatientToLoad != "undefined" && utils.storage.currentWorkspacePatientToLoad != null){
		$scope.patientNumber = utils.storage.currentWorkspacePatientToLoad;
		$scope.loadPatient();
	}

	$scope.mostRecent = {};
	var loadMostRecentObservation = function(){
		var req = utils.serverRequest("/patients/patient-repository/view-most-recent-json-by-patient?resourceId="+$scope.admissionInfo.AdmissionInfo.PatientID, 'GET');
		req.then(function(response){
			$scope.mostRecent.observation = response;
		}, function(error){
			// utils.errorHandler(error);
			// utils.notify("Unable to load most recent observation", "", "warning");
		});
	}

	var loadMostRecentNote = function(){
		var req = utils.serverRequest("/consultancy/consultation-sheet/view-most-recent-note?resourceId="+$scope.admissionInfo.WardAdmissionID, 'GET');
		req.then(function(response){
			$scope.mostRecent.note = response;
		}, function(error){
			// utils.errorHandler(error);
			// utils.notify("Unable to load most recent note", "", "warning");
		});
	}

	var loadMostRecentTreatment = function(){
		var req = utils.serverRequest("/nursing/treatment-chart/view-most-recent?resourceId="+$scope.admissionInfo.PatientAdmissionID, 'GET');
		req.then(function(response){
			$scope.mostRecent.treatment = response;
		}, function(error){
			utils.errorHandler(error);
			utils.notify("Unable to load most recent note", "", "warning");
		});
	}

	$scope.completeWardTransfer = function(){
		$scope.newTransfer.admissionId = $scope.admissionInfo.AdmissionInfo.PatientAdmissionID;
		$scope.newTransfer.wardFrom = $scope.admissionInfo.AdmissionInfo.ward;
		$scope.newTransfer.transferBy = utils.userSession.getID();

		var req = utils.serverRequest("/nursing/ward-transfer/new", "POST", $scope.newTransfer);
		req.then(function(response){
			$("#transfer-ward").modal("hide");
			$scope.newTransfer = {};
			utils.notify("Transfer success", "This patient has been transferred to the selected ward", "success");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.newTransfer = {
		wardTo: null,
		sectionTo: null,
		bedTo: null
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

	function loadBeds(section){
		var req = utils.serverRequest('/nursing/section-bed/view?resourceId='+section, 'GET');

		req.then(function(response){
			$scope.beds = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.$watch(function(){ return $scope.newTransfer.wardTo; }, function(nv){
		if (typeof nv != "undefined"){
			loadSections(nv);
		}
	});

	$scope.$watch(function(){ return $scope.newTransfer.sectionTo; }, function(nv){
		if (typeof nv != "undefined"){
			loadBeds(nv);
		}
	});

	loadWards();
	loadSections();	

	$scope.$on("labRequestSent", function(){
		$("#lab-request-form").modal("hide");
	})


	$scope.$on("newPharmacyRequestSent", function(){
		$("#pharmacy-request-form").modal("hide");
	});

	$scope.htmlDecode = function(value){
		var html = $("<div/>").html(value).text();

		return html;
	}
}

