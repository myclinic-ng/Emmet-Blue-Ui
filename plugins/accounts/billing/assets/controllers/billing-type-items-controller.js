angular.module("EmmetBlue")

.controller('accountsBillingBillingTypeItemsController', function($scope, utils){
	$scope.startWatching = false;
	$scope.$watch(function(){
		return utils.storage.billingTypeItemsData
	}, function(newValue){
		console.log(newValue);
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
		$scope.loadPatientTypes(newValue);
	});

	var functions = {
		actionMarkups: {
			billingTypeItemsActionMarkup: function (data, type, full, meta){
				var editButtonAction = "manageBillingTypeItems('edit', "+data.BillingTypeItemID+")";
				var deleteButtonAction = "manageBillingTypeItems('delete', "+data.BillingTypeItemID+")";

				var dataOpt = "data-option-id='"+data.BillingTypeItemID+"' data-option-name='"+data.BillingTypeItemName+"' data-option-price='"+data.BillingTypeItemPrice+"' data-option-rate='"+data.RateIdentifier+"'";
				
				var editButton = "<button class='btn btn-default billing-type-items-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
				var deleteButton = "<button class='btn btn-default billing-type-items-btn' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";
				var viewButton = "<button class='btn btn-default billing-type-items-btn'> <i class='fa fa-eye'></i></button>";

				var buttons = "<div class='btn-group'>"+viewButton+editButton+deleteButton+"</button>";
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
			editBillingTypeItems: function(id){
				$scope.tempHolder.name = $(".billing-type-items-btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.price = parseInt($(".billing-type-items-btn[data-option-id='"+id+"']").attr('data-option-price'));
				$scope.tempHolder.rate = $(".billing-type-items-btn[data-option-id='"+id+"']").attr('data-option-rate');
				$scope.tempHolder.id = id;

				$("#edit_billing_type_items").modal("show");
			},
			deleteBillingTypeItems: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete the BillingTypeItems named "+$(".billing-type-items-btn[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
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
	.withButtons([
		{
			text: '<i class="icon-file-plus"></i> New Item',
			action: function(){
				functions.manageBillingTypeItems.newBillingTypeItems();
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
		$scope.ddtInstance.reloadData();
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

	$scope.saveEditBillingTypeItems = function(){
		var editBillingTypeItems = $scope.tempHolder;

		var data = {
			billingTypeItemName:editBillingTypeItems.name,
			billingTypeItemPrice:""+editBillingTypeItems.price,
			resourceId:editBillingTypeItems.id
		};

		if (editBillingTypeItems.rate == "" || typeof editBillingTypeItems.rate == 'undefined'){
			data['rateBased'] = 0;
		}

		var saveEdits = utils.serverRequest('/accounts-biller/billing-type-items/edit', 'PUT', data);
		saveEdits.then(function(response){
			functions.billingTypeItemsEdited();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})

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
		}
	}
});
