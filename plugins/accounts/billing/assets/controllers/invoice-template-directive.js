angular.module("EmmetBlue")

.directive('ngInvoice', function(){
	return {
		restrict: "E",
		templateUrl: "plugins/accounts/billing/assets/includes/invoice-template.html",
		controller: function($scope, utils){
			$scope.$watch(function(){
				return utils.storage.invoiceData;
			}, function(newValue){
				console.log($scope.invoiceData);
				$scope.invoiceData = newValue;
			})
		}
	}
})