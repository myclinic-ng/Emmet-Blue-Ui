angular.module("EmmetBlue")

.directive('ngInvoice', function(){
	return {
		restrict: "E",
		templateUrl: "plugins/accounts/billing/assets/includes/invoice-template.html",
		controller: function($scope, utils){
			$scope.$watch(function(){
				return utils.storage.invoiceData;
			}, function(newValue){
				$scope.invoiceData = newValue;
			})
		}
	}
})