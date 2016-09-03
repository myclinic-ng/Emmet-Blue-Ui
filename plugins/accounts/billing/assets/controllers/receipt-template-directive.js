angular.module("EmmetBlue")

.directive('ngPaymentReceipt', function(){
	return {
		restrict: "AE",
		templateUrl: "plugins/accounts/billing/assets/includes/receipt-template.html"
	}
})