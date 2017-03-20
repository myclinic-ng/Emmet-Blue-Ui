angular.module("EmmetBlue")

.controller('pharmacyStoreManageStoresController', function($scope, utils){
	var actions = function (data, type, full, meta){
		var editButtonAction = "manageStore('edit', "+data.StoreID+")";
		var deleteButtonAction = "manageStore('delete', "+data.StoreID+")";
		var inventoryButtonAction = "manageStore('inventory', "+data.StoreID+")";

		var dataOpt = "data-option-id='"+data.StoreID+"' data-option-name='"+data.StoreName+"' data-option-description='"+data.StoreDescription+"'";

		var editButton = "<button class='btn btn-default billing-type-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='icon-pencil5'></i> </button>";
		var deleteButton = "<button class='btn btn-default billing-type-btn' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"><i class='icon-bin'></i> </button>";
		var inventoryButton = "<button class='btn btn-default' ng-click=\""+inventoryButtonAction+"\" "+dataOpt+"><i class='icon-eye'> </i> Inventory</button>";
		
		var buttons = "<div class='btn-group'>"+editButton+deleteButton+"</button>";
		return buttons;
	}
	
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var stores = utils.serverRequest('/pharmacy/store/view', 'GET');
		return stores;
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
			text: '<i class="icon-file-plus"></i> <u>N</u>ew Store',
			action: function(){
				$("#new_store").modal("show");
			},
			key: {
        		key: 'n',
        		ctrlKey: false,
        		altKey: true
        	}
		},
        {
        	extend: 'print',
        	text: '<i class="icon-printer"></i> <u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	}
        },
        {
        	extend: 'copy',
        	text: '<i class="icon-copy"></i> <u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: false,
        		altKey: true
        	}
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('StoreID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('StoreName').withTitle("Name"),
		utils.DT.columnBuilder.newColumn('StoreDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(actions)
	];

	$scope.reloadStoresTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.manageStore = function(type, id){
		switch(type){
			case "edit":{
				$scope.tempStore = {
					resourceId: id,
					storeName: $("button[data-option-id='"+id+"'").attr("data-option-name"),
					storeDescription: $("button[data-option-id='"+id+"'").attr("data-option-description")
				}
				$("#edit_store").modal("show");
				break;
			}
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to delete the store named "+$("button[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/pharmacy/store/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "The specified store has been deleted successfully", "success");
						$scope.reloadStoresTable();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
				break;
			}
			case "inventory":{
				utils.storage.inventoryStoreID = id;
				$("#store_inventory").modal({
					backdrop: "static"
				});
				break;
			}
		}
	}

	$scope.saveNewStore = function(){
		var store = $scope.newStore;

		var request = utils.serverRequest("/pharmacy/store/new", "POST", store);
		request.then(function(response){
			utils.notify("Operation Successful", "New store created successfully", "success");
			$scope.reloadStoresTable();
			$("#new_store").modal("hide");
			$scope.newStore = {};
		}, function(response){
			utils.errorHandler(response);
		})
	}

	$scope.saveEditedStore = function(){
		var store = $scope.tempStore;

		var request = utils.serverRequest("/pharmacy/store/edit", "PUT", store);
		request.then(function(response){
			utils.notify("Operation Successful", "New store updated successfully", "success");
			$scope.reloadStoresTable();
			$("#edit_store").modal("hide");
			$scope.tempStore = {};
		}, function(response){
			utils.errorHandler(response);
		})
	}
});