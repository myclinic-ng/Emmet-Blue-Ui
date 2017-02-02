angular.module("EmmetBlue")

.directive('ngBalanceSheetReport', function(){
	return {
		restrict: "E",
		scope: {
			// invoiceData: "=invoiceData"
		},
		templateUrl: "plugins/accounts/main/assets/includes/reports/balance-sheet-template.html",
		controller: function($scope, utils){
			var req = utils.serverRequest("/financial-accounts/account/view-all-accounts-with-running-balances-group-by-type", "GET");

			req.then(function(response){
				$scope.balancesByType = response["categories"];
				$scope.periodInfo = response["period"];
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}
})