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

	var functions = {
		actionMarkups: {
			billingTypeItemsActionMarkup: function (data, type, full, meta){
				var editButtonAction = "manageBillingTypeItems('edit', "+data.BillingTypeItemsID+")";
				var deleteButtonAction = "manageBillingTypeItems('delete', "+data.BillingTypeItemsID+")";

				var dataOpt = "data-option-id='"+data.BillingTypeItemsID+"' data-option-name='"+data.Name+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";
				var viewButton = "<button class='btn btn-default'> <i class='fa fa-eye'></i></button>";

				var buttons = "<div class='btn-group'>"+viewButton+editButton+deleteButton+"</button>";
				return buttons;
			}
		},
		newBillingTypeItemsCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new billingTypeItems", "success", "notify");
			$scope.newBillingTypeItems = {};
			$("#new_billingTypeItems").modal("hide");

			$scope.reloadBillingTypeItemsTable();
		},
		billingTypeItemsEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$("#edit_billingTypeItems").modal("hide");

			$scope.reloadBillingTypeItemsTable();
		},
		billingTypeItemsDeleted: function(){
			utils.alert("Operation Successful", "The selected billingTypeItems has been deleted successfully", "success", "notify");
			delete  $scope._id;

			$scope.reloadBillingTypeItemsTable();
		},
		manageBillingTypeItems: {
			newBillingTypeItems: function(){
				$("#new_billing_type_items").modal("show");
			},
			editBillingTypeItems: function(id){
				$scope.tempHolder.name = $(".btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.id = id;

				$("#edit_billingTypeItems").modal("show");
			},
			deleteBillingTypeItems: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete the BillingTypeItems named "+$(".btn[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/human-resources/BillingTypeItems/delete?'+utils.serializeParams({
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

	$scope.ddtInstance = {};

	$scope.ddtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var billingTypeItemss = utils.serverRequest('/accounts-biller/billing-type-items/view?resourceId='+$scope.department, 'GET');
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
			text: 'New Item',
			action: function(){
				functions.manageBillingTypeItems.newBillingTypeItems();
			}
		}
	]);	

	$scope.ddtColumns = [
		utils.DT.columnBuilder.newColumn('BillingTypeItemsID').withTitle("ID").withOption('width', '0.5%').notSortable(),
		utils.DT.columnBuilder.newColumn('Name').withTitle("BillingTypeItems"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.billingTypeItemsActionMarkup).withOption('width', '25%').notSortable()
	];

	$scope.reloadBillingTypeItemsTable = function(){
		$scope.ddtInstance.reloadData();
	}

	$scope.saveNewBillingTypeItems = function(){
		var newBillingTypeItems = $scope.newBillingTypeItems;

		var data = {
			billingTypeItemName:newBillingTypeItems.name,
			billingTypeItemPrice:""+newBillingTypeItems.price
		};

		if (newBillingTypeItems.rate == "" || typeof newBillingTypeItems.rate == 'undefined'){
			data['rateBased'] = 0;
		}
		else
		{
			data['rateBased'] = 1;
			data['rateIdentifier'] = newBillingTypeItems.rate;
		}
		console.log(data);
		var saveNewBillingTypeItems = utils.serverRequest('/accounts-biller/billing-type-items/new', 'POST', data);

		saveNewBillingTypeItems.then(function(response){
			functions.newBillingTypeItemsCreated();
		}, function(response){
			utils.errorHandler(response);
		});
	}

	$scope.saveEditBillingTypeItems = function(){
		var edits = {
			resourceId: $scope.tempHolder.id,
			Name: $scope.tempHolder.name
		}

		var saveEdits = utils.serverRequest('/accounts-biller/billing-type-items/edit', 'PUT', edits);
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
