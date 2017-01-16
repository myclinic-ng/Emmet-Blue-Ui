angular.module("EmmetBlue")

.controller("nursingQueuedPatientsController", function($rootScope, $scope, utils){
	$scope.loadImage = utils.loadImage;
	$scope.forwardEnabled = false;
	$scope.staffNames = {};
	function dtAction(data, full, meta, type){
		viewCardButtonAction = "manage('view',"+data.PatientID+")";
		closeButtonAction = "manage('close',"+data.PatientID+")";
		observationButtonAction = "manage('observation',"+data.PatientID+")";

		var dataOpts = "data-option-id = '"+data.PatientID+"' "+
					   "data-patient-uuid = '"+data.PatientUUID+"'";

		viewCard = "<button class='btn btn-default' ng-click=\""+viewCardButtonAction+"\">View Profile</button>";
		closeProfile = "<button class='btn btn-default' ng-click=\""+closeButtonAction+"\">Close</button>";
		observation = "<button class='btn btn-default btn-queue' ng-click=\""+observationButtonAction+"\""+dataOpts+">Process Patient</button>";
		return "<div class='btn-group'>"+viewCard+observation+closeProfile+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/patients/patient/view-unlocked-profiles', 'GET');
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
		utils.DT.columnBuilder.newColumn('PatientUUID').withTitle("Patient Number"),
		utils.DT.columnBuilder.newColumn('PatientFullName').withTitle("Patient Name"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Profile Status").renderWith(function(data){
			return "<span class='label label-success'>Unlocked</span>&nbsp;<span class='label label-info'>Unadmitted</span>";
		}),
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
				utils.serverRequest("/patients/patient/view?resourceId="+id, 'GET').then(function(response){
					$scope.patientInfo = response["_source"];
					$scope.forwardEnabled = false;
					$("#observation").modal("show");
				}, function(error){
					utils.errorHandler(error);
				});
				loadDoctors();
			}
		}
	}

	function loadStaffName(staffId){
		if (typeof $scope.staffNames[staffId] == 'undefined'){
			utils.getStaffFullName(staffId).then(function(response){
				$scope.staffNames[staffId] = response.StaffFullName;
			}, function(error){
				$scope.staffNames[staffId] = staffId;
			})
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