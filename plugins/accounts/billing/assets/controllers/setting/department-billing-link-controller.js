angular.module("EmmetBlue")

.controller("accountsBillingSettingDepartmentBillingLinkingController", function($scope, utils){
	function loadDepartments(){
		var request = utils.serverRequest("/human-resources/department/view", "GET");
		request.then(function(result){
			$scope.departments = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	function loadBillingTypes(){
		var request = utils.serverRequest("/accounts-biller/billing-type/view", "GET");
		request.then(function(result){
			$scope.billingTypes = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.departments = {};
	$scope.billingTypes = {};
	$scope.currentDepartment;
	loadDepartments();
	loadBillingTypes();

	$scope.linkDtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/department-billing-link/view-by-department?resourceId='+$scope.currentDepartment, 'GET');

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
			text: 'Link new billing type',
			action: function(){
				$("#new_setting_department_billing_link").modal("show");
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
		utils.DT.columnBuilder.newColumn('BillingTypeName').withTitle("Linked billing type"),
		utils.DT.columnBuilder.newColumn('BillingTypeDescription').withTitle("Description"),
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
		var request = utils.serverRequest('/accounts-biller/department-billing-link/delete?resourceId='+department, 'GET');

		request.then(function(response){
			utils.alert("Operation Successful", "The billing type has been unlinked", "success", "notify");

			reloadTable();
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.completeLinking = function(){
		var request = utils.serverRequest("/accounts-biller/department-billing-link/new", "POST", {
			department: $scope.currentDepartment,
			billingType: $scope.currentBillingType
		});

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully linked a new billing type", "success", "notify");
			$("#new_setting_department_billing_link").modal("hide");
			reloadTable();
		}, function(response){
			utils.errorHandler(response);
		});
	}
});