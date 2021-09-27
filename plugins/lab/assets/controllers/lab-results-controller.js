angular.module("EmmetBlue")

.controller('labResultsController', function($scope, utils){
	$scope.utils = utils;
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

	$scope.currentPatient = {
		nameTitle: "Patient",
		id: 0
	};

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
				loadPendingInvestigations();
				loadLabs();

				$scope.investigationResults = {};
				$scope.selected = {};

				$scope.currentPatient.nameTitle = $scope.patientInfo.patientfullname+"'s";
				$scope.currentPatient.picture = $scope.loadImage($scope.patientInfo.patientpicture);
				$scope.currentPatient.id = $scope.patientInfo.patientid;
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

	function loadPendingInvestigations(){
		var req = utils.serverRequest("/lab/patient/view?resourceId=0&patient="+$scope.patientInfo.patientid, "GET");

		req.then(function(response){
			$scope.investigationsToAffect = response;
			$("#affects").modal("show");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	function loadLabs(){
		utils.serverRequest('/lab/lab/view', 'GET').then(function(response){
			$scope.labs = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	var loadLabInvestigations = function(id){
		utils.serverRequest('/lab/investigation-type/view-by-lab?resourceId='+id, 'GET').then(function(response){
			$scope.labInvestigations = response;
		}, function(error){
			utils.errorHandler(error);
		})		
	}

	$scope.$watch("selectedlab", function(newV){
		if (typeof newV !== "undefined"){
			loadLabInvestigations(newV);
		}
	});

	$scope.loadFields = function(id){
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

	$scope.$watch("investigationType", function(nv){
		if (typeof nv !== "undefined"){
			$scope.loadFields(nv);
			utils.serverRequest("/lab/investigation-type/view?resourceId="+nv, "GET")
			.then(function(response){
				if (typeof response[0] !== "undefined"){
					$scope.currentInvestigationName = response[0].InvestigationTypeName;
					$scope.currentInvestigation = response[0];	
				}
			})

		}
	});

	$scope.addToList = function(){
		var result = $scope.investigationResult;
		var fields = {};
		angular.forEach($scope.investigationFields, function(value, key){
			var fieldDescr = (value.FieldDescription).split("|");
			fields[value.FieldName] = {
				"refrange": fieldDescr[0],
				"units": fieldDescr[1],
				"fieldtype":value.TypeName
			};
		});

		result.meta = {
			"fields": fields,
			"report":{
				"investigationId":$scope.currentInvestigation.InvestigationTypeID,
				"lab":$scope.currentInvestigation.LabName
			}
		};

		if (typeof $scope.investigationResults[$scope.currentInvestigation.LabName] == "undefined"){
			$scope.investigationResults[$scope.currentInvestigation.LabName] = {};
		}

		$scope.investigationResults[$scope.currentInvestigation.LabName][$scope.currentInvestigationName] = result;

		$scope.investigationResult = {};
	}

	$scope.getLength = function(ob){
		if (typeof ob !== "undefined"){
			return Object.keys(ob).length;	
		}
		
		return 0;
	}

	$scope.submit = function(){
		var reqs = [];
		angular.forEach($scope.investigationResults, function(v, k){
			reqs.push((Object.keys(v)).join(", "));
		});

		$scope.investigations = reqs.join(" + ");

		var patient = $scope.patientInfo.patientid;
		var investigationName = $scope.investigations;
		var report = $scope.investigationResults;
		var reportedBy = utils.userSession.getID();

		if ($scope.investigationsToAffect.length > 0 && Object.keys($scope.selected).length < 1){
			utils.alert("No investigation selected", "You need to select a pending investigation to continue", "warning");
		}
		else {
			if (angular.equals(report, {})){
				utils.alert("An error occurred", "Please make sure you've filled in at least one field to continue", "warning");
			}
			else {
				var data = {
					patientLabNumber: patient,
					investigationName: investigationName,
					report: report,
					reportedBy: reportedBy,
					requests: [],
					meta: {
						"category": "json",
						"fileExt": "json"
					}
				};

				angular.forEach($scope.selected, function(v, k){
					if (v.value){
						data.requests.push(k);
					}
				});

				utils.serverRequest("/lab/lab-result/new", "POST", data).then(function(response){
					utils.notify("Operation Successfuly", "Result Published Successfuly", "success");
					$scope.investigationResults = {};
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
});