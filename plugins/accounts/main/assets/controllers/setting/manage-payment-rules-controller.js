angular.module("EmmetBlue")

.controller("accountsBillingSettingPaymentRulesController", function($scope, utils){
	$scope.linkDtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/bill-payment-rule/view', 'GET');

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
			text: 'New rule',
			action: function(){
				$("#new_setting_new_rule").modal("show");
			}
		},
        {
        	extend: 'print',
        	text: '<u>P</u>rint'
        },
        {
        	extend: 'copy',
        	text: '<u>C</u>opy'
        }
    ]);

	$scope.linkDtColumns = [
		utils.DT.columnBuilder.newColumn('CategoryName').withTitle("Patient Type Category"),
		utils.DT.columnBuilder.newColumn('PatientTypeName').withTitle("Patient Type"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Rule Type").renderWith(function(data, type, full, meta){
			switch(data.RuleType)
			{
				case "*":
					return 'Multiplication'
					break;
				case "+":
					return 'Addition'
					break;
				case "-":
					return 'Subtraction'
					break;
				case "%":
					return 'Percentage'
					break;
				default:
					return data.RuleType;
			}
		}),
		utils.DT.columnBuilder.newColumn('RuleValue').withTitle("Rule Value"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(action).notSortable()
	]

	$scope.linkDtInstance = {};

	function action(data, type, full, meta){
		var deleteRule = "deleteRule("+data.RuleID+")";
		var editRule = "editRule("+data.RuleID+")";

		var deleteBtn = "<button class='btn btn-link' ng-click='"+deleteRule+"'> <i class='fa fa-bin'></i> Delete</button>";
		var editBtn =  "";//"<button class='btn btn-link' ng-click='"+editRule+"'>Edit</button>";

		return "<div class='btn-group'>"+editBtn+deleteBtn+"</div>";
	}

	function reloadTable(){
		$scope.linkDtInstance.reloadData();
	}

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
		$scope.loadPatientTypes(newValue);
	});

	$scope.toggleAllPatientTypeCheckbox = function(){	
		angular.forEach($scope.patientTypes, function(patientType){
			var id = patientType.PatientTypeID;
			$scope.patientTypeCheckbox[id] = $scope.allPatientTypeCheckboxToggler;
			$scope.patientTypeCheckboxNames[id] = id;
		})
	}

	$scope.submitRules = function(){
		var data = {
			ruleType: $scope.newRule.ruleType,
			ruleValue: $scope.newRule.ruleValue,
			patientTypes: $scope.patientTypeCheckboxNames
		};

		utils.serverRequest("/accounts-biller/bill-payment-rule/new", "POST", data)
		.then(function(response){
			$("#new_setting_new_rule").modal("hide");
			utils.notify("Operation succesful", "Payment Rules has been created succesfully", "success");
			$scope.newRule = {};
			$scope.patientTypeCheckboxNames = [];
			$scope.patientTypeCheckbox = [];
			reloadTable();
		}, function(error){
			reloadTable();
			utils.errorHandler(error);
		});
	}

	$scope.deleteRule = function(id){
		utils.serverRequest("/accounts-biller/bill-payment-rule/delete?resourceId="+id, "DELETE")
		.then(function(response){
			utils.notify("Operation succesful", "The selected rule has been deleted succesfully", "success");
			reloadTable();
		}, function(error){
			utils.errorHandler(error);
		});
	}

});