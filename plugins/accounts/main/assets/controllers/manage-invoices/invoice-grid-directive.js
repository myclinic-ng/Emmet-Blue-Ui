angular.module("EmmetBlue")

.directive("ngInvoiceGrid", function(){
	return {
		restrict: "E",
		scope:{
			"gridData": "="
		},
		templateUrl: "plugins/accounts/main/assets/includes/manage-invoices/invoice-grid.html",
		controller: function($scope, utils){
			function reloadData(){
				var invoice = $scope.gridData;
				$scope.invoice = {};
				$scope.invoice.invoiceId = invoice.BillingTransactionMetaID;
				$scope.invoice.invoiceNumber = invoice.BillingTransactionNumber;
				$scope.invoice.invoiceAmount = invoice.BilledAmountTotal;
				$scope.invoice.invoiceAmountPaid = invoice.BillingAmountPaid;
				$scope.invoice.invoiceDate = (new Date(invoice.DateCreatedDateOnly)).toDateString();
				$scope.invoice.invoiceStatus = invoice.BillingTransactionStatus;
				$scope.invoice.invoicePatientId = invoice.PatientID;
				$scope.invoice.invoicePatientName = invoice.PatientName;
				$scope.invoice.paid = invoice._meta.status

				$scope.invoiceData = {
					type:invoice.BillingType,
					number: invoice.BillingTransactionNumber,
					createdBy: invoice.CreatedByUUID,
					status: invoice.BillingTransactionStatus,
					amount: invoice.BilledAmountTotal,
					patient: invoice.PatientID,
					totalAmount: invoice.BilledAmountTotal,
					items: invoice.BillingTransactionItems,
					paid: invoice._meta.status,
					amountPaid: invoice.BillingAmountPaid,
					department: invoice.RequestDepartmentName,
					patientInfo: {
						patientfullname: invoice.PatientName,
						patientid: invoice.PatientID,
						dategenerated: invoice.DateCreatedDateOnly
					}
				};
			}

			$scope.$watch(function(){
				return $scope.gridData;
			}, function(nv){
				reloadData();
			})

			// reloadData();
		}
	}
});