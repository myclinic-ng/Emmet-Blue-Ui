angular.module("EmmetBlue")

.controller("accountsBillingMenuController", function($scope, utils){
	$scope.paymentBreakdown = [];
	var today = new Date();
	$scope.walletTitle = "";
	$scope.dateRanges = today.toLocaleDateString() + " - " + today.toLocaleDateString();
	$scope.loadWallet = function(){
		if (typeof (utils.userSession.getID()) !== "undefined"){
			var splits = $scope.dateRanges.split(" - ");
			var requestData = utils.serverRequest("/accounts-biller/transaction/get-payment-breakdown-by-staff?"+utils.serializeParams({
				resourceId: utils.userSession.getID(),
				startdate: splits[0],
				enddate: splits[1]
			}), "GET");
			requestData.then(function(response){
				$scope.paymentBreakdown = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			});
		}
	}

	$scope.getTitle = function(){
		var splits = $scope.dateRanges.split(" - ");
		if (splits[0] == splits[1]){
			$scope.walletTitle = (new Date(splits[0])).toDateString();
		}
		else {
			$scope.walletTitle = $scope.dateRanges;
		}
	}

	$scope.$watch(function(){
		return $scope.dateRanges
	}, function(nv){
		$scope.getTitle();
		$scope.loadWallet();
	})
})