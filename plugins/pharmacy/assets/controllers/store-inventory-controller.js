angular.module("EmmetBlue")

.controller('pharmacyStoreInventoryController', function($scope, utils){
	$scope.ddtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var storeInventory = utils.serverRequest('/pharmacy/store-inventory/view-by-store?resourceId='+$scope.storeID
		, 'GET');
		return storeInventory;
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
			text: '<i class="icon-file-plus"></i> <u>N</u>ew Item',
			action: function(){
				$("#new_store_inventory").modal("show");
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

	$scope.ddtColumns = [
		utils.DT.columnBuilder.newColumn('Item').withTitle("Item Code").withOption('width', '0.5%'),
		utils.DT.columnBuilder.newColumn('BillingTypeItemName').withTitle("Item Name"),
		utils.DT.columnBuilder.newColumn('ItemBrand').withTitle("Item Brand"),
		utils.DT.columnBuilder.newColumn('ItemManufacturer').withTitle("Item Manufacturer"),
		utils.DT.columnBuilder.newColumn('ItemQuantity').withTitle("Item Quantity"),
		utils.DT.columnBuilder.newColumn(null).withTitle("").renderWith(function(data, type, full){
			var string = "";
			for (var i = 0; i < data.length; i++) {
				string += data[i].TagTitle+":"+data[i].TagName;
			}
			return string;
		}).notVisible(),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(function(data, type, full){return ""}).withOption('width', '25%').notSortable()
	];

	$scope.ddtInstance = {};

	$scope.reloadInventoryTable = function(){
		$scope.ddtInstance.reloadData(null, true);
	}
	$scope.$watch(function(){return utils.storage.inventoryStoreID}, function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			$scope.storeID = newValue;
			$scope.reloadInventoryTable();
		}
	});

	function loadInventoryItems(staff){
		var request = utils.serverRequest("/accounts-biller/billing-type-items/view-by-staff-uuid?resourceId=0&uuid="+staff, "GET");

		request.then(function(response){
			$scope.inventoryItems = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadInventoryItems(utils.userSession.getUUID());

	$scope.newItem = {
		tags:[]
	}
	
	$scope.itemTag = {
	};

	$scope.addTagToList = function(){
		$scope.newItem.tags.push($scope.itemTag);
		$scope.itemTag = {};
	}

	$scope.saveNewItem = function(){
		var store = {
			tags: $scope.newItem.tags,
			store: $scope.storeID,
			item: $scope.newItem.name,
			brand: $scope.newItem.brand,
			manufacturer: $scope.newItem.manufacturer,
			quantity: $scope.newItem.quantity
		};

		var request = utils.serverRequest("/pharmacy/store-inventory/new", "POST", store);
		request.then(function(response){
			utils.notify("Operation Successful", "New invetory item created successfully", "success");
			$("#new_store_inventory").modal("hide");
			$scope.reloadInventoryTable();
			$scope.newItem = {};
		}, function(response){
			utils.errorHandler(response);
		})
	}
});