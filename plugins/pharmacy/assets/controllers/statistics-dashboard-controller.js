angular.module("EmmetBlue")

.controller("statisticsDashboardController", function($scope, utils){
	$scope.dtInstance = {};	
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/pharmacy/statistics/out-of-stock-items?resourceId='+$scope.storeID, 'GET');
	})
	.withOption('createdRow', function(row, data, dataIndex){
		utils.compile(angular.element(row).contents())($scope);
	})
	.withOption('order', [0, 'desc'])
	.withOption('headerCallback', function(header) {
        if (!$scope.headerCompiled) {
            $scope.headerCompiled = true;
            utils.compile(angular.element(header).contents())($scope);
        }
    })
	.withButtons([
        {
        	extend: 'print',
        	text: '<u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: true,
        		altKey: true
        	}
        },
        {
        	extend: 'copy',
        	text: '<u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: true,
        	}
        }
	]);

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('ItemID').withTitle('Item ID').notSortable(),
		utils.DT.columnBuilder.newColumn('BillingTypeItemName').withTitle('Item').notSortable(),
		utils.DT.columnBuilder.newColumn('ItemBrand').withTitle('Category').notSortable(),
		utils.DT.columnBuilder.newColumn('ItemManufacturer').withTitle('Manufacturer').notSortable()
	];

	$scope.reloadOSTable = function(){
		$scope.dtInstance.rerender();
	}

	if (typeof utils.storage.inventoryStoreID != "undefined"){
		$scope.storeID = utils.storage.inventoryStoreID;
	}

	$scope.$watch(function(){return utils.storage.inventoryStoreID}, function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			$scope.storeID = newValue;
			$scope.reloadOSTable();
		}
	});
})