angular.module("EmmetBlue")

.controller('labRequestsPatientsViewController', function($scope, utils, $rootScope){
	var today = new Date();
	$scope.dateRanges = today.toLocaleDateString()+ " - "+today.toLocaleDateString();
	$scope.patientLabRequests = [];
	$scope.selectedPatient = {};
	$scope.patient = {};
	$scope.pendingPayments = [];

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

	var actions = function (data, type, full, meta){
		var processButtonAction = "manage('process', "+data.RequestID+")";
		var ackButtonAction = "manage('ack', "+data.RequestID+")";
		var forwButtonAction = "manage('forward', "+data.RequestID+")";
		var hmoButtonAction = "manage('hmoReq', "+data.RequestID+")";

		var dataOpt = "data-option-id='"+data.RequestID+"'"+
					  "data-option-patient-uuid='"+data.PatientUUID+"'"+
					  "data-option-lab-id='"+data.LabID+"'"+
					  "data-option-lab-name='"+data.LabName+"'"+
					  "data-option-investigation-required='"+data.InvestigationRequired+"'"+
					  "data-option-investigation-type-name='"+data.InvestigationTypeName+"'"+
					  "data-option-clinical-diagnosis='"+data.ClinicalDiagnosis+"'"+
					  "data-option-requested-by-id='"+data.RequestedBy+"'"+
					  "data-option-requested-by='"+data.RequestedByFullName+"'"+
					  "data-option-patient-id='"+data.PatientID+"'"+
					  "data-option-request-date='"+data.RequestDate+"'";


		var processButton = "<button class='btn btn-default process-btn btn-danger col-md-12' ng-click=\""+processButtonAction+"\" "+dataOpt+"> Register Request</button>";
		var ackButton = "<button class='btn btn-default ack-btn btn-info col-md-12' ng-click=\""+ackButtonAction+"\" "+dataOpt+"> Payment Request</button>";

		if (data.RequestAcknowledged == 0){
			deleteButton = processButton;
		}
		else {
			deleteButton = ackButton;
		}

		if (data.RequestAcknowledged != 0){
			var hmoButton = "<button class='btn btn-default ack-btn col-md-12' ng-click=\""+forwButtonAction+"\" "+dataOpt+"> Forward to Lab</button>";
		}
		else {
			var hmoButton = "<button class='btn btn-default process-btn col-md-offset-3 col-md-12' ng-click=\""+hmoButtonAction+"\" "+dataOpt+"> Send to HMO office</button>";
		}
		
		var buttons = "<div class='btn-group'>"+deleteButton+hmoButton+"</button>";
		return buttons;
	}

	var patientActions = function (data, type, full, meta){
		var loadReqsButtonAction = "manage('loadReqs', '"+data.PatientUUID+"')"

		var dataOpt = "data-option-patient-id='"+data.PatientUUID+"'"+
					  "data-option-patient-name='"+data.PatientFullName+"'"+
					  "data-option-patient-type='"+data.PatientTypeName+"'";


		var processButton = "<button class='btn process-btn' ng-click=\""+loadReqsButtonAction+"\" "+dataOpt+"> View </button>";
	
		
		var buttons = "<div class='btn-group'>"+processButton+"</div>";
		return buttons;
	}
	
	$scope.currentLab = 0;
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		if (typeof $scope.currentPatient !== "undefined"){
			var investigationTypes = utils.serverRequest('/lab/lab-request/view-by-patient?resourceId&patient='+$scope.currentPatient, 'GET');
		}
		else {
			date = ($scope.dateRanges).split(" - ");
			start = date[0];
			end = date[1];
			var investigationTypes = utils.serverRequest('/lab/lab-request/view-by-patient?resourceId='+$scope.currentLab+"&startdate="+start+"&enddate="+end, 'GET');
		}

		return investigationTypes;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
	.withFixedHeader()
	.withOption('createdRow', function(row, data, dataIndex){
		utils.compile(angular.element(row).contents())($scope);
	})
	.withOption('headerCallback', function(header) {
        if (!$scope.headerCompiled) {
            $scope.headerCompiled = true;
            utils.compile(angular.element(header).contents())($scope);
        }
    })

    $scope.currentRequestsUris = {};

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient").renderWith(function(data, a, b){
			var string = "<span class='text-bold'>"+data.PatientFullName+"</span><br/>"+data.PatientTypeName+" ("+data.CategoryName+")";
			return string;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("").renderWith(patientActions).notSortable()
	];

	$scope.loadRequestUri = function(id){
		$scope.currentRequestUri = $scope.currentRequestsUris[id];

		$("#request-uri").modal("show");
	}

	$scope.$on("ReloadQueue", function(){
		$scope.dtInstance.reloadData();
	})
	$scope.reloadInvestigationTypesTable = function(type = ""){
		if (type == 1){
			query = {
				query: $("#patientUuid").val(),
				from: 0,
				size: 1
			};

			utils.serverRequest('/patients/patient/search', "POST", query).then(function(response){
				if (typeof response.hits.hits[0] !== "undefined"){
					$scope.currentPatient = response.hits.hits[0]._source.patientuuid;
					$scope.dtInstance.reloadData();
				}
				else {
					utils.notify("Unable to load patient", "Please provide a valid patient profile search query", "error");
				}
			}, function(error){
				utils.errorHandler(error);
			});
		}
		else {
			if (typeof $scope.currentPatient !== "undefined"){
				delete $scope.currentPatient;
			}

			$scope.dtInstance.reloadData();
		}
	}

	$scope.manage = function(type, id){
		switch(type){
			case "process":{
				var data = {
					investigationId: id,
					patientUuid: $(".process-btn[data-option-id='"+id+"']").attr("data-option-patient-uuid"),
					labId: $(".process-btn[data-option-id='"+id+"']").attr("data-option-lab-id"),
					clinicalDiagnosis: $(".process-btn[data-option-id='"+id+"']").attr("data-option-clinical-diagnosis"),
					investigationRequired: $(".process-btn[data-option-id='"+id+"']").attr("data-option-investigation-required"),
					requestedBy: $(".process-btn[data-option-id='"+id+"']").attr("data-option-requested-by-id"),
					dateRequested: $(".process-btn[data-option-id='"+id+"']").attr("data-option-request-date")
				}

				utils.storage.processedNewPatient = data;

				$("#_new_patient").modal("show");	
				break;
			}
			case "ack":{
				utils.storage.currentPaymentRequest = id;

				$("#_payment_request").modal("show");	
				break;
			}
			case "forward":{
				utils.serverRequest("/lab/lab-request/close-request", "POST", {"request": id, "staff": utils.userSession.getID()})
				.then(function(response){
					utils.notify("Operation Successful", "Request forwarded to the lab successfully", "success");
					$rootScope.$broadcast("ReloadQueue");
					$rootScope.$broadcast("reloadLabPatients", {});
				}, function(error){
					utils.errorHandler(error);
				});
				break;
			}
			case "hmoReq":{
				datum = [
					{investigationId: id},
					{patientUuid: $(".process-btn[data-option-id='"+id+"']").attr("data-option-patient-uuid")},
					{labId: $(".process-btn[data-option-id='"+id+"']").attr("data-option-lab-id")},
					{clinicalDiagnosis: $(".process-btn[data-option-id='"+id+"']").attr("data-option-clinical-diagnosis")},
					{investigationRequired: $(".process-btn[data-option-id='"+id+"']").attr("data-option-investigation-required")},
					{requestedBy: $(".process-btn[data-option-id='"+id+"']").attr("data-option-requested-by")},
					{dateRequested: $(".process-btn[data-option-id='"+id+"']").attr("data-option-request-date")}
				]

				// items = [];

				// datumText = "Investigation ID: "+datum.investigationId+" <br/> Clinical Diagnosis: "+datum.clinicalDiagnosis+" <br/> Investigation Required: "+datum.investigationRequired+" <br/> Requested By: "+datum.requestedBy+" Date Requested: "+datum.dateRequested;

				items = [
					{
						item: "Investigation ID",
						duration: id
					},
					{
						item: "Laboratory",
						duration: $(".process-btn[data-option-id='"+id+"']").attr("data-option-lab-name")
					},
					{
						item: "Clinical Diagnosis",
						duration: $(".process-btn[data-option-id='"+id+"']").attr("data-option-clinical-diagnosis")
					},
					{
						item: "Investigation Required",
						duration: $(".process-btn[data-option-id='"+id+"']").attr("data-option-investigation-type-name")
					},
					{
						item: "Requested By",
						duration: $(".process-btn[data-option-id='"+id+"']").attr("data-option-requested-by")
					},
					{
						item: "Date Requested",
						duration: $(".process-btn[data-option-id='"+id+"']").attr("data-option-request-date")
					}
				]

				data = {
					items: items,
					patient: $(".process-btn[data-option-id='"+id+"']").attr("data-option-patient-id"),
					requestBy: utils.userSession.getID()
				};


				var req = utils.serverRequest("/accounts-biller/hmo-sales-verification/new", "POST", data);

				req.then(function(response){
					$("#ack_modal").modal("hide");
					utils.alert("Request Sent Successfully", "This patient's HMO has been notified successfully. Please refer him/her to their respective departments", "success");
				}, function(error){
					utils.errorHandler(error);
				})
				break;
			}
			case "loadReqs":{
				$scope.selectedPatient = {
					id: id,
					name: $(".process-btn[data-option-patient-id='"+id+"']").attr("data-option-patient-name"),
					type: $(".process-btn[data-option-patient-id='"+id+"']").attr("data-option-patient-type"),
				};

				$scope.initPatientView(id);
				break;
			}
		}
	}

	$scope.generatePaymentRequest = function(){
		utils.storage.currentPaymentRequest = $scope.pendingPayments.join(",");
		$("#_payment_request").modal("show");
	}

	$scope.initPatientView = function(id){
		utils.serverRequest('/lab/lab-request/view-by-patient?resourceId&patient='+id, "GET")
		.then(function(response){
			$scope.pendingPayments = [];
			$scope.patientLabRequests = response;
			angular.forEach(response, function(value){
				if (value.RequestAcknowledged != 0){
					$scope.pendingPayments.push(value.RequestID);
				}
			})

			$scope.loadPatientProfile();
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.$watch("dateRanges", function(nv){
		$scope.dtInstance.reloadData();
	});

	$scope.$on("reloadLabPatients", function(v){
		$scope.initPatientView($scope.selectedPatient.id);
	});

	$scope.loadPatientProfile = function(){
		var patient = utils.serverRequest("/patients/patient/search", "POST", {
			"query":$scope.selectedPatient.id,
			"from":0,
			"size":1
		});

		patient.then(function(response){
			if (typeof response.hits.hits[0] !== "undefined"){
				var profile = response.hits.hits[0]["_source"];
				$scope.patient.firstName = profile["first name"];
				$scope.patient.lastName = profile["last name"];
				$scope.patient.gender = profile["gender"];
				$scope.patient.phoneNumber = profile["phone number"];
				$scope.patient.dateOfBirth = profile["date of birth"];
				$scope.patient.address = profile["home address"];
				$scope.patient.patientID = profile["patientid"];
				$scope.patient.picture = profile["patientpicture"];	
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.savePatient = function(){
		$scope.investigations = [];
		$scope.requests = [];

		angular.forEach($scope.patientLabRequests, function(value){
			if (typeof value.register != "undefined" && value.register){
				$scope.investigations.push({
					investigation: value.InvestigationTypeID,
					note: value.InvestigationRequired+" <br/>"+value.RequestNote,
					requestedBy: value.RequestedBy,
					dateRequested: value.RequestDate,
					request: value.RequestID
				});

				$scope.requests.push(value.RequestID);
			}
		});

		if ($scope.investigations.length < 1){
			utils.notify("Invalid request", "Please select at least one investigation request to proceed", "warning");
		}
		else {
			var patient = $scope.patient
			patient.investigations = $scope.investigations;
			var result = utils.serverRequest("/lab/patient/new", "POST", patient);
			result.then(function(response){
				if (response){
					utils.alert("Operation successful", "New patient registered successfully", "success");

					utils.serverRequest("/lab/lab-request/close-multiple-requests", "POST", {"request": $scope.requests, "staff": utils.userSession.getID()})
					.then(function(response){
						$scope.initPatientView($scope.selectedPatient.id);
					}, function(error){
						utils.errorHandler(error);
					});
				}
			}, function(error){
				utils.errorHandler(error);
			});
		}
	}
});