angular.module("EmmetBlue")

.directive('ngBalanceSheetReport', function(){
	return {
		restrict: "E",
		scope: {
			// invoiceData: "=invoiceData"
		},
		templateUrl: "plugins/accounts/main/assets/includes/reports/balance-sheet-template.html",
		controller: function($scope, utils){
			$scope.period = 0;
			$scope.$on("reloadFinReport", function(blah, data){
				$scope.period = data.value;
			});

			$scope.$watch("period", function(d){
				var req = utils.serverRequest("/financial-accounts/account/view-all-accounts-with-running-balances-group-by-type?resourceId="+d, "GET");

				req.then(function(response){
					$scope.balancesByType = response["categories"];
					$scope.periodInfo = response["period"];
				}, function(error){
					utils.errorHandler(error);
				})
			})
		}
	}
})