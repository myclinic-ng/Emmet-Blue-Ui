angular.module("EmmetBlue")

.directive('ngPaymentReceipt', function(){
	return {
		restrict: "AE",
		scope: {
			receiptData: "=receiptData"
		},
		templateUrl: "plugins/accounts/billing/assets/includes/receipt-template.html",
		controller: function($scope, utils){
			$scope.$watch("receiptData", function(nv){
				console.log(nv);
			})

			$scope.today = function(){
				return utils.today();
			}
		}
	}
})