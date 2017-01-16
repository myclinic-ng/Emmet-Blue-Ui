angular.module("EmmetBlue")

.controller("nursingPatientAdmissionController", function($scope, utils){
	$scope.loadImage = utils.loadImage;
	function dtAction(data, full, meta, type){
		// editButtonAction = "manage('edit',"+data.ObservationTypeID+")";
		// deleteButtonAction = "manage('delete',"+data.ObservationTypeID+")";
		// var dataOpt = "data-option-id='"+data.ObservationTypeID+
		// 			"' data-option-name='"+data.ObservationTypeName+
		// 			"' data-option-description='"+data.ObservationTypeDescription+
		// 			"'";
		// editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
		// deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";

		// viewCardButtonAction = "manage('view',"+data.PatientID+")";
		// closeButtonAction = "manage('close',"+data.PatientID+")";
		observationButtonAction = "manage('process',"+data.PatientAdmissionID+")";
		viewButtonAction = "manage('view',"+data.PatientAdmissionID+")";

		var dataOpts = "data-option-id = '"+data.PatientAdmissionID+"' "+
					   "data-option-consultant = '"+data.Consultant+"'"+
					   "data-option-patient = '"+data.Patient+"'"+
					   "data-option-ward = '"+data.WardName+"'"+
					   "data-option-section = '"+data.WardSectionName+"'"+
					   "data-option-section-id = '"+data.Section+"'"+
					   "data-option-admission-date = '"+data.AdmissionDate+"'";

		// viewCard = "<button class='btn btn-default' ng-click=\""+viewCardButtonAction+"\">View Profile</button>";
		// closeProfile = "<button class='btn btn-default' ng-click=\""+closeButtonAction+"\">Close</button>";
		observation = "<button class='btn btn-warning btn-admission-process' ng-if='!"+data.ReceivedInWard+"' ng-click=\""+observationButtonAction+"\""+dataOpts+">Process Patient</button>";
		view = "<button class='btn btn-default btn-admission-process' ng-if='"+data.ReceivedInWard+"' ng-click=\""+viewButtonAction+"\""+dataOpts+">View Admission</button>";
		return "<div class='btn-group'>"+observation+view+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/consultancy/patient-admission/view-admitted-patients?resourceId='+$scope.currentWard, 'GET');
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
		utils.DT.columnBuilder.newColumn('WardDetails.WardAdmissionID').withTitle("Admission Number"),
		utils.DT.columnBuilder.newColumn('Consultant').withTitle("Admitted By"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient Name").renderWith(function(data){
			var image = $scope.loadImage(data.PatientPicture);
			var val ='<div class="media-left"> <a href="#"> <img src="'+image+'" class="img-circle" alt=""> </a> </div> '+data.PatientFullName+' <span class="text-muted">'+data.PatientUUID+'</span>';
			return "<div class='media'>"+val+"</div>";
		}),
		utils.DT.columnBuilder.newColumn('AdmissionDate').withTitle("Admission Date"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Ward").renderWith(function(data){
			var val = data.WardName+"<div class='clear'></div><span class='pull-right display-block'>";

			val += "&nbsp;<span class='label label-info'>"+data.WardSectionName+"</span>"
			if (data.ReceivedInWard == 0){
				val += "&nbsp;<span class='label label-danger'> Not admitted to ward yet</span>"
			}
			else if (data.ReceivedInWard == 1){
				val += "&nbsp;<span class='label label-success'> Admitted to ward</span>"
			}

			return val+"</span>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	function loadWards(){
		var req = utils.serverRequest('/nursing/ward/view', 'GET');

		req.then(function(response){
			$scope.wards = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}
	loadWards();

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}

	$scope.manage = function(value, id){
		switch(value)
		{
			case "process":{
				$scope.admittedAlready = false;
				utils.serverRequest("/patients/patient/view?resourceId="+$(".btn-admission-process[data-option-id='"+id+"']").attr('data-option-patient'), 'GET').then(function(response){
					$scope.patientInfo = response["_source"];
					$scope.showPatientInfo = true;
					$elem = $(".btn-admission-process[data-option-id='"+id+"']");
					$scope.admissionInfo = {
						consultant: $elem.attr('data-option-consultant'),
						ward: $elem.attr('data-option-ward'),
						section: $elem.attr('data-option-section'),
						admissionDate: $elem.attr('data-option-admission-date')
					};
					
					$scope.currentAdmission = id;
					loadBeds($elem.attr('data-option-section-id'));
					$("#observation").modal("show");
				}, function(error){
					utils.errorHandler(error);
				});
				break;
			}
			case "view":{
				$scope.admittedAlready = true;
				utils.serverRequest("/patients/patient/view?resourceId="+$(".btn-admission-process[data-option-id='"+id+"']").attr('data-option-patient'), 'GET').then(function(response){
					$scope.patientInfo = response["_source"];
					$scope.showPatientInfo = true;
					$elem = $(".btn-admission-process[data-option-id='"+id+"']");
					$scope.admissionInfo = {
						consultant: $elem.attr('data-option-consultant'),
						ward: $elem.attr('data-option-ward'),
						section: $elem.attr('data-option-section'),
						admissionDate: $elem.attr('data-option-admission-date')
					};
					
					$scope.currentAdmission = id;
					$("#observation").modal("show");
				}, function(error){
					utils.errorHandler(error);
				});
				break;
			}
		}
	}

	function loadBeds(section){
		utils.serverRequest("/nursing/section-bed/view?resourceId="+section, "GET").then(function(response){
			$scope.beds = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.hold = {};
	$scope.admitPatient = function(){
		if (angular.isDefined($scope.hold.selectedBed) && $scope.hold.selectedBed != ""){
			var data = {
				bed: $scope.hold.selectedBed,
				admissionId: $scope.currentAdmission,
				processedBy: utils.userSession.getID(),
			};

			utils.serverRequest("/nursing/ward-admission/new", "POST", data).then(function(response){
				reloadTable();
				delete $scope.hold.selectedBed;	
				$("#observation").modal("hide");
			}, function(error){
				utils.errorHandler(error);
			})
		}
		else {
			utils.alert('You\'ve not selected a bed', "Please a select a bed from the list to continue", 'warning');
		}
	}

	$scope.$on("observationComplete", function(){
		$scope.forwardEnabled = true; 
	})

	$scope.$watch(function(){ return $scope.currentWard; }, function(nv){
		if (typeof nv != "undefined"){
			reloadTable();
		}
	});
})