angular.module("EmmetBlue")

.controller('labResultsController', function($scope, utils){
	var patient = {
		search: function(query, successCallback, errorCallback){
			query = {
				query: query,
				from: 0,
				size: 5
			};

			utils.serverRequest('/patients/patient/search', "POST", query).then(successCallback, errorCallback);	
        },
		typeAheadSource: function(query, process){
    		patient.search(query, function(response){
    			var data = [];
        		angular.forEach(response.hits.hits, function(value){
        			data.push(value["_source"]["first name"]+ " " + value["_source"]["last name"]+", "+value["_source"]["patientuuid"]);
        		})

        		data = $.map(data, function (string) { return { value: string }; });
        		process(data);
    		}, function(error){
    			utils.errorHandler(error);
    		})
    	}
	}

	$(".patient-search").typeahead({
        hint: true,
        highlight: true
    },
    {
    	source: function(query, process){
    		patient.typeAheadSource(query, process);
    	}
    })

	$scope.requestId = "";
	$scope.investigationLoaded = false;
	$scope.investigationResult = {};
	$scope.loadInvestigation = function(){
		query = {
			query: $("#patientuuid").val(),
			from: 0,
			size: 1
		};

		utils.serverRequest('/patients/patient/search', "POST", query)
		.then(function(response){
			if (typeof response.hits.hits[0]["_source"] !== "undefined"){
				$scope.patientInfo = response.hits.hits[0]["_source"];
				$scope.investigationLoaded = true;
			}
			else {
				$scope.investigationLoaded = false;
				utils.notify("Unrecognized Patient Number", "The hospital identification number you've specified seems to be invalid, please try again or contact an administrator if this error persists", "warning");
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.dateObject = function(date){
		return new Date(date);
	}

	$scope.submitResult = function(){
		var patient = $scope.patientLabNumber;
		var investigationName = $scope.investigation.InvestigationTypeName+"("+$scope.investigation.LabName+")";
		var report = $scope.investigationResult;
		var reportedBy = utils.userSession.getID();

		if (angular.equals(report, {})){
			utils.alert("An error occurred", "Please make sure you've filled in at least one field to continue", "warning");
		}
		else {
			var data = {
				patientLabNumber: patient,
				investigationName: investigationName,
				report: {
					"Investigation Request Information":{
						"Investigation Required": $scope.investigation.InvestigationTypeName,
						"Requested By": $scope.investigation.RequestedByFullName,
						"Date Requested": $scope.dateObject($scope.investigation.DateRequested).toDateString(),
						"Clinic/Ward": $scope.investigation.Clinic,
						"Request Note":	$scope.investigation.ClinicalDiagnosis
					},
					"Deduction": report
				},
				reportedBy, reportedBy
			};

			utils.serverRequest("/lab/lab-result/new", "POST", data).then(function(response){
				utils.notify("Operation Successfuly", "Result Published Successfuly", "success");
				$scope.investigationResult = {};
				$scope.currentRepository = response.repoId;
				$("#repository-items").modal("show");

				window.location.path = "lab/patients";
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}
});