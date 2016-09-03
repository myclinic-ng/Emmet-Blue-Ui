angular.module("EmmetBlue")

.directive('ngInvoice', function(){
	return {
		restrict: "AE",
		templateUrl: "plugins/accounts/billing/assets/includes/invoice-template.html"
	}
})