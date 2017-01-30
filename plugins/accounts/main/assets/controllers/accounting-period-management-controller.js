angular.module("EmmetBlue")

.controller('accountsAccountingPeriodsManagementController', function($scope, utils){
	$scope.dttInstance = {};
	$scope.dttOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var periods = utils.serverRequest('/financial-accounts/accounting-period/view-period-history', 'GET');
		return periods;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(50)
	.withFixedHeader()
	.withOption('createdRow', function(row, data, dataIndex){
		utils.compile(angular.element(row).contents())($scope);
	})
	.withOption('headerCallback', function(header) {
        if (!$scope.headerCompiled) {
            $scope.headerCompiled = true;
            utils.compile(angular.element(header).contents())($scope);
        }
    });	

	$scope.dttColumns = [
		utils.DT.columnBuilder.newColumn('PeriodAlias').withTitle("Period Alias"),
		utils.DT.columnBuilder.newColumn('SetBy').withTitle("Set By"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Set Date").renderWith(function(data){
			var val = (new Date(data.SetDate)).toDateString();

			return "<span>"+val+"</span>";
		}).notSortable()
	];

	$scope.reloadTable = function(){
		$scope.dttInstance.reloadData();
	}

	$scope.reload = function(){
		$scope.reloadTable();
		loadPeriods();
	}

	$scope.periods = {};
	$scope.currentPeriod = {};
	function loadPeriods(){
		utils.serverRequest("/financial-accounts/accounting-period/get-current-period", "GET").then(function(response){
			$scope.currentPeriod = response;
		}, function(error){
			utils.errorHandler(error);
		});

		var req = utils.serverRequest("/financial-accounts/accounting-period/view-alias", "GET");

		req.then(function(response){
			$scope.periods = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	loadPeriods();

	$scope.setDefaultPeriod = function(){
		if (typeof $scope.tempHolder !== "undefined"){
			var title = "Please Confirm";
			var text = "Do you really want to change the current default accounting period?"
			var close = true;
			var type = "warning";
			var btnText = "Yes, please continue";

			var process = function(){
				var data = $scope.tempHolder;

				data.staffId = utils.userSession.getID();

				var req = utils.serverRequest("/financial-accounts/accounting-period/set-current-period", "POST", data);
				req.then(function(response){
					utils.alert("Operation Successful", "The selected accounting period has been set as the current period", "success");
					$scope.reload();
				}, function(error){
					utils.errorHandler(error);
				});
			}

			utils.confirm(title, text, close, process, type, btnText);
		}
	}
});
