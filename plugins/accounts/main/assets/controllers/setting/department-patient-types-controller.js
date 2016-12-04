angular.module("EmmetBlue")

.controller("accountsBillingSettingDepartmentPatientTypesLinkingController", function($scope, utils){
	function loadDepartments(){
		var request = utils.serverRequest("/human-resources/department/view", "GET");
		request.then(function(result){
			$scope.departments = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.departments = {};
	$scope.currentDepartment;
	loadDepartments();

	$scope.patientCategories = {};
	$scope.patientTypes = {};
	$scope.patientTypeCheckbox = [];
	$scope.patientTypeCheckboxNames = [];
	$scope.loadPatientCategories = function(){
		var requestData = utils.serverRequest("/patients/patient-type-category/view", "GET");
		requestData.then(function(response){
			$scope.patientCategories = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}

	$scope.loadPatientTypes = function(categoryId){
		var requestData = utils.serverRequest("/patients/patient-type/view-by-category?resourceId="+categoryId, "GET");
		requestData.then(function(response){
			$scope.patientTypes = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}


	$scope.loadPatientCategories();

	$scope.$watch("patientTypeSelector", function(newValue, oldValue){
		$scope.allPatientTypeCheckboxToggler = false;
		$scope.loadPatientTypes(newValue);
	});

	$scope.advancedFormToggleState = false;
	$scope.toggleAdvancedForm = function(){
		$scope.advancedFormToggleState = !$scope.advancedFormToggleState;
	}

	$scope.toggleAllPatientTypeCheckbox = function(){	
		angular.forEach($scope.patientTypes, function(patientType){
			var id = patientType.PatientTypeID;
			$scope.patientTypeCheckbox[id] = $scope.allPatientTypeCheckboxToggler;
			$scope.patientTypeCheckboxNames[id] = patientType.PatientTypeName;
		})
	}

	$scope.linkDtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/department-patient-types-report-link/view-by-department?resourceId='+$scope.currentDepartment, 'GET');

		return request;
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
	.withButtons([
		{
			text: 'Link new patient type',
			action: function(){
				$("#new_setting_department_patient_types_link").modal("show");
			}
		},
        {
        	extend: 'print',
        	text: '<u>P</u>rint this data page'
        },
        {
        	extend: 'copy',
        	text: '<u>C</u>opy this data'
        }
    ]);

	$scope.linkDtColumns = [
		utils.DT.columnBuilder.newColumn('PatientTypeName').withTitle("Linked patient type"),
		utils.DT.columnBuilder.newColumn('CategoryName').withTitle("Category"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(unlinkDepartmentAction).notSortable()
	]

	$scope.linkDtInstance = {};

	function unlinkDepartmentAction(data, type, full, meta){
		var link = "unlinkDepartment("+data.LinkID+")";

		return "<button class='btn btn-danger' ng-click='"+link+"'>Unlink</button>";
	}

	function reloadTable(){
		$scope.linkDtInstance.reloadData();
	}

	$scope.$watch('currentDepartment', function(newValue, oldValue){
		if (typeof $scope.currentDepartment !== 'undefined'){
			reloadTable();
		}
	})

	$scope.unlinkDepartment = function(department){
		var request = utils.serverRequest('/accounts-biller/department-patient-types-report-link/delete?resourceId='+department, 'GET');

		request.then(function(response){
			utils.alert("Operation Successful", "The patient type has been unlinked", "success", "notify");

			reloadTable();
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.completeLinking = function(){
		var patientTypes = [];
		for (var type in $scope.patientTypeCheckbox){
			if (!$scope.patientTypeCheckbox[type]){
				delete $scope.patientTypeCheckbox[type];
			}
			else {
				patientTypes.push(type);
			}
		}
		$scope.patientTypeCheckbox = [];
		var request = utils.serverRequest("/accounts-biller/department-patient-types-report-link/new", "POST", {
			department: $scope.currentDepartment,
			patientTypes: patientTypes
		});

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully linked the selected patient types", "success", "notify");
			$("#new_setting_department_patient_types_link").modal("hide");
			reloadTable();
		}, function(response){
			utils.errorHandler(response);
		});
	}
});