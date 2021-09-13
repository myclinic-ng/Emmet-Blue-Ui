angular.module("EmmetBlue")

.controller("salesPulseDashboardController", function($scope, utils){
	$scope.stockValuesMeta = {};
	$scope.getDateRange = function(selector){
		var today = new Date();
		var _day = today.getDate();
		var _month = today.getMonth() + 1;
		var _year = today.getFullYear();
		switch(selector){
			case "today":{
				return (_month+"/"+_day+"/"+_year) + " - " + (_month+"/"+_day+"/"+_year);
			}
			case "yesterday":{
				var yesterday = new Date(new Date(new Date()).setDate(new Date().getDate() - 1)).toLocaleDateString();
				return yesterday + " - " + yesterday;
				break;
			}
			case "week":{
				var d = new Date(today);
			  	var day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1);

			  	return new Date(d.setDate(diff)).toLocaleDateString() + " - " + today.toLocaleDateString();
			  	break;
			}
			case "month":{
				var year = today.getFullYear();
				var month = today.getMonth() + 1;

				return month+'/1/'+year + ' - ' + today.toLocaleDateString();
				break;
			}
		}
	}

	$scope.requestFilter = {
		type: 'date',
		description: 'Today\'s Request',
		value: $scope.getDateRange("today")
	}

	$("option[status='disabled']").attr("disabled", "disabled");
	$scope.toDateString = function(date){
		return (new Date(date)).toLocaleDateString();
	}

	$scope.activateFilter = function(){
		var selector = $scope.filterSelector;
		switch(selector.type){
			case "dateRange":{
				$scope.requestFilter.type = "date";
				var value = selector.value.split(" - ");
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Date Ranges Between: "+ new Date(value[0]).toDateString()+" And "+ new Date(value[1]).toDateString();
				$scope.reloadOSTable();
				break;
			}
			default:{
				$scope.requestFilter.type = "date";
				var value = selector.type.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = value[0];
				$scope.reloadOSTable();
			}
		}
	}

	$scope.dtInstance = {};	
	$scope.dtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
		var dates = ($scope.requestFilter).value.split(" - ");
		var requests = utils.serverRequest('/pharmacy/statistics/sales-values?startdate='+dates[0]+'&enddate='+dates[1], 'GET');
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
		utils.DT.columnBuilder.newColumn('TotalQuantity').withTitle('Quantity'),
		utils.DT.columnBuilder.newColumn('TotalCost').withTitle('Cost Price'),
		utils.DT.columnBuilder.newColumn('TotalSales').withTitle('Sales Price'),
		utils.DT.columnBuilder.newColumn('TotalProfit').withTitle('Profit'),
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