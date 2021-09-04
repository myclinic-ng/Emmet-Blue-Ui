angular.module("EmmetBlue")

.controller("stockValueDashboardController", function($scope, utils){
	$scope.stockValuesMeta = {};
	$scope.dtInstance = {};	
	$scope.dtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
		var requests = utils.serverRequest('/pharmacy/statistics/stock-values?resourceId='+$scope.storeID, 'GET');
		requests.then(function(response){
			$scope.stockValuesMeta = response.meta;
			var records = {
				data: response.stockValues,
				draw: data[0].value,
				recordsTotal: response.total,
				recordsFiltered: response.filtered
			};

			callback(records);
		}, function(error){
			utils.errorHandler(error);
		});
	})	
	.withDataProp('data')
	.withOption('processing', true)
	.withOption('serverSide', true)
	.withOption('paging', true)
	.withOption('createdRow', function(row, data, dataIndex){
		utils.compile(angular.element(row).contents())($scope);
	})
	// .withOption('order', [0, 'desc'])
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
		utils.DT.columnBuilder.newColumn('BillingTypeItemID').withTitle('ID'),
		utils.DT.columnBuilder.newColumn('BillingTypeItemName').withTitle('Item'),
		utils.DT.columnBuilder.newColumn('ItemQuantity').withTitle('Quantity'),
		utils.DT.columnBuilder.newColumn('ItemCostPrice').withTitle('Cost Price'),
		utils.DT.columnBuilder.newColumn('BillingTypeItemPrice').withTitle('Sales Price'),
		utils.DT.columnBuilder.newColumn('StockValueCost').withTitle('Stock Value'),
		utils.DT.columnBuilder.newColumn('ProfitMargin').withTitle('Profit'),
		// utils.DT.columnBuilder.newColumn(null).withTitle("Profit Margin").renderWith(function(data, full, meta){
		// 	var profitMargin = data.ProfitMargin;
		// 	var ratioToProfit = data.RatioToProfit;

		// 	var val ='<span class="">'+profitMargin+' (<span class="text-muted" title="Ratio to total profit"> '+ratioToProfit+'%</span> )</span>';

		// 	return val;
		// })
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