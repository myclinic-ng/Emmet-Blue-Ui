angular.module("EmmetBlue")

.controller('pharmacyStoreInventoryController', function($scope, utils){
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var storeInventory = utils.serverRequest('/pharmacy/store-inventory/viewByStore?resourceId='+$scope.storeID, 'GET');
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
		utils.DT.columnBuilder.newColumn('Item').withTitle("Item Code").withOption('width', '0.5%'),
		utils.DT.columnBuilder.newColumn('BillingTypeItemName').withTitle("Item Name"),
		utils.DT.columnBuilder.newColumn('ItemQuantity').withTitle("Item Quantity"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(function(){return ""}).withOption('width', '25%').notSortable()
	];

	$scope.reloadInventoryTable = function(){
		$scope.dtInstance.reloadData();
	}
	$scope.$watch(function(){return utils.storage.inventoryStoreID}, function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			$scope.storeID = newValue;
			$scope.reloadInventoryTable();
		}
	})
});