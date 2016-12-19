angular.module("EmmetBlue")

.controller('accountsAccountingPeriodBeginningBalancesController', function($rootScope, $scope, utils){
	$scope.currentAccountingPeriod = {};
	$scope.balances = {};
	$scope.totals = {
		'R': 0.00,
		'L':0.00,
		'balanced':'success'
	};

	var loadAccounts = function(){
		var accounts = utils.serverRequest('/financial-accounts/account/view', 'GET');
		
		accounts.then(function(response){
			$scope.accounts = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	var loadAccountTypeSidesOnEquation = function(){
		var accounts = utils.serverRequest('/financial-accounts/account-type/get-sides-on-equation', 'GET');
		
		accounts.then(function(response){
			$scope.sidesOnEquation = {};
			angular.forEach(response, function(val){
				$scope.sidesOnEquation[val.TypeID] = val.SideOnEquation;
			});
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadAccounts();
	loadAccountTypeSidesOnEquation();

	$scope.$watch(function(){ return utils.storage.currentAccountingPeriod}, function(nv){
		$scope.currentAccountingPeriod = nv;
	})

	$scope.addToTotals = function(index, accountId){
		if (typeof $scope.balances[accountId] != "undefined"){
			var total = 0;
			var side = $scope.sidesOnEquation[$scope.accounts[index].TypeID];

			angular.forEach($scope.accounts, function(val, key){
				if ($scope.sidesOnEquation[val.TypeID] == side){
					if (typeof $scope.balances[val.AccountID] != "undefined"){
						total += +($scope.balances[val.AccountID].balance);
					}
				}
			})

			$scope.totals[side] = total;
			if ($scope.totals.R == $scope.totals.L){
				$scope.totals.balanced = 'success';
			}
			else {
				$scope.totals.balanced = 'danger';
			}
		}
	}

	$scope.saveBalances = function(){
		if ($scope.totals.balanced != 'success'){
			utils.alert("Trial Balance Unbalanced", "You cannot continue unless you've adjusted the account entries or post the difference to an equity account", "warning");
		}
		else {
			var data = {
				period: $scope.currentAccountingPeriod.id,
				balances: $scope.balances
			};

			utils.serverRequest("/financial-accounts/accounting-period/new-beginning-balance", "POST", data).then(function(response){
				$scope.balances = {};
				$rootScope.$broadcast("beginningBalanceCreated");
				utils.alert("Operation Successful", "Your beginning balances have been saved successfully and new books have been prepared for this period", "success");
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}
})