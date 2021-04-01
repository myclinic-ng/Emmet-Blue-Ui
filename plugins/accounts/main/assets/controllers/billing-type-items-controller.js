angular.module("EmmetBlue")

.controller('accountsBillingBillingTypeItemsController', function($scope, utils){
	$scope.startWatching = false;
	$scope.$watch(function(){
		return utils.storage.billingTypeItemsData
	}, function(newValue){
		$scope.billingTypeItemsName = newValue.name;
		$scope.billingTypeItems = newValue.id;

		if (!$scope.startWatching){
			$scope.startWatching = true;
		}
		else{
			$scope.reloadBillingTypeItemsTable();
		}
	})

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

	var functions = {
		actionMarkups: {
			billingTypeItemsActionMarkup: function (data, type, full, meta){
				var editButtonAction = "manageBillingTypeItems('edit', "+data.BillingTypeItemID+")";
				var deleteButtonAction = "manageBillingTypeItems('delete', "+data.BillingTypeItemID+")";
				var viewButtonAction = "manageBillingTypeItems('view', "+data.BillingTypeItemID+")";
				var controlButtonAction = "manageBillingTypeItems('control', "+data.BillingTypeItemID+")";

				var dataOpt = "data-option-id='"+data.BillingTypeItemID+"' data-option-name='"+data.BillingTypeItemName+"' data-option-price='"+data.BillingTypeItemPrice+"' data-option-rate='"+data.RateIdentifier+"'";
				
				var editButton = "<button class='btn btn-default billing-type-items-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
				var deleteButton = "<button class='btn btn-default billing-type-items-btn' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";
				var controlButton = "<button class='btn btn-warning bg-white billing-type-items-btn mr-5' ng-click=\""+controlButtonAction+"\" "+dataOpt+"><i class='fa fa-cog'></i> Price Control</button>";
				var viewButton = "<button class='btn btn-default billing-type-items-btn' ng-click=\""+viewButtonAction+"\" "+dataOpt+"><i class='fa fa-eye'></i> View Price By Patient Type</button>";

				var buttons = controlButton+"<div class='btn-group'>"+viewButton+editButton+deleteButton+"</button>";
				return buttons;
			}
		},
		newBillingTypeItemsCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new billing type items", "success", "notify");
			$scope.newBillingTypeItems = {};
			$scope.newBillingTypeItems.interval = [];
			$("#new_billing_type_items").modal("hide");

			$scope.reloadBillingTypeItemsTable();
		},
		newPriceStructureCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new price structure for the selected item", "success", "notify");
			$scope.newBillingTypeItems = {};
			$scope.newBillingTypeItems.interval = [];
			$("#new_billing_price_structure").modal("hide");

			$scope.reloadBillingTypeItemsTable();
		},
		billingTypeItemsEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$("#edit_billing_type_items").modal("hide");

			$scope.reloadBillingTypeItemsTable();
		},
		billingTypeItemsDeleted: function(){
			utils.alert("Operation Successful", "The selected billing type items has been deleted successfully", "success", "notify");
			delete  $scope._id;

			$scope.reloadBillingTypeItemsTable();
		},
		manageBillingTypeItems: {
			newBillingTypeItems: function(){
				$scope.newBillingTypeItems = {};
				$scope.newBillingTypeItems.priceStructures = [];
				$scope.priceStructure = {};
				$scope.priceStructure.interval = [];
				$("#new_billing_type_items").modal("show");
			},
			newPricingStructure: function(){
				$scope.newBillingTypeItems = {};
				$scope.newBillingTypeItems.priceStructures = [];
				$scope.priceStructure = {};
				$scope.priceStructure.interval = [];
				$("#new_billing_price_structure").modal("show");
			},
			editBillingTypeItems: function(id){
				$scope.tempHolder.name = $(".billing-type-items-btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.id = id;

				$("#edit_billing_type_items").modal("show");
			},
			deleteBillingTypeItems: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete the Billing Type Item named "+$(".billing-type-items-btn[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/accounts-biller/billing-type-items/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.billingTypeItemsDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			},
			deleteBillingTypeItemPrice: function(id){
				var title = "Delete Prompt";
				var text = "Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope.__id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/accounts-biller/billing-type-items-prices/delete?'+utils.serializeParams({
						'resourceId': $scope.__id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "The selected price has been deleted successfully", "success");
						delete  $scope.__id;

						$scope.reloadBillingTypeItemsPricesTable();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			},
			viewBillingTypeItems: function(groupId){

			}
		}
	}

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

	$scope.addIntervalToList = function(){
		var interval = $scope.interval;
		$scope.interval = {};
		$('.loader').addClass('show');

		$scope.priceStructure.interval.push(interval);
		$('.loader').removeClass('show');
	}

	$scope.addPriceStructureToBillingList = function(){
		$scope.priceStructure.patientTypes = [];
		$('.loader').addClass('show');
		for (var type in $scope.patientTypeCheckbox){
			if (!$scope.patientTypeCheckbox[type]){
				delete $scope.patientTypeCheckbox[type];
			}
			else {
				$scope.priceStructure.patientTypes.push(type);
			}
		}
		$scope.newBillingTypeItems.priceStructures.push($scope.priceStructure);
		$scope.priceStructure = {};
		$scope.patientTypeCheckbox = [];
		$('.loader').removeClass('show');
		$("#new_billing_type_item_payment_structure").modal("hide");
	}

	$scope.removePriceStructure = function(id){
		$scope.newBillingTypeItems.priceStructures.splice(id, 1);
	}

	$scope.ddtInstance = {};

	$scope.ddtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var billingTypeItemss = utils.serverRequest('/accounts-biller/billing-type-items/view?resourceId='+$scope.billingTypeItems, 'GET');
		return billingTypeItemss;
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
			text: '<i class="icon-file-plus"></i> New item',
			action: function(){
				functions.manageBillingTypeItems.newBillingTypeItems();
			}
		},
		{
			text: '<i class="icon-file-plus"></i> New price structure for existing item',
			action: function(){
				functions.manageBillingTypeItems.newPricingStructure();
			}
		}
	]);	

	$scope.ddtColumns = [
		utils.DT.columnBuilder.newColumn('BillingTypeItemID').withTitle("Item Code"),
		utils.DT.columnBuilder.newColumn('BillingTypeItemName').withTitle("Item Name"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.billingTypeItemsActionMarkup).notSortable()
	];

	$scope.tempHolder = {};

	$scope.reloadBillingTypeItemsTable = function(){
		loadItems();
		$scope.ddtInstance.reloadData();
	}

	$scope.billingTypeItemCurrentPrice = 0;
	$scope.ddttInstance = {};

	$scope.ddttOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var billingTypeItemss = utils.serverRequest('/accounts-biller/billing-type-items-prices/view?resourceId='+$scope.billingTypeItemCurrentPrice, 'GET');
		return billingTypeItemss;
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
	// .withButtons([
	// 	{
	// 		text: '<i class="fa fa-file"></i> View Default Prices For This Item',
	// 		action: function(){
	// 			$scope.toggleCurrentFieldDefaultValueViewFunc();
	// 		}
	// 	}
	// ]);

	$scope.ddttColumns = [
		utils.DT.columnBuilder.newColumn('PatientTypeName').withTitle("Patient Type"),
		utils.DT.columnBuilder.newColumn('CategoryName').withTitle("Category"),
		utils.DT.columnBuilder.newColumn('BillingTypeItemPrice').withTitle("Associated Price"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(function(data, type, full, meta){
			var deleteButtonAction = "manageBillingTypeItems('deletePrice', "+data.BillingTypeItemsPricesID+")";

			var deleteButton = "<button class='btn btn-default billing-type-items-btn' ng-click=\""+deleteButtonAction+"\"> <i class='fa fa-trash-o'></i> delete</button>";

			var buttons = "<div class='btn-group'>"+deleteButton+"</button>";
			return buttons; 
		}).notSortable()
	];

	$scope.reloadBillingTypeItemsPricesTable = function(){
		$scope.ddttInstance.reloadData();
	}

	function loadItems(){
		utils.serverRequest('/accounts-biller/billing-type-items/view?resourceId='+$scope.billingTypeItems, "GET")
		.then(function(response){
			$scope.currentBillingTypeItems = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.saveNewBillingTypeItems = function(){
		var newBillingTypeItems = $scope.newBillingTypeItems;

		newBillingTypeItems.billingType = $scope.billingTypeItems;
		$('.loader').addClass('show');

		var saveNewBillingTypeItems = utils.serverRequest('/accounts-biller/billing-type-items/new', 'POST', newBillingTypeItems);

		saveNewBillingTypeItems.then(function(response){
			$('.loader').removeClass('show');
			functions.newBillingTypeItemsCreated();
		}, function(response){
			$('.loader').removeClass('show');
			utils.errorHandler(response);
		});
	}

	$scope.saveNewPricingStructure = function(){
		var newBillingTypeItems = $scope.newBillingTypeItems;

		newBillingTypeItems.billingType = $scope.billingTypeItems;
		$('.loader').addClass('show');

		var saveNewBillingTypeItems = utils.serverRequest('/accounts-biller/billing-type-items/new-price-structure', 'POST', newBillingTypeItems);

		saveNewBillingTypeItems.then(function(response){
			$('.loader').removeClass('show');
			functions.newPriceStructureCreated();
		}, function(response){
			$('.loader').removeClass('show');
			utils.alert("Duplicate Price Structures Detected", "Please note that adding a duplicate price for an item is not allowed", "error");
		});
	}

	$scope.saveEditBillingTypeItems = function(){
		var editBillingTypeItems = $scope.tempHolder;

		var data = {
			BillingTypeItemName:editBillingTypeItems.name,
			resourceId:editBillingTypeItems.id
		};
		
		var saveEdits = utils.serverRequest('/accounts-biller/billing-type-items/edit', 'PUT', data);
		saveEdits.then(function(response){
			functions.billingTypeItemsEdited();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})

	}

	$scope.saveCurrentItemGeneralPrices = function(){
		var datum = [];
		for (var i = 0; i < $scope.currentItemGeneralPrices.length; i++){
			var data = {};
			data.categoryId = $scope.currentItemGeneralPrices[i].CategoryID;
			data.price = $scope.currentItemGeneralPrices[i].BillingTypeItemPrice;
			data.billingTypeItem = $scope.billingTypeItemCurrentPrice;

			datum.push(data);
		}

		var req = utils.serverRequest("/accounts-biller/billing-type-items/new-price-structure-by-patient-category", "PUT", {"prices":datum});

		req.then(function(response){
			if (response){
				utils.notify("Operation Successful", "General Price Updated For The Specified Patient Type Categories", "success");
				var req = utils.serverRequest("v1/accounts-biller/billing-type-items/view-item-price-by-category?resourceId="+id, "GET");
				req.then(function(response){
					$scope.currentItemGeneralPrices = response; 
				}, function(error){
					utils.errorHandler(error);
				});
			}
			else {
				utils.notify("An Error Occurred", "We are unable to determine the cause of this error at the moment, please try again some other time or contact an administrator if this error persists", "error");
			}

		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.saveCurrentItemGeneralPrice = function(){
		var data = {
			billingTypeItem: $scope.billingTypeItemCurrentPrice,
			price: $scope.currentItemGeneralPrice.BillingTypeItemPrice
		};

		var req = utils.serverRequest("/accounts-biller/billing-type-items/new-general-price-structure", "PUT", data);

		req.then(function(response){
			if (response){
				utils.notify("Operation Successful", "General Price Updated For The Specified Patient Type Categories", "success");
			}
			else {
				utils.notify("An Error Occurred", "We are unable to determine the cause of this error at the moment, please try again some other time or contact an administrator if this error persists", "error");
			}

		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.manageBillingTypeItems = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				functions.manageBillingTypeItems.editBillingTypeItems(id);
				break;
			}
			case "delete":{
				functions.manageBillingTypeItems.deleteBillingTypeItems(id);
				break;
			}
			case "billingTypeItems-management":{
				functions.manageBillingTypeItems.billingTypeItemsManagement(id);
				break;
			}
			case "view":{
				$scope.billingTypeItemCurrentPrice = id;
				$scope.billingTypeItemCurrentName = $(".billing-type-items-btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.reloadBillingTypeItemsPricesTable();

				$("#view_billing_type_item_prices").modal("show");
				break;
			}
			case "deleteprice":{
				functions.manageBillingTypeItems.deleteBillingTypeItemPrice(id);
				break;
			}
			case "control":{				
				$scope.billingTypeItemCurrentPrice = id;
				$scope.billingTypeItemCurrentName = $(".billing-type-items-btn[data-option-id='"+id+"']").attr('data-option-name');
				var req = utils.serverRequest("/accounts-biller/billing-type-items/view-item-price-by-category?resourceId="+id, "GET");
				req.then(function(response){
					$scope.currentItemGeneralPrices = response; 
				}, function(error){
					utils.errorHandler(error);
				});

				var reqGeneral = utils.serverRequest("/accounts-biller/billing-type-items/view-general-item-price?resourceId="+id, "GET");
				reqGeneral.then(function(response){
					$scope.currentItemGeneralPrice = response;
				}, function(error){
					utils.errorHandler(error);
				})

				$("#control_billing_type_item_prices").modal("show");
				break;
			}
		}
	}
});
