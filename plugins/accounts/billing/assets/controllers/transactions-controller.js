angular.module("EmmetBlue")

.controller("accountsBillingTransactionsController", function($scope, utils){
	$scope.pageSegment = "";
	$scope.segmentTitle = "Transactions";
	$scope.dateRange = (new Date()).toLocaleDateString()+ " - " +(new Date()).toLocaleDateString();
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/accounts/billing/assets/includes/transactions/";
		switch(segment){
			case "receipts":{
				$scope.pageSegment = urlPart+"receipts.html";
				$scope.segmentTitle = "Payment Receipts";
				break;
			}
			case "part-payments":{
				$scope.pageSegment = urlPart+"part-payments.html";
				$scope.segmentTitle = "Part Payments";
				break;
			}
		}
	}

	$scope.loadPageSegment('receipts');

	$scope.$watch("dateRange", function(value){
		var dates = value.split(" - ");
		utils.storage.currentReportDateRange = dates;
	})
})