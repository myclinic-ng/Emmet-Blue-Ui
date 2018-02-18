angular.module("EmmetBlue")

.controller("nursingPatientDischargeController", function($scope, utils, $location){
	$scope.loadImage = utils.loadImage;

	var getCurrentDepartmentUrl = function(){
		var userDashboard = ("/"+utils.userSession.getDashboard()).split("/");

		var len = userDashboard.length;
		delete userDashboard[len - 1];
		delete userDashboard[0];

		return userDashboard.join("/");
	};

	function dtAction(data, full, meta, type){
		observationButtonAction = "manage('process',"+data.PatientAdmissionID+")";
		viewButtonAction = "manage('view',"+data.PatientAdmissionID+")";
		redirectButtonAction = "manage('gotoWorkspace',"+data.PatientAdmissionID+")";

		var dataOpts = "data-option-id = '"+data.PatientAdmissionID+"' "+
					   "data-option-consultant = '"+data.Consultant+"'"+
					   "data-option-patient = '"+data.Patient+"'"+
					   "data-option-ward = '"+data.WardName+"'"+
					   "data-option-section = '"+data.WardSectionName+"'"+
					   "data-option-section-id = '"+data.Section+"'"+
					   "data-option-admission-date = '"+data.AdmissionDate+"'"+
					   "data-option-discharged-by = '"+data.DichargedBy+"'"+
					   "data-option-date-discharged = '"+data.DischargeDate+"'"+
					   "data-option-ward-admission-id = '"+data.WardAdmissionID+"'";


		view = "<button class='btn btn-info bg-white btn-admission-process btn-xs btn-labeled' ng-click=\""+viewButtonAction+"\""+dataOpts+"><b><i class='icon-database-time2'></i></b>View Admission</button>";
		view = "<div class='display-block' ng-if='"+data.ReceivedInWard+"'>"+view+
				"<button class='btn btn-success bg-white btn-xs mt-5 btn-labeled' ng-click=\""+redirectButtonAction+"\""+dataOpts+"><b><i class='icon-folder-download3'></i></b> Load Workspace</button>"+
				"</div>";
		return "<div class='btn-group'>"+view+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
		var draw = data[0].value;
        var order = data[2].value;
        var start = data[3].value;
        var length = data[4].value;

        var url = '/consultancy/patient-admission/view-discharged-patients?resourceId='+$scope.currentWard+'&paginate&from='+start+'&size='+length;
		if (typeof data[5] !== "undefined" && data[5].value.value != ""){
			url += "&keywordsearch="+data[5].value.value;
		}

		var discharges = utils.serverRequest(url, 'GET');
		discharges.then(function(response){
			var records = {
				data: response.data,
				draw: draw,
				recordsTotal: response.total,
				recordsFiltered: response.filtered
			};

			callback(records);
		}, function(error){
			utils.errorHandler(error);
		});
	})
	.withDataProp('data')
	.withOption('processing', true)
	.withOption('serverSide', true)
	.withOption('paging', true)
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
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
        	extend: 'print',
        	text: '<i class="icon-printer"></i> <u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	},
        	exportOptions:{
        		columns: [0, 1, 3, 4, 5]
        	}
        },
        {
        	extend: 'copy',
        	text: '<i class="icon-copy"></i> <u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: false,
        		altKey: true
        	},
        	exportOptions:{
        		columns: [0, 1, 3, 4, 5]
        	},
        	exportData: {
        		decodeEntities: true
        	}
        }
	]);

    $scope.consultantsName  = {};
	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn(null).withTitle("S/N").renderWith(function(data, type, full, meta){
			return meta.row + 1;
		}).notVisible(),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient Name").renderWith(function(data){
			var image = $scope.loadImage(data.PatientPicture);
			var val = "<div class='media'>"+
						"<div class='media-left'>"+
							"<a href='#'>"+
								"<img src='"+image+"' class='img-circle img-lg' alt=''>"+
							"</a>"+
						"</div>"+

						"<div class='media-body' style='width: auto !important;'>"+
							"<h6 class='media-heading'>"+data.PatientFullName+"</h6>"+
							"<span class='text-muted'> "+data.PatientUUID+"</span>"+
						"</div>"+
					"</div>";

			return "<div class='content-group'>"+val+"</div>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Discharged By").renderWith(function(data, f, m){
			if (typeof $scope.consultantsName[data.DischargedBy] == "undefined"){
				utils.getStaffFullName(data.DischargedBy).then(function(response){
					$scope.consultantsName[response.StaffID] = response.StaffFullName;
				}, function(error){
					$scope.consultantsName[data.DischargedBy] = data.DischargedBy;
				})
			}

			return "<p>{{consultantsName["+data.DischargedBy+"]}}</p>";
			
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Discharge Date").renderWith(function(data, x, y){
			return "<p title='"+data.DischargeDate+"'>"+new Date(data.DischargeDate).toDateString()+"</p>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Ward").renderWith(function(data){
			var val = data.WardName+"<span>";

			val += "&nbsp;<span class='label label-info mb-5'> "+data.WardSectionName+"</span>"
			if (data.DischargeStatus == -1){
				val += "<span class='label label-danger display-block text-muted' title='The discharge process has not been completed'> Discharge In Progress</span>"
			}
			else if (data.DischargeStatus == 1){
				val += "<span class='label label-success display-block text-muted' title='Its time to send this patient home'> Discharge process completed</span>"
			}

			return val+"</span>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("").renderWith(dtAction).notSortable()
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
					$scope.loadStaffName($scope.admissionInfo.consultant);
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
						admissionDate: $elem.attr('data-option-admission-date'),
						bed: $elem.attr('data-option-bed'),
						admissionProcessedBy: $elem.attr('data-option-discharged-by'),
						admissionProcessedDate: $elem.attr('data-option-date-discharged')
					};
					$scope.currentAdmission = id;
					$scope.loadStaffName($scope.admissionInfo.admissionProcessedBy);
					$("#observation").modal("show");
				}, function(error){
					utils.errorHandler(error);
				});
				break;
			}
			case "gotoWorkspace":{
				$elem = $(".btn-admission-process[data-option-id='"+id+"']");

				var wardid = $elem.attr('data-option-ward-admission-id');

				utils.storage.currentWorkspacePatientToLoad = wardid;
				var url = getCurrentDepartmentUrl();
				$location.path(url+"patient-workspace");
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

	$scope.$watch(function(){ return $scope.currentWard; }, function(ov, nv){
		if (typeof nv != "undefined"){
			reloadTable();
		}
	});

	$scope.loadStaffName = function(id){
		if (typeof $scope.consultantsName[id] == "undefined"){
			utils.getStaffFullName(id).then(function(response){
				$scope.consultantsName[response.StaffID] = response.StaffFullName;
			}, function(error){
				$scope.consultantsName[id] = id;
			})
		}
	}
})