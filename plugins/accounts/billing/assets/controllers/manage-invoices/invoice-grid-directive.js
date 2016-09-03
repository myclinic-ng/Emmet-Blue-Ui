angular.module("EmmetBlue")

.directive("ngInvoiceGrid", function(){
	return {
		restrict: "E",
		scope:{
			"gridData": "="
		},
		templateUrl: "plugins/accounts/billing/assets/includes/manage-invoices/invoice-grid.html",
		controller: function($scope, utils){
			var invoice = $scope.gridData;
			$scope.invoice = {};
			$scope.invoice.invoiceId = invoice.BillingTransactionMetaID;
			$scope.invoice.invoiceNumber = invoice.BillingTransactionNumber;
			$scope.invoice.invoiceAmount = invoice.BilledAmountTotal;
			$scope.invoice.invoiceDate = invoice.DateCreatedDateOnly;
			$scope.invoice.invoiceStatus = invoice.BillingTransactionStatus;
			$scope.invoice.invoicePatientId = invoice.PatientID;
			$scope.invoice.invoicePatientName = invoice.PatientName;
		}
	}
});