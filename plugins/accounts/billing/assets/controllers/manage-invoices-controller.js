angular.module("EmmetBlue")

.controller("accountsBillingManageInvoicesController", function($scope, utils){
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/accounts/billing/assets/includes/";
		switch(segment){
			case "new-invoice":{
				$scope.pageSegment = urlPart+"invoice.html";
				break;
			}
			case "view-archive":{
				$scope.pageSegment = urlPart+"manage-invoices/view-invoices.html";
				break;
			}
			case "view-statistics":{
				$scope.pageSegment = urlPart+"manage-invoices/view-statistics.html";
				break;
			}
			case "load-settings":{
				$scope.pageSegment = urlPart+"manage-invoices/settings.html";
				break;
			}
		}
	}
})