angular.module("EmmetBlue")

.controller('humanResourcesStaffManagementController', function($scope, utils, $timeout){
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
		var editButtonAction = "manageStaff('edit', "+data.StaffID+")";
		var changeTypeButtonAction = "manageStaff('department', "+data.StaffID+")";
		var changePasswordButtonAction = "manageStaff('changePassword', "+data.StaffID+")";
		var fingerEnrollButtonAction = "manageStaff('fingerEnroll', "+data.StaffID+")";

		var dataOpt = "data-option-id='"+data.StaffID+"' data-option-name='"+data.StaffUsername+"' data-option-department='"+data.DepartmentID+"'";

		var manageButton  = "<div class='btn-group'>"+
			                	"<button type='button' class='btn bg-active btn-labeled dropdown-toggle' data-toggle='dropdown'><b><i class='icon-cog3'></i></b> manage <span class='caret'></span></button>"+
			                	"<ul class='dropdown-menu dropdown-menu-right'>"+
								"	<li><a href='#' class='staff-management-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='icon-pencil5'></i> Edit Account</a></li>"+
								"	<li><a href='#' class='staff-management-btn' ng-click=\""+changeTypeButtonAction+"\" "+dataOpt+"><i class='fa fa-unlink'></i> Manage Departments</a></li>"+
								"	<li><a href='#'><i class='fa fa-file-text-o'></i> View Log</a></li>"+
								"	<li class='divider'></li>"+
								"	<li><a href='#' class='staff-management-btn' ng-click=\""+fingerEnrollButtonAction+"\" "+dataOpt+">Enroll Biometric ID</a></li>"+
								"	<li><a href='#' class='staff-management-btn' ng-click=\""+changePasswordButtonAction+"\" "+dataOpt+">Change Password</a></li>"+
								"</ul>"+
							"</div>";
		var buttons = manageButton;
		return buttons;
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
		utils.DT.columnBuilder.newColumn('StaffID').withTitle("Staff ID"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Full Name").renderWith(function(data){
			var image = $scope.loadImage(data.StaffPicture);
			var val = "<div class='media'>"+
						"<div class='media-left'>"+
							"<a href='#'>"+
								"<img src='"+image+"' class='img-circle img-lg' alt=''>"+
							"</a>"+
						"</div>"+

						"<div class='media-body' style='width: auto !important;'>"+
							"<h6 class='media-heading text-bold'>"+data.StaffFullName+"</h6>"+
							"<span class='text-muted'> "+data.RoleName+"</span>"+
						"</div>"+
					"</div>";

			return "<div class='content-group'>"+val+"</div>";
		}),
		utils.DT.columnBuilder.newColumn('DepartmentName').withTitle("Department"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Account").renderWith(function(data, b, c){
			var val = data.StaffUsername+"<span>";

			if (data.isLoggedIn == 1){
				val += "<br/><span class='label label-success mb-5'> Online</span>"
			}
			else if (data.isLoggedIn == 0){
				val += "<br/><span class='label label-danger mb-5'> Away</span>"
			}

			return val+"</span>";
		}),
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

	$scope.manageStaff = function(action, id){
		switch (action){
			case "edit":{
				break;
			}
			case "department":{
				var staff = id;

				utils.serverRequest("/human-resources/staff-department/view-secondary-departments?resourceId="+staff, "GET").then(function(response){
					$scope.switchDept = {
						currentStaff: id,
						secondaryDept: ""
					};

					$scope.secondaryDept = "";
					$scope.currentSecondaryDepartments = response;
				}, function(error){
					utils.errorHandler(error);
				});

				$("#manage_staff_department").modal("show");
				break;
			}
			case "changePassword":{
				var staff = id;
				$scope.tempHolder = {
					username: $(".staff-management-btn[data-option-id='"+id+"']").attr('data-option-name'),
					staff: id,
					password: ''
				};

				$("#change_staff_password_modal").modal("show");

				break;
			}
			case "fingerEnroll":{
				$scope.currentEnrollStaff = id;
				$scope.biometricEnroll();
			}
		}
	}

	$scope.submitChangePasswordForm = function(){
		var confirmPassword = $("#confirmStaffPasswordValue").val();
		if ($scope.tempHolder.password != confirmPassword){
			utils.alert("Passwords do not match", "Please make sure you specify matching values for the two password fields", "warning")
		}
		else if ($scope.tempHolder.password == ''){
			utils.alert("Invalid password specified", "Please fill in valid values in the password fields", "warning");
		}
		else {
			$("#change_staff_password_modal").modal("hide");
			$("#sudoModeModal").modal({
				keyboard: false,
				backdrop: "static"
			});
			$scope.currentSudoOperation = "changePassword";
		}
	}

	$scope.$on("sudo-mode-bypassed", function(){
		$("#sudoModeModal").modal("hide");

		switch($scope.currentSudoOperation){
			case "changePassword":
			{
				var data = $scope.tempHolder;
				utils.serverRequest("/human-resources/staff/update-password", "POST", data).then(function(response){
					utils.notify("Operation Successful", "The password for the selected account has been changed successfully", "success");
					$scope.tempHolder = {};
				}, function(error){
					utils.errorHandler(error);
				})

				break;
			}
		}
	});

	$scope.addSecondaryDepartment = function(){
		var data = {
			staff: $scope.switchDept.currentStaff,
			department: $scope.switchDept.secondaryDept
		};

		utils.serverRequest("/human-resources/staff-department/assign-secondary", "POST", data).then(function(response){
			utils.notify("Operation Successful", "The selected account has been granted access to the specified department", "success");
			$scope.manageStaff("department", $scope.switchDept.currentStaff);
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.changePrimaryDepartment = function(){
		var data = {
			resourceId: $scope.switchDept.currentStaff,
			DepartmentID: $scope.switchDept.secondaryDept
		};

		utils.serverRequest("/human-resources/staff-department/edit", "PUT", data).then(function(response){
			utils.notify("Operation Successful", "The selected account has been assigned to the specified department", "success");
			$scope.manageStaff("department", $scope.switchDept.currentStaff);
			$scope.dtInstance.reloadData();
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.fingerprintImage = ['', '', '', ''];
	$scope.fpStreamCounter = 0;
	$scope.fingerLoaded = [false, false, false, false];
	$scope.fingerprintCount = 4;

	function streamFingerprint(index, auto=true){
		var req = utils.serverRequest("/stream-fingerprint", "GET");
		req.then(function(response){
			if (response){
				$scope.fingerprintImage[index] = response;
				$scope.fingerLoaded[index] = true;
				if (auto && index < $scope.fingerprintCount){
					index++;
					streamFingerprint(index);
				}
			}
			else {
				if ($scope.fpStreamCounter < 30){
					$timeout(function() {
						streamFingerprint(index, auto);
						$scope.fpStreamCounter++;
					}, 1000);
				}
				else {
					utils.notify("Scanner Timeout", "No Scan Detected. Please try again or contact an administrator", "info");
				}
			}
		})
	}

	$scope.streamFingerprint = function(count){
		$scope.fingerprintCount = count;
		$scope.fpStreamCounter = 0;
		console.log("Starting ", 0);
		streamFingerprint(0, true);	
	}

	$scope.rescanFinger = function(index){
		$scope.fingerLoaded[index] = false;
		$scope.fingerprintImage[index] = '';
		$scope.fpStreamCounter = 0;
		console.log("Starting", index);
		streamFingerprint(index, false)
	}


	$scope.biometricEnroll = function(){
		var req = utils.serverRequest("/biometrics/fingerprint-cache/clear-cache", "GET");
		req.then(function(response){
			$scope.fingerprintImage = ['', '', '', ''];
			$scope.fpStreamCounter = 0;
			$scope.fingerLoaded = [false, false, false, false];
			$("#biometric_new_staff_modal").modal("show");
			$scope.streamFingerprint(4);
		})
	}

	$scope.addFingerprintsToRegistration = function(){
		var fingerprints = {
			"left1":  "data:image/jpg;base64,"+$scope.fingerprintImage[0],
			"left2":  "data:image/jpg;base64,"+$scope.fingerprintImage[1],
			"right1": "data:image/jpg;base64,"+ $scope.fingerprintImage[2],
			"right2": "data:image/jpg;base64,"+ $scope.fingerprintImage[3]
		};

		var data = {
			fingerprints: fingerprints,
			staff: $scope.currentEnrollStaff
		};

		$("#biometric_new_staff_modal").modal("hide");

		var req = utils.serverRequest("/human-resources/staff-profile/enroll-fingerprint", "POST", data);
		req.then(function(response){
			console.log(response);
			utils.notify("Enrollment Complete", "The biometric id for selected staff has been stored successfully", "success");
		}, function(error){
			utils.errorHandler(error);
		})
	}
})