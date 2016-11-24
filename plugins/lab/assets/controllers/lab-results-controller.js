angular.module("EmmetBlue")

.controller('labResultsController', function($scope, utils){
	$scope.investigationLoaded = false;
	$scope.investigationResult = {};
	$scope.loadInvestigation = function(){
		var labNumber = $scope.patientLabNumber;

		utils.serverRequest('/lab/patient/view?resourceId='+labNumber, 'GET')
		.then(function(response){
			$scope.investigation = response[0];
			$scope.investigationLoaded = true;
			loadFields($scope.investigation.InvestigationTypeID);
		}, function(error){
			utils.errorHandler(error);
		})
	}

	function loadFields(id){
		utils.serverRequest('/lab/investigation-type-field/view?resourceId='+id, 'GET')
		.then(function(response){
			$scope.investigationFields = response;
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
				    		utils.serverRequest("/lab/investigation-type-field/view-default-values?resourceId="+current.attr("data-id"), "GET").then(function(response){
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
		})
	}

	$scope.submitResult = function(){
		var patient = $scope.patientLabNumber;
		var investigationName = $scope.investigation.InvestigationRequired+"("+$scope.investigation.InvestigationTypeName+")";
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
						"Investigation Required": $scope.investigation.InvestigationRequired,
						"Requested By": $scope.investigation.RequestedBy,
						"Date Requested": $scope.investigation.DateRequested,
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
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}
});