angular.module("EmmetBlue")

.controller("accountsBillingNewPaymentController", function($scope, utils){
	$scope.invoices = {};
	$scope.newPayment = {};
	$scope.invoiceData = {};

	$scope.$watch(function(){
		return utils.storage.currentInvoiceNumber;
	}, function(nv){
		$("#newPayment-metaId").val(nv);
		$scope.loadInvoice();
		$scope.newPayment.metaId = nv;
	});
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
	
	$(".invoice-search").typeahead({
        hint: true,
        highlight: true
    },
    {
    	source: function(query, process){
    		var invoiceRequest = utils.serverRequest("/accounts-biller/transaction-meta/search?query="+query+"&from=0&size=20", "GET");
			invoiceRequest.then(function(response){
				var data = [];
        		angular.forEach(response.hits.hits, function(value){
        			if (value["_source"].status != "deleted"){
        				data.push(value["_source"].billingtransactionnumber);
        			}
        		})

        		data = $.map(data, function (string) { return { value: string }; });
		        process(data);
			}, function(responseObject){
				utils.errorHandler(responseObject);
			});
    	}
    })

	$scope.saveTransaction = function(printReceipt){
		if (typeof(printReceipt) === 'undefined') {
			printReceipt = false;
		}
		var newPayment = $scope.newPayment;
		$scope.receiptData = newPayment;
		$scope.receiptData.invoiceData = $scope.invoiceData;
		var request = utils.serverRequest("/accounts-biller/transaction/new", "POST", newPayment);
		request.then(function(response){
			$('.loader').removeClass('show');
			$scope.newPayment = {};
			$scope.showReceipt();
		}, function(responseObject){
			$('.loader').removeClass('show');
			utils.errorHandler(responseObject);
		})
	}

	$scope.showReceipt = function(){
		$("#payment_receipt").modal("show");
	}

	$scope.loadInvoice = function(){
		if ($("#newPayment-metaId").val() !== "undefined"){
			var id = $("#newPayment-metaId").val();
			utils.serverRequest("/accounts-biller/transaction-meta/view-by-number?resourceId="+id, "GET")
			.then(function(response){
				if (typeof response[0] !== "undefined"){
					response = response[0];
					for (var i = 0; i < response.BillingTransactionItems.length; i++){
						response.BillingTransactionItems[i].itemName = response.BillingTransactionItems[i].BillingTransactionItemName;
						response.BillingTransactionItems[i].itemPrice = response.BillingTransactionItems[i].BillingTransactionItemPrice;
						response.BillingTransactionItems[i].itemQuantity = response.BillingTransactionItems[i].BillingTransactionItemQuantity;
					}

					$scope.invoiceData = {
						type:response.BillingType,
						number: response.BillingTransactionNumber,
						createdBy: response.CreatedByUUID,
						status: response.BillingTransactionStatus,
						amount: response.BilledAmountTotal,
						patient: response.PatientID,
						totalAmount: response.BilledAmountTotal,
						items: response.BillingTransactionItems
					};

					utils.serverRequest("/accounts-biller/get-item-price/apply-payment-rule?resourceId="+response.PatientID+"&amount="+response.BilledAmountTotal, "GET")
					.then(function(response){
						$scope.newPayment.amountPaid = response.amount;
						$scope.invoiceData.amount = response.amount;
					});

					$scope.newPayment.metaId = response.BillingTransactionMetaID;
				}
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}
})