angular.module("EmmetBlue")

.controller('accountsMainAccountRunningBalanceController', function($scope, utils){
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var periods = utils.serverRequest('/financial-accounts/account/view-all-accounts-with-running-balances', 'GET');
		return periods;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(50)
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
        	extend: 'print',
        	text: '<i class="icon-printer"></i> <u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	},
        	exportOptions:{
        		columns: [0, 1, 2, 3]
        	}
        },
        {
        	extend: 'copy',
        	text: '<i class="icon-copy"></i> <u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: false,
        		altKey: true
        	},
        	exportOptions:{
        		columns: [0, 1, 2, 3]
        	},
        	exportData: {
        		decodeEntities: true
        	}
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('AccountID').withTitle("Account Code"),
		utils.DT.columnBuilder.newColumn('AccountName').withTitle("Account Name"),
		utils.DT.columnBuilder.newColumn('TypeName').withTitle("Account Type"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Running Balance").renderWith(function(data){
			var val = data.Balance.value;
			var res = "";
			if (val >= 0){
				res = "<span class='text-bold'>"+val+"</span>";
			}
			else {
				res = "<span class='text-bold text-danger'>("+val+")</span>";
			}

			return "<span ng-currency ng-currency-symbol='naira'></span> "+res;
		})
	];

	$scope.reloadTable = function(){
		if (typeof $scope.dtInstance.reloadData == 'function'){
			$scope.dtInstance.reloadData();
		}
	}

	$scope.$on("load-running-balances", function(){
		$scope.reloadTable();
	})
});
