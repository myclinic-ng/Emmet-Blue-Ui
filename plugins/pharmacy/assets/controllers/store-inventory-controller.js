angular.module("EmmetBlue")

.controller('pharmacyStoreInventoryController', function($scope, utils){
	$scope.ddtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var storeInventory = utils.serverRequest('/pharmacy/store-inventory/view-by-store?resourceId='+$scope.storeID, 'GET');
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
				$("#new_inventory_item").modal("show");
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
		utils.DT.columnBuilder.newColumn(null).withTitle("Tags").renderWith(function(data, type, full){
			var string = invisible = "";
			for (var i = 0; i < data.Tags.length; i++) {
				invisible += data.Tags[i].TagTitle+":"+data.Tags[i].TagName;
				string += "<h6 class='display-block'><span class='label label-info text-muted pull-left' style='border-right:0px !important;'>"+data.Tags[i].TagTitle+"</span><span class='label label-warning pull-left' style='border-left:0px !important;'> "+data.Tags[i].TagName+"</span></h6><br/><br/>";
			}
			return "<span style='display: none'>"+invisible+"</span>"+string;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(function(data, type, full){
			var editButtonAction = "manageStore('edit', "+data.StoreID+")";
			var deleteButtonAction = "manageStore('delete', "+data.StoreID+")";
			var inventoryButtonAction = "manageStore('inventory', "+data.StoreID+")";

			var dataOpt = "data-option-id='"+data.ItemID+"' data-option-name='"+data.BillingTypeItemName+"' data-option-brand='"+data.ItemBrand+"' data-option-manufacturer='"+data.ItemManufacturer+"'";

			var editButton = "<button class='btn btn-xs btn-link' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='fa fa-edit'></i> edit </button>";
			var deleteButton = "<button class='btn btn-xs btn-link' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"><i class='fa fa-trash-o'></i> delete </button>";
			var inventoryButton = "<button class='btn btn-xs btn-link' ng-click=\""+inventoryButtonAction+"\" "+dataOpt+"><i class='fa fa-tags'></i> tags</button>";
			
			var buttons = "<div class='btn-group'>"+inventoryButton+editButton+deleteButton+"</button>";
			return buttons;
		}).notSortable()
	];

	$scope.ddtInstance = {};

	$scope.reloadInventoryTable = function(){
		$scope.ddtInstance.reloadData(null, true);
	}

	if (typeof utils.storage.inventoryStoreID != "undefined"){
		$scope.storeID = utils.storage.inventoryStoreID;
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
		tags:[],
		quantity: 0
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
			$("#new_inventory_item").modal("hide");
			$scope.reloadInventoryTable();
			$scope.newItem = {
				tags: [],
				quantity: 0
			};
		}, function(response){
			utils.errorHandler(response);
		})
	}
});