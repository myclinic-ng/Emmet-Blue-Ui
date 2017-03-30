angular.module("EmmetBlue")

.controller("accountsBillingSettingPaymentRulesController", function($scope, utils){
	$scope.patientCategories = [];
	$scope.patientTypes = [];
	$scope.patientTypeCheckbox = {};
	$scope.patientTypeCheckboxNames = {};

	$scope.billingTypes = [];
	$scope.billingTypeItems = [];
	$scope.billingTypeCheckbox = {};
	$scope.billingTypeCheckboxNames = {};

	$scope.linkDtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		if (typeof $scope.billingTypeSelector === "undefined"){
			$scope.billingTypeSelector = 0;
		}
		if(typeof $scope.patientTypeSelector === "undefined") {
			$scope.patientTypeSelector = "";
		}
		var request = utils.serverRequest('/accounts-biller/bill-payment-rule/view?resourceId='+$scope.billingTypeSelector+"&patientcategory="+$scope.patientTypeSelector, 'GET');

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
		utils.DT.columnBuilder.newColumn('PatientTypeName').withTitle("Patient Type"),
		utils.DT.columnBuilder.newColumn('BillingTypeItemName').withTitle("Billing Type Item"),
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

		var deleteBtn = "<button class='btn btn-xs' ng-click='"+deleteRule+"'> <i class='fa fa-bin'></i> Delete</button>";
		var editBtn =  "";//"<button class='btn btn-link' ng-click='"+editRule+"'>Edit</button>";

		return "<div class='btn-group'>"+editBtn+deleteBtn+"</div>";
	}

	$scope.reloadTable = function(){
		$scope.linkDtInstance.reloadData();
	}

	$scope.loadPatientCategories = function(){
		var requestData = utils.serverRequest("/patients/patient-type-category/view", "GET");
		requestData.then(function(response){
			$scope.patientCategories = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}

	function loadBillingTypes(){
		var request = utils.serverRequest("/accounts-biller/billing-type/view", "GET");
		request.then(function(result){
			$scope.billingTypes = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.loadPatientTypes = function(categoryId){
		var requestData = utils.serverRequest("/patients/patient-type/view-by-category?resourceId="+categoryId, "GET");
		requestData.then(function(response){
			$scope.patientTypes = response;
			$scope.patientTypeCheckboxNames = {};
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}

	function loadBillingTypeItems(id){
		var request = utils.serverRequest('/accounts-biller/billing-type-items/view?resourceId='+id, "GET");
		request.then(function(result){
			$scope.billingTypeItems = result;
			$scope.billingTypeCheckboxNames = {};
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.loadPatientCategories();
	loadBillingTypes();

	$scope.$watch("patientTypeSelector", function(newValue, oldValue){
		$scope.loadPatientTypes(newValue);
	});

	$scope.$watch("billingTypeSelector", function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			loadBillingTypeItems(newValue);
		}
	});

	$scope.toggleAllPatientTypeCheckbox = function(){	
		angular.forEach($scope.patientTypes, function(patientType){
			var id = patientType.PatientTypeID;
			$scope.patientTypeCheckbox[id] = $scope.allPatientTypeCheckboxToggler;
			$scope.patientTypeCheckboxNames[id] = id;
		})
	}

	$scope.toggleAllBillingTypeCheckbox = function(){	
		angular.forEach($scope.billingTypeItems, function(billingType){
			var id = billingType.BillingTypeItemID;
			$scope.billingTypeCheckbox[id] = $scope.allBillingTypeCheckboxToggler;
			$scope.billingTypeCheckboxNames[id] = id;
		})
	}

	$scope.submitRules = function(){
		var data = {
			ruleType: $scope.newRule.ruleType,
			ruleValue: $scope.newRule.ruleValue,
			patientTypes: $scope.patientTypeCheckboxNames,
			billingTypes: $scope.billingTypeCheckboxNames
		};

		utils.serverRequest("/accounts-biller/bill-payment-rule/new", "POST", data)
		.then(function(response){
			$("#new_setting_new_rule").modal("hide");
			utils.notify("Operation succesful", "Payment Rules has been created succesfully", "success");
			$scope.newRule = {};
			$scope.patientTypeCheckboxNames = {};
			$scope.patientTypeCheckbox = {};
			$scope.billingTypeCheckboxNames = {};
			$scope.billingTypeCheckbox = {};
			$scope.reloadTable();
		}, function(error){
			$scope.reloadTable();
			utils.errorHandler(error);
		});
	}

	$scope.deleteRule = function(id){
		utils.serverRequest("/accounts-biller/bill-payment-rule/delete?resourceId="+id, "DELETE")
		.then(function(response){
			utils.notify("Operation succesful", "The selected rule has been deleted succesfully", "success");
			$scope.reloadTable();
		}, function(error){
			utils.errorHandler(error);
		});
	}

})

.controller("accountsBillingSettingPaymentRulesTotalController", function($scope, utils){
	$scope.patientCategories = [];
	$scope.patientTypes = [];
	$scope.patientTypeCheckbox = {};
	$scope.patientTypeCheckboxNames = {};

	$scope.linkDtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		if(typeof $scope.patientTypeSelector === "undefined") {
			$scope.patientTypeSelector = "";
		}
		var request = utils.serverRequest('/accounts-biller/bill-payment-rule/view-total?resourceId=0'+"&patientcategory="+$scope.patientTypeSelector, 'GET');

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
				$("#new_setting_new_rule_total").modal("show");
			}
		}
    ]);

	$scope.linkDtColumns = [
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

		var deleteBtn = "<button class='btn btn-xs' ng-click='"+deleteRule+"'> <i class='fa fa-bin'></i> Delete</button>";
		var editBtn =  "";//"<button class='btn btn-link' ng-click='"+editRule+"'>Edit</button>";

		return "<div class='btn-group'>"+editBtn+deleteBtn+"</div>";
	}

	$scope.reloadTable = function(){
		$scope.linkDtInstance.reloadData();
	}

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
			$scope.patientTypeCheckboxNames = {};
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

		utils.serverRequest("/accounts-biller/bill-payment-rule/new-total", "POST", data)
		.then(function(response){
			$("#new_setting_new_rule_total").modal("hide");
			utils.notify("Operation succesful", "Payment Rules has been created succesfully", "success");
			$scope.newRule = {};
			$scope.patientTypeCheckboxNames = {};
			$scope.patientTypeCheckbox = {};
			$scope.reloadTable();
		}, function(error){
			$scope.reloadTable();
			utils.errorHandler(error);
		});
	}

	$scope.deleteRule = function(id){
		utils.serverRequest("/accounts-biller/bill-payment-rule/delete-total?resourceId="+id, "DELETE")
		.then(function(response){
			utils.notify("Operation succesful", "The selected rule has been deleted succesfully", "success");
			$scope.reloadTable();
		}, function(error){
			utils.errorHandler(error);
		});
	}

})

.controller("accountsBillingSettingAppendsPaymentRulesController", function($scope, utils){
	$scope.billingTypes = [];
	$scope.billingTypeItems = [];
	$scope.billingTypeCheckbox = {};
	$scope.billingTypeCheckboxNames = {};

	$scope.linkDtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/bill-payment-rule/view-append-items', 'GET');

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
				$("#new_setting_new_rule_append").modal("show");
			}
		}
    ]);

	$scope.linkDtColumns = [
		utils.DT.columnBuilder.newColumn('BillingTypeItemName').withTitle("Billing Type Item"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(action).notSortable()
	]

	$scope.linkDtInstance = {};

	function action(data, type, full, meta){
		var deleteRule = "deleteRule("+data.RuleID+")";
		var editRule = "editRule("+data.RuleID+")";

		var deleteBtn = "<button class='btn btn-xs' ng-click='"+deleteRule+"'> <i class='fa fa-bin'></i> Delete</button>";
		var editBtn =  "";//"<button class='btn btn-link' ng-click='"+editRule+"'>Edit</button>";

		return "<div class='btn-group'>"+editBtn+deleteBtn+"</div>";
	}

	$scope.reloadTable = function(){
		$scope.linkDtInstance.reloadData();
	}

	function loadBillingTypes(){
		var request = utils.serverRequest("/accounts-biller/billing-type/view", "GET");
		request.then(function(result){
			$scope.billingTypes = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	function loadBillingTypeItems(id){
		var request = utils.serverRequest('/accounts-biller/billing-type-items/view?resourceId='+id, "GET");
		request.then(function(result){
			$scope.billingTypeItems = result;
			$scope.billingTypeCheckboxNames = {};
		}, function(error){
			utils.errorHandler(error);
		})
	}


	loadBillingTypes();

	$scope.$watch("billingTypeSelector", function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			loadBillingTypeItems(newValue);
		}
	});

	$scope.toggleAllBillingTypeCheckbox = function(){	
		angular.forEach($scope.billingTypeItems, function(billingType){
			var id = billingType.BillingTypeItemID;
			$scope.billingTypeCheckbox[id] = $scope.allBillingTypeCheckboxToggler;
			$scope.billingTypeCheckboxNames[id] = id;
		})
	}

	$scope.submitRules = function(){
		var data = {
			items: $scope.billingTypeCheckboxNames
		};

		utils.serverRequest("/accounts-biller/bill-payment-rule/new-append-item", "POST", data)
		.then(function(response){
			$("#new_setting_new_rule_append").modal("hide");
			utils.notify("Operation succesful", "Payment Rules has been created succesfully", "success");
			$scope.newRule = {}
			$scope.billingTypeCheckboxNames = {};
			$scope.billingTypeCheckbox = {};
			$scope.reloadTable();
		}, function(error){
			$scope.reloadTable();
			utils.errorHandler(error);
		});
	}

	$scope.deleteRule = function(id){
		utils.serverRequest("/accounts-biller/bill-payment-rule/delete-append-item?resourceId="+id, "DELETE")
		.then(function(response){
			utils.notify("Operation succesful", "The selected rule has been deleted succesfully", "success");
			$scope.reloadTable();
		}, function(error){
			utils.errorHandler(error);
		});
	}

});