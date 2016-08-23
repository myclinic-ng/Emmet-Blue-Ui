angular.module("EmmetBlue")

.controller("accountsBillingGenerateNewBillingController", function($scope, utils){
	$scope.startWatching = false;
	$scope.$watch(function(){
		return utils.storage.billingType
	}, function(newValue){
		$scope.billingType = newValue;

		if (!$scope.startWatching){
			$scope.startWatching = true;
		}
		else{
		}
	})
})