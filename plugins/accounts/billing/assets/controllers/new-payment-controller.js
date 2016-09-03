angular.module("EmmetBlue")

.controller("accountsBillingNewPaymentController", function($scope, utils){
	$scope.invoices = {};
	var transactionStatus = utils.serverRequest('/accounts-biller/transaction-status/view?resourceId=0&0=StatusName', 'GET');
	transactionStatus.then(function(response){
		$scope.statuses = response;
	}, function(response){
		utils.errorHandler(response);	
	})

	var paymentMethod = utils.serverRequest('/accounts-biller/payment-method/view', 'GET');
	paymentMethod.then(function(response){
		$scope.paymentMethods = response;
	}, function (responseObject){
		utils.errorHandler(responseObject);
	});
	
	function loadInvoices(){
		var invoiceRequest = utils.serverRequest("/accounts-biller/transaction-meta/view?resourceId=0&0=BillingTransactionNumber&1=BillingTransactionMetaID", "GET");
		invoiceRequest.then(function(response){
			$scope.invoices = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}

	$(".reload_invoices").on("click", function(e){
		e.preventDefault();
		loadInvoices();
	});

	$scope.saveTransaction = function(printReceipt = false){
		var newPayment = $scope.newPayment;

		var request = utils.serverRequest("/accounts-biller/transaction/new", "POST", newPayment);
		request.then(function(response){
			$scope.newPayment = {};
			if (printReceipt){
				$scope.printReceipt()
			}
			else {
				$("#payment_receipt").modal("show");
			}
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	$scope.printReceipt = function(){
		var receipt = $("#main_payment_receipt").html();
		$("#transaction_document_area").prepend(receipt);
	}
})