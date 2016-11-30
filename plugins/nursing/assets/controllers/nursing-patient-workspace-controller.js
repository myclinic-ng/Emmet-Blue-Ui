angular.module("EmmetBlue")

.directive('ngObservationForm', function(){
	return {
		restrict: 'AE',
		scope: {
			patient: '=patient'
		},
		templateUrl: "plugins/nursing/assets/includes/observation-template.html",
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
	$scope.currentObservationType = 0;
	$scope.observationResult = {};

	function loadObservationTypes(){
		var request = utils.serverRequest("/nursing/observation-type/view", "GET");

		request.then(function(response){
			$scope.observationTypes = response

		}, function(error){
			utils.errorHandler(error);
		});
	}
	loadObservationTypes();

	$scope.daysSpent = function(date){
		var today = (new Date()).toLocaleDateString();
		return utils.dateDiff(date, today);
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
			utils.serverRequest("/patients/patient/search", "POST", data).then(function(response){
				$scope.patient = response.hits.hits[0]["_source"];
				$scope.patientProfileLoaded = true;
				$scope.loadRepositories();
				loadConsultationNotes();
			}, function(error){
				utils.errorHandler(error);
			})
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
}

