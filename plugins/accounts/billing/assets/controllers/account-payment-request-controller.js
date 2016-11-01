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
			"' data-option-patient-fullname='"+data.PatientFullName+
			"' data-option-patient-type='"+data.PatientType+
			"' data-option-staff-id='"+data.RequestBy+
			"' data-option-request-date='"+data.RequestDate+
			"' data-option-fulfillment-status='"+data.RequestFulfillmentStatus+
			"' data-option-fulfilled-date='"+data.RequestFulFilledDate+
			"' data-option-fulfilled-by='"+data.RequestFulfilledBy+
			"' data-option-department-name='"+data.GroupName+
			"' data-option-sub-dept-name='"+data.Name+
			"' ";
		var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+options+"><i class='icon-bin'></i> </button>";
		var makePaymentButton = "<button class='btn btn-default' ng-click=\""+makePaymentButtonAction+"\" "+options+">Make Payment</button>"
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
				staffUUID: $(".btn[data-option-id='"+id+"']").attr("data-option-staff-id"),
				patientUUID: $(".btn[data-option-id='"+id+"']").attr("data-option-patient-uuid"),
				patientFullName: $(".btn[data-option-id='"+id+"']").attr("data-option-patient-fullname"),
				patientType: $(".btn[data-option-id='"+id+"']").attr("data-option-patient-type"),
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
        /*{
        	//extend: 'new',
        	text: '<i class="icon-user-plus"></i> <u>N</u>ew Payment Request',
        	action: function(){
        		functions.managePaymentRequest.newAccountPaymentRequest();
        	}
        },*/
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
		utils.DT.columnBuilder.newColumn('PatientUUID').withTitle("Patient ID"),
		utils.DT.columnBuilder.newColumn('PatientFullName').withTitle("Request By"),
		//utils.DT.columnBuilder.newColumn('RequestID').withTitle("Request ID"),
		utils.DT.columnBuilder.newColumn('GroupName').withTitle("Department"),
		utils.DT.columnBuilder.newColumn('RequestDate').withTitle("Request Date"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Fulfillment Status").renderWith(function(data, full, meta){
			if (data.RequestFulfillmentStatus == 1){
				return "<p class='badge badge-success badge-lg'>Fulfilled</p>";
			}
			else {
				return "<p class='badge badge-danger badge-lg'>Unfulfilled</p>";
			}
		}),
		utils.DT.columnBuilder.newColumn('RequestFulfilledBy').withTitle("Fullfilled By"),
		utils.DT.columnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkUp)
	];

	$scope.paymentRequestBillingItems = function(paymentRequestId){
		var items = utils.serverRequest('/accounts-biller/payment-request/load-payment-request-billing-items?resourceId='+paymentRequestId,'get');
		items.then(function(response){
			$scope.itemsList = response;
		})
	}
	$scope.makePayment = function(){
		var edits = {
			resourceId : $scope.temp.requestId,
			staffUUID : utils.userSession.getUUID(),
			fulfilledDate: new Date(),
			status: 1
		}
		functions.managePaymentRequest.makePayment(edits)
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
	$scope.functions = functions;
})