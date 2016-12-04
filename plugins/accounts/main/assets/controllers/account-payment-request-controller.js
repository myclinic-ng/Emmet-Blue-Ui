angular.module("EmmetBlue")
.controller("accountPaymentRequestController", function($scope, utils, patientEventLogger){
	var functions = {
	actionsMarkUp: function(meta, full, data){
		var deleteButtonAction = "functions.managePaymentRequest.deletePaymentRequest("+data.PaymentRequestID+")";
		var makePaymentButtonAction = "functions.managePaymentRequest.requestPaymentBill("+data.PaymentRequestID+")";
		
		var options = 
			" data-option-id='"+data.PaymentRequestID+
			"' data-option-payment-request-uuid='"+data.PaymentRequestUUID+
			"' data-option-patient-uuid='"+data.PatientUUID+
			"' data-option-patient-id='"+data.RequestPatientID+
			"' data-option-patient-fullname='"+data.PatientFullName+
			"' data-option-patient-type='"+data.PatientType+
			"' data-option-staff-id='"+data.RequestBy+
			"' data-option-request-date='"+data.RequestDate+
			"' data-option-fulfillment-status='"+data.RequestFulfillmentStatus+
			"' data-option-fulfilled-date='"+data.RequestFulFilledDate+
			"' data-option-fulfilled-by='"+data.RequestFulfilledBy+
			"' data-option-department-name='"+data.GroupName+
			"' data-option-sub-dept-name='"+data.Name+
			"' data-option-patient-category-name='"+data.PatientCategoryName+
			"' data-option-patient-type-name='"+data.PatientTypeName+
			"' ";
		var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+options+"><i class='icon-bin'></i> </button>";
		var makePaymentButton = "<button class='btn btn-default' ng-click=\""+makePaymentButtonAction+"\" "+options+">Process Request</button>"
		var buttons = "<div class='btn-group'>"+makePaymentButton+deleteButton+"</button>";

		return buttons;
	},
	managePaymentRequest:{
		newAccountPaymentRequest: function(){
		$("#new_account_payment_request").modal("show");
		},
		paymentAccepted:function(){
			utils.alert("Operation Successful", "The selected Payment Request has been Accepted successfully", "success", "notify");
				$scope.dtInstance.reloadData();
		},
		paymentRequestDeleted:function(){
			utils.alert("Operation Successful", "The selected Payment Request has been deleted successfully", "success", "notify");
				$scope.dtInstance.reloadData();
		},
		verifyPaymentRequestForm:function(){
			$('#verify_payment').modal('show');
		},
		requestPaymentBill: function(id){
			//$('.loader').addClass('show');
			//console.log(id)
			$scope.temp = {
				requestId:id,
				requestNumber:$(".btn[data-option-id='"+id+"']").attr("data-option-payment-request-uuid"),
				staffUUID: $(".btn[data-option-id='"+id+"']").attr("data-option-staff-id"),
				patientUUID: $(".btn[data-option-id='"+id+"']").attr("data-option-patient-uuid"),
				patientID:$(".btn[data-option-id='"+id+"']").attr("data-option-patient-id"),
				patientFullName: $(".btn[data-option-id='"+id+"']").attr("data-option-patient-fullname"),
				patientType: $(".btn[data-option-id='"+id+"']").attr("data-option-patient-type"),
				patientCategoryName: $(".btn[data-option-id='"+id+"']").attr("data-option-patient-category-name"),
				patientTypeName: $(".btn[data-option-id='"+id+"']").attr("data-option-patient-type-name"),
				requestDate: $(".btn[data-option-id='"+id+"']").attr("data-option-request-date"),
				fulfillmentStatus: $(".btn[data-option-id='"+id+"']").attr("data-option-fulfillment-status"),
				fulfilledDate: $(".btn[data-option-id='"+id+"']").attr("data-option-fulfilled-date"),
				fulfilledBy: $(".btn[data-option-id='"+id+"']").attr("data-option-fulfilled-by"),
				deptName: $(".btn[data-option-id='"+id+"']").attr("data-option-department-name"),
				subDeptName: $(".btn[data-option-id='"+id+"']").attr("data-option-sub-dept-name")
			};

			$scope.paymentRequestBillingItems(id)
			//$('.loader').removeClass('show')
			$('#request_payment_bill').modal('show');
		},
		makePayment: function(edits){
				
			var title = "Request Payment Prompt";
				var text = "You are about to accept Payment from "+$(".btn[data-option-id='"+edits.resourceId+"']").attr('data-option-payment-request-uuid')+". Do you want to continue? Please ensure you have colected the Money from theis patient  and also note that this action cannot be undone";
				var close = true;
				$scope._id = edits.paymentRequestId;
				var callback = function(){
					var paymentRequest = utils.serverRequest('/accounts-biller/payment-request/makePayment','put',edits);

					paymentRequest.then(function(response){
						functions.managePaymentRequest.paymentAccepted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Accept Payment";

				utils.confirm(title, text, close, callback, type, btnText);
		},
		deletePaymentRequest: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete this payment request ID "+$(".btn[data-option-id='"+id+"']").attr('data-option-payment-request-uuid')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/accounts-biller/payment-request/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.managePaymentRequest.paymentRequestDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
		}
	}
}	
	$scope.loadRequests = function(){
		$scope.dtInstance.reloadData();
	}
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var requests = utils.serverRequest('/accounts-biller/payment-request/load-all-requests', 'GET');
		return requests;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
	.withFixedHeader()
	.withOption('createdRow', function(row, data, dataIndex){
		utils.compile(angular.element(row).contents())($scope);
	})
	.withOption('headerCallback', function(header) {
        if (!$scope.headerCompiled) {
            $scope.headerCompiled = true;
            utils.compile(angular.element(header).contents())($scope);
        }
    })
	.withButtons([
        {
        	//extend: 'new',
        	text: '<i class="icon-qrcode"></i> <u>V</u>erify Payment Request',
        	action: function(){
        		functions.managePaymentRequest.verifyPaymentRequestForm();
        	}
        },
        {
        	extend: 'print',
        	text: '<i class="icon-printer"></i> <u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	}
        },
        {
        	extend: 'copy',
        	text: '<i class="icon-copy"></i> <u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: false,
        		altKey: true
        	}
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('PaymentRequestUUID').withTitle("Request Number"),
		utils.DT.columnBuilder.newColumn('PatientFullName').withTitle("Patient Name"),
		//utils.DT.columnBuilder.newColumn('RequestID').withTitle("Request ID"),
		utils.DT.columnBuilder.newColumn('GroupName').withTitle("Department"),
		utils.DT.columnBuilder.newColumn('RequestDate').withTitle("Request Date"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Status").renderWith(function(data, full, meta){
			if (data.RequestFulfillmentStatus == 1){
				return "<p class='badge badge-success badge-lg'>Fulfilled</p>";
			}
			else if(data.RequestFulfillmentStatus == -1) {
				return "<p class='badge badge-info badge-lg'>Invoice Generated</p>";
			}
			else {
				return "<p class='badge badge-danger badge-lg'>Unfulfilled</p>";
			}
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle('').notVisible().renderWith(function(meta, full, data){ return data.PatientCategoryName+data.PatientTypeName; }),
		utils.DT.columnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkUp)
	];

	$scope.paymentRequestBillingItems = function(paymentRequestId){
		var items = utils.serverRequest('/accounts-biller/payment-request/load-payment-request-billing-items?resourceId='+paymentRequestId,'get');
		items.then(function(response){
			$scope.itemsList = response;
			$scope.itemsList.globalTotal = 0;
			angular.forEach(response, function(value, key){
				$scope.itemsList.globalTotal += +value.totalPrice;
			})

			for(var i = 0; i < response.length; i++){
				response[i].itemName = response[i].BillingTypeItemName;
				response[i].itemCode = response[i].ItemID;
				response[i].itemPrice = response[i].totalPrice;
				response[i].itemQuantity = response[i].ItemQuantity;
			}

			var data = {
				type: $scope.temp.deptName,
				createdBy: utils.userSession.getUUID(),
				status: 'Payment Request',
				amount: response.globalTotal,
				items: response,
				patient: $scope.temp.patientID
			}

			if ($scope.temp.fulfillmentStatus == 0){
				var request = utils.serverRequest("/accounts-biller/transaction-meta/new", "POST", data);

				request.then(function(response){
					var lastInsertId = response.lastInsertId;

					if (lastInsertId){
						var edits = {
							AttachedInvoice: lastInsertId,
							RequestFulfillmentStatus: -1,
							resourceId: $scope.temp.requestId
						};

						utils.storage.currentInvoiceNumber = response.transactionNumber;

						$("#request_payment_bill").modal("hide");
						$("#accept_new_payment").modal("show");

						utils.serverRequest("/accounts-biller/payment-request/edit?resourceId="+$scope.temp.requestId, "PUT", edits)
						.then(function(response){
							utils.notify("Info", "An invoice has been generated successfully for this payment request and request status has been updated", "success");
						}, function(error){
							utils.errorHandler(error);
						})
					}
				}, function(responseObject){
					utils.errorHandler(responseObject);
				})
			}
		})
	}
	$scope.makePayment = function(){
		var edits = {
			resourceId : $scope.temp.requestId,
			staffUUID : utils.userSession.getUUID(),
			fulfilledDate: new Date(),
			status: 1
		}
		functions.managePaymentRequest.makePayment(edits);
		var eventLog = patientEventLogger.accounts.paymentRequestFulfilledEvent(
			$scope.temp.patientID,
			$scope.temp.requestId
		);
		eventLog.then(function(response){
			//patient registered event logged
		}, function(response){
			utils.errorHandler(response);
		});
	}
	$scope.verifyPayment = function(requestNumber){
		var request = utils.serverRequest('/accounts-biller/payment-request/get-status?resourceId&requestNumber='+requestNumber, 'GET');
		request.then(function(response){
			if (response.length < 1){
				utils.notify("An error occurred", "Seems like that payment request number does not exist or you have submitted an empty form, please try again", "warning");
			}
			else
			{
				if (response[0]["Status"] == 1){
					utils.alert("Verification successful", "The specified payment request has been fulfilled", "success");
				}
				else {
					utils.alert("Request Unfulfilled", "The specified payment request has not been fulfilled", "error");
				}
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}
	$scope.removeFromItemList = function(index, item){
		utils.alert("Operation not allowed", "You are not allowed to perform that action", "info");
	}
	$scope.functions = functions;
})