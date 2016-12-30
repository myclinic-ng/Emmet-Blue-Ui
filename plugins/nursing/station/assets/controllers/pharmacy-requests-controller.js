angular.module("EmmetBlue")

.controller("nursingPharmacyRequesstsController", function($rootScope, $scope, utils){
	$scope.loadImage = utils.loadImage;
	$scope.forwardEnabled = false; 
	function dtAction(data, full, meta, type){
		viewCardButtonAction = "manage('view',"+data.PatientID+")";
		closeButtonAction = "manage('close',"+data.PatientID+")";
		observationButtonAction = "manage('observation',"+data.PatientID+")";

		var dataOpts = "data-option-id = '"+data.PatientID+"' "+
					   "data-patient-uuid = '"+data.PatientUUID+"'";

		viewCard = "<button class='btn btn-default' ng-click=\""+viewCardButtonAction+"\">View Profile</button>";
		closeProfile = "<button class='btn btn-default' ng-click=\""+closeButtonAction+"\">Close</button>";
		observation = "<button class='btn btn-default btn-queue' ng-click=\""+observationButtonAction+"\""+dataOpts+">Load Treatment Chart</button>";
		return "<div class='btn-group'>"+viewCard+observation+closeProfile+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/nursing/pharmacy-request/view', 'GET');
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

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn(null).withTitle("S/N").renderWith(function(data, type, full, meta){
			return meta.row + 1;
		}),
		utils.DT.columnBuilder.newColumn('patientInfo.patientuuid').withTitle("Patient Number"),
		utils.DT.columnBuilder.newColumn('patientInfo.patientfullname').withTitle("Patient Name"),
		utils.DT.columnBuilder.newColumn('Request').withTitle("Pharmacy Request/Prescription"),
		utils.DT.columnBuilder.newColumn('RequestDate').withTitle("Date Created"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	function reloadTable(){
		$rootScope.$broadcast("recountQueue");
		$scope.dtInstance.reloadData();
	}

	setInterval(function(){
		reloadTable();
	}, 5000);

	$scope.manage = function(value, id){
		switch(value)
		{
			case "view":{
				utils.serverRequest("/patients/patient/view?resourceId="+id, 'GET').then(function(response){
					$scope.patientInfo = response["_source"];
					$('#patient-card').modal('show');
				}, function(error){
					utils.errorHandler(error);
				})
				break;
			}
			case "close":{
				var data = {
					patient: id
				};

				var title = "Do you want to continue?";
				var text = "You are about to close this profile, please note that you will not be able to load this profile any longer until it has been reopened";
				var close = true;
				var callback = function(){
					utils.serverRequest("/patients/patient/lock-profile", 'PUT', data).then(function(response){
						utils.notify("Operation Succesful", "The selected profile has been closed successfully", "success");
						reloadTable();
					}, function(error){
						utils.errorHandler(error);
					})
				}
				var type = "info";
				var btnText = "Continue";

				utils.confirm(title, text, close, callback, type, btnText);

				break;
			}
			case "observation":{
				utils.storage.patientPharmacyRequestID = id;
				// utils.serverRequest("/patients/patient/view?resourceId="+id, 'GET').then(function(response){
				// 	$scope.patientInfo = response["_source"];
				// 	$scope.forwardEnabled = false;
				// 	$("#observation").modal("show");
				// }, function(error){
				// 	utils.errorHandler(error);
				// });
				// loadDoctors();
				$("#observation").modal("show");
			}
		}
	}

	function loadDoctors(){
		utils.serverRequest("/nursing/load-doctors/view-queue-count", "GET").then(function(response){
			$scope.doctors = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}
	loadDoctors();

	$scope.selectedDoctor = "";
	$scope.queuePatient = function(){
		var data = {
			consultant: $scope.selectedDoctor,
			patient: $scope.patientInfo.patientid
		};

		utils.serverRequest("/consultancy/patient-queue/new", "POST", data).then(function(response){
			utils.serverRequest("/patients/patient/lock-profile", 'PUT', data).then(function(response){
				utils.notify("Operation Succesful", "The selected patient has been processed successfully", "success");
				reloadTable();
			}, function(error){
				utils.errorHandler(error);
			});
			$("#observation").modal("hide");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.$on("observationComplete", function(){
		$scope.forwardEnabled = true; 
	})
})

.controller("nursingTreatmentChartController", function($scope, utils){
	$scope.treatmentChart = {};
	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/nursing/pharmacy-request-treatment-chart/view?resourceId='+$scope.admissionId, 'GET');
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
    .withButtons([
		{
			text: '<i class="icon-file-plus"></i> New Item',
			action: function(){
				$('#new_item').modal('show')
			}
		}
	]);

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('TreatmentChartID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('Drug').withTitle("Drug"),
		utils.DT.columnBuilder.newColumn('Dose').withTitle("Dose"),
		utils.DT.columnBuilder.newColumn('Route').withTitle("Route"),
		utils.DT.columnBuilder.newColumn('Time').withTitle("Time"),
		utils.DT.columnBuilder.newColumn('Note').withTitle("Comment"),
		utils.DT.columnBuilder.newColumn('Nurse').withTitle("Administered By"),
	];

	function reloadTable(){
		$scope.admissionId = utils.storage.patientPharmacyRequestID;
		if (typeof $scope.dtInstance.reloadData == 'function'){
			$scope.dtInstance.reloadData();
		}
	}

	$scope.$watch(function(){
		return utils.storage.patientPharmacyRequestID
	}, function(nv){
		reloadTable();
	});
	
	$scope.saveChart= function(){
		var chart = $scope.treatmentChart;
		chart.nurse = utils.userSession.getID();
		chart.admissionId = $scope.admissionId;

		var req = utils.serverRequest("/nursing/pharmacy-request-treatment-chart/new", "POST", chart);
		req.then(function(response){
			$("#new_item").modal("hide");
			utils.alert("Operation Successful", "Treatment chart saved successfully", "success");
			reloadTable();
		}, function(error){
			utils.errorHandler(error);
		})
	}
})