angular.module("EmmetBlue")

.controller("accountsBillingMenuController", function($scope, utils){
	var billingTypes = utils.serverRequest('/accounts-biller/billing-type/view', 'GET');
	
	billingTypes.then(function(response){
		$scope.billingItems = response;
	}, function(response){
		utils.errorHandler(response);
	});

	$scope.alert = function(id){
		utils.alert(id);
	}
})