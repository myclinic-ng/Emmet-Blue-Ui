angular.module("EmmetBlue")

.controller("accountsBillingManageInvoicesViewInvoicesController", function($scope, utils){
	// GLOBALS
	$scope.transactionStatuses = {};
	$scope.invoices = {};

	var statusesRequest = utils.serverRequest("/accounts-biller/transaction-status/view", "GET");
	statusesRequest.then(function(response){
		$scope.transactionStatuses = response;
	}, function(responseObject){
		utils.errorHandler(responseObject);
	});

	function loadInvoices(){
		var sendInvoicesRequest = utils.serverRequest("/accounts-biller/transaction-meta/view", "GET");

		sendInvoicesRequest.then(function(response){
			$scope.invoices = response;
		}, function(response){
			utils.errorHandler(response);
		})
	}

	loadInvoices();
})