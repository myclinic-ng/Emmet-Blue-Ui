angular.module("EmmetBlue")

.controller('humanResourcesStaffManagementController', function($scope, utils){
	var functions = {
		loadDepartments: function(){
			var loadDepartments = utils.serverRequest('/human-resources/department/view', 'GET');

			loadDepartments.then(function(response){
				angular.forEach(response, function(val, key){
					if (typeof $scope.departments[val.GroupName] !== "undefined"){
						$scope.departments[val.GroupName].push(val);
					}
					else
					{
						$scope.departments[val.GroupName] = [val];
					}
				})

			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		},
		loadRoles: function(department){
			var loadRoles = utils.serverRequest('/human-resources/role/view-by-department?resourceId='+department, 'GET');

			loadRoles.then(function(response){
				$scope.roles = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		},
		newStaffCreated: function(){
			utils.alert("Operation Successful", "You have successfully registered a new staff", "success", "notify", "both");
			$scope.newStaff = {};
			$("#new_staff_profile").modal("show");
		}
	}

	functions.loadDepartments();
	$scope.departments = {};
	$scope.newStaff = {
		staff:{},
		department:{},
		role:{}
	};
	$scope.$watch(function(){
		return $scope.newStaff.department.departmentId;
	}, function(newValue){
		functions.loadRoles(newValue);
	})

	$scope.submitNewStaffForm = function(){
		var newStaff = $scope.newStaff;
			$('.loader').addClass('show');
		var save = utils.serverRequest('/human-resources/staff/new-staff-with-department-and-role', 'POST', newStaff);

		save.then(function(response){
			$('.loader').removeClass('show');
			utils.storage.hr ={
				currentNewStaffID: response.lastInsertId
			}

			functions.newStaffCreated();
		}, function(response){
			$('.loader').removeClass('show');
			utils.errorHandler(response);
		});
	}

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
		view = "<button class='btn btn-default btn-admission-process' ng-click=\""+viewButtonAction+"\""+dataOpts+">View Profile</button>";
		return "";//"<div class='btn-group'>"+view+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/human-resources/staff-profile/view-all-staffs', 'GET');
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
		utils.DT.columnBuilder.newColumn('StaffID').withTitle("Staff ID"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Full Name").renderWith(function(data){
			var image = $scope.loadImage(data.StaffPicture);
			var val ='<div class="media-left"> <a href="#"> <img src="'+image+'" class="img-circle" alt=""> </a> </div><div class="media-body">'+data.StaffFullName+'</div>';
			return "<div class='media'>"+val+"</div>";
		}),
		utils.DT.columnBuilder.newColumn('DepartmentName').withTitle("Department"),
		utils.DT.columnBuilder.newColumn('RoleName').withTitle("Staff Role"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	$scope.$on("new-staff-profile-registered", function(){
		$scope.dtInstance.reloadData();
		$scope.loadStaffsWithNoProfile();
	})

	$scope.loadStaffsWithNoProfile = function(){
		var req = utils.serverRequest("/human-resources/staff/view-staffs-with-no-profile", "GET");

		req.then(function(response){
			$scope.staffsWithNoProfile = response;
		}, function(erorr){
			utils.errorHandler(erorr);
		})
	}

	$scope.addProfileInfo = function(id){
		utils.storage.hr ={
			currentNewStaffID: id
		};

		$("#new_staff_profile").modal("show");
	}
})