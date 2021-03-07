angular.module("EmmetBlue")

.controller("accountsBillingNewPaymentController", function($scope, utils){
	$scope.invoices = {};
	$scope.newPayment = {};
	$scope.invoiceData = {};

	$scope.clearInvoiceStorage = function(){
		delete utils.storage.currentInvoiceNumber;
	}

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
				// utils.errorHandler(responseObject);
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
		newPayment.staff = utils.userSession.getID();
		var request = utils.serverRequest("/accounts-biller/transaction/new", "POST", newPayment);
		request.then(function(response){
			if (typeof response[0] !== "undefined"){
				$scope.receiptData.transactionId = response[0].BillingTransactionID;
			}

			$('.loader').removeClass('show');
			var method = $scope.invoiceData.paymentMethod;
			var status = $scope.invoiceData.transactionStatus;
			$scope.newPayment = {
				transactionStatus: status,
				paymentMethod: method
			};
			$scope.newPayment = {};
			$scope.clearInvoiceStorage();
			$scope.showReceipt();
		}, function(responseObject){
			$('.loader').removeClass('show');
			utils.errorHandler(responseObject);
		})
	}

	$scope.processPayment = function(){
		if ($scope.newPayment.billFromDepositAccount){
			var data = {
				patient: $scope.invoiceData.patient,
				staff: utils.userSession.getID(),
				amount: -1 * $scope.newPayment.amountPaid,
				comment: "Tx. Invoice #: "+$scope.invoiceData.number
			}

			var req = utils.serverRequest("/accounts-biller/deposit-account/new-transaction", "POST", data);

			req.then(function(response){
				if (response){
					$scope.saveTransaction();
				}
				else {
					utils.notify("Unable to complete transaction", "This is usally due to insufficient balance in the deposit account", "error");
				}
			})
		}
		else {
			$scope.saveTransaction();
		}
	}

	$scope.showReceipt = function(){
		$scope.invoiceData = {
		};

		$("#accept_new_payment").modal("hide");
		$("#payment_receipt").modal("show");

		var form = $("#main_payment_receipt").get(0);
		domtoimage.toPng(form)
	    .then(function (dataUrl) {
	        var img = new Image();

	        var req = utils.serverRequest("/emmetblue-cloud/receipt/upload", "POST", {
	        	patient: $scope.receiptData.invoiceData.patient,
	        	description: "Invoice No.: #"+$scope.receiptData.transactionId,
				staff: utils.userSession.getID(),
				receipt: dataUrl
	        });

	        req.then(function(response){

	        }, function(error){

	        });
	    })
	    .catch(function (error) {
	        console.error('oops, something went wrong!', error);
	    });
	}

	$scope.loadInvoice = function(){
		if ($("#newPayment-metaId").val() !== "undefined" && $("#newPayment-metaId").val() !== ""){
			var id = $("#newPayment-metaId").val();
			utils.serverRequest("/accounts-biller/transaction-meta/view-by-number?resourceId="+id, "GET")
			.then(function(response){
				if (typeof response[0] !== "undefined"){
					response = response[0];
					var items = [];
					var amounts = {};
					for (var i = 0; i < response.BillingTransactionItems.length; i++){
						response.BillingTransactionItems[i].itemName = response.BillingTransactionItems[i].BillingTypeItemName;
						response.BillingTransactionItems[i].itemPrice = response.BillingTransactionItems[i].BillingTransactionItemPrice;
						response.BillingTransactionItems[i].itemQuantity = response.BillingTransactionItems[i].BillingTransactionItemQuantity;
						items.push(response.BillingTransactionItems[i].BillingTransactionItem);
						amounts[response.BillingTransactionItems[i].BillingTransactionItem] = response.BillingTransactionItems[i].BillingTransactionItemPrice;
					}

					$scope.invoiceData = {
						type:response.BillingType,
						number: response.BillingTransactionNumber,
						createdBy: response.CreatedByUUID,
						status: response.BillingTransactionStatus,
						amount: response.BilledAmountTotal,
						patient: response.PatientID,
						totalAmount: response.BilledAmountTotal,
						items: response.BillingTransactionItems,
						paid: response._meta.status,
						amountPaid: response.BillingAmountPaid,
						department: response.RequestDepartmentName
					};

					var paymentRuleData = {
						resourceId: response.PatientID,
						amounts: amounts,
						items: items
					};

					utils.serverRequest("/accounts-biller/get-item-price/apply-payment-rule", "POST", paymentRuleData)
					.then(function(response){
						$scope.newPayment.amountPaid = response._meta.amount;
						$scope.invoiceData.amount = response._meta.amount;
					});

					utils.serverRequest('/accounts-biller/deposit-account/view-account-info?resourceId='+response.PatientID, "GET")
					.then(function(response){
						if (typeof response.AccountID !== "undefined"){
							$scope.invoiceData.depositAccount = response;
						}
						else {
							$scope.invoiceData.depositAccount = {
								AccountID: "N/A",
								AccountBalance: -1
							}
						}
					})

					$scope.newPayment.metaId = response.BillingTransactionMetaID;
				}
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}

	$scope.saveReceipt = function(){
		var receipt = $("#main_payment_receipt").get(0);
		
		$("#payment_receipt").modal("hide");
		domtoimage.toPng(receipt)
	    .then(function (dataUrl) {
			var data = {
				patient: $scope.receiptData.invoiceData.patient,
				receipt: dataUrl,
				transaction: $scope.receiptData.transactionId,
				staff: utils.userSession.getID()
			}

	        var req = utils.serverRequest("/accounts-biller/payment-receipt/new", "POST", data);
	        req.then(function(response){
	        }, function(error){
	        	utils.errorHandler(error);
	        });
	    })
	    .catch(function (error) {
	        console.error('oops, something went wrong!', error);
	    });
	}
})