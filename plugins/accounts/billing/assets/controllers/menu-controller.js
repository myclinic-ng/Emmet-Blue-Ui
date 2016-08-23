angular.module("EmmetBlue")

.controller("accountsBillingMenuController", function($scope, utils){
	var billingTypes = utils.serverRequest('/accounts-biller/billing-type/view', 'GET');
	
	billingTypes.then(function(response){
		$scope.billingItems = [];
		angular.forEach(response, function(value, key){
			$scope.billingItems.push(value.BillingTypeName);
		})
	}, function(response){
		utils.errorHandler(response);
	});
})