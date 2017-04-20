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

		viewCard = "<button class='btn btn-default text-info' ng-click=\""+viewCardButtonAction+"\"><i class='fa fa-eye'></i></button>";
		closeProfile = "<button class='btn btn-default text-danger' ng-click=\""+closeButtonAction+"\"><i class='fa fa-times'></i></button>";
		observation = "<button class='btn btn-default btn-queue' ng-click=\""+observationButtonAction+"\""+dataOpts+"> Process</button>";
		return "<div class='btn-group'>"+viewCard+observation+closeProfile+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/patients/patient/view-unlocked-profiles', 'GET');
	})
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

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient").renderWith(function(data, full, meta){
			var image = $scope.loadImage(data.PatientPicture);
			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
							"</div>"+
							"<div class='media-left'>"+
								"<div class=''><a href='#' class='text-default text-bold'>"+data.PatientFullName+"</a></div>"+
								"<div class='text-muted text-size-small'>"+
									"<span class='status-mark border-blue position-left'></span>"+
									data.PatientUUID+
									"<br/><span class='label label-success'>Unlocked</span>"+
								"</div>"+
							"</div>"+
						"</td>";

			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient Type").renderWith(function(data){
			return "<span class='text-bold'>"+data.PatientTypeName+"</span> <br/>"+data.CategoryName+"";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Last Visit Details").renderWith(function(data, full, meta){
			if (typeof data.LastVisitDetails == "undefined" || data.LastVisitDetails.length < 1){
				var html = "<span class='text-center text-muted'>N/A</span>";
			}
			else {
				var image = $scope.loadImage(data.LastVisitDetails.StaffPicture);
				var html = "<td>"+
								"<div class='media-left media-middle'>"+
									"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
								"</div>"+
								"<div class='media-left'>"+
									"<div class=''><a href='#' class='text-default text-bold'>"+data.LastVisitDetails.StaffFullName+"</a></div>"+
									"<div class='text-muted text-size-small'>"+
										(new Date(data.LastVisitDetails.LastModified)).toDateString()+
									"</div>"+
								"</div>"+
							"</td>";	
			}

			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	function reloadTable(){
		$rootScope.$broadcast("recountQueue");
		$scope.dtInstance.reloadData();
		utils.notify("Operation Succesful", "The queue has been reloaded", "info");
	}

	$scope.reloadTable = function(){
		reloadTable();
	}

	$scope.$on("reloadQueue", function(){
		reloadTable();
	})
	// setInterval(function(){
	// 	reloadTable();
	// }, 5000);

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