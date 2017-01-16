angular.module("EmmetBlue")
.controller("accountPaymentRequestController", function($scope, utils, patientEventLogger){
	$scope.copyToClipboard = function(text) {
	    if (window.clipboardData && window.clipboardData.setData) {
	        // IE specific code path to prevent textarea being shown while dialog is visible.
	        return clipboardData.setData("Text", text); 

	    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
	        var textarea = document.createElement("textarea");
	        textarea.textContent = text;
	        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
	        document.body.appendChild(textarea);
	        textarea.select();
	        try {
	            document.execCommand("copy");  // Security exception may be thrown by some browsers.
	            utils.notify("Selected item copied successfully.", "", "info");
	        } catch (ex) {
	            utils.notify("Copy to clipboard failed.", ex, "error");
	            return false;
	        } finally {
	            document.body.removeChild(textarea);
	        }
	    }
	}

	$scope.requestFilter = {
		type: 'status',
		description: 'Open Unfulfilled Requests',
		value: 0
	}

	$("option[status='disabled']").attr("disabled", "disabled");

	var functions = {
		actionsMarkUp: function(meta, full, data){
			var deleteButtonAction = "functions.managePaymentRequest.deletePaymentRequest("+data.PaymentRequestID+")";
			var makePaymentButtonAction = "functions.managePaymentRequest.requestPaymentBill("+data.PaymentRequestID+")";
			var viewButtonAction = "functions.managePaymentRequest.viewPaymentBill("+data.PaymentRequestID+")";
			
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

			var viewButton = "<button type='button' class='btn bg-danger-400  bg-white btn-danger btn-labeled btn-xs' ng-click=\""+viewButtonAction+"\" "+options+"><b><i class='icon-menu7'></i></b> View Request</button>";

			if (data.RequestFulfillmentStatus == 1){
				var viewButton = "<button type='button' class='btn bg-success-400 bg-white btn-success btn-labeled btn-xs' ng-click=\""+viewButtonAction+"\" "+options+"><b><i class='icon-menu7'></i></b> Open Request</button>";
			}

			if (data.RequestFulfillmentStatus == -1){
				var viewButton = "<button type='button' class='btn bg-info-400 bg-white btn-info btn-labeled btn-xs' ng-click=\""+viewButtonAction+"\" "+options+"><b><i class='icon-menu7'></i></b> Open Request</button>";
			}

			var string = "<li><a href='#' class='billing-type-btn' ng-click=\""+makePaymentButtonAction+"\" "+options+"><i class='icon-pencil5'></i> Process Request</a></li>";

			if (data.RequestFulfillmentStatus != 0){
				var string = "<li><a href='#'><i class='icon-pencil5'></i> <strike>Process Request</strike></a></li>";
			}

			var group = "<div class='btn-group'>"+
								viewButton+
		                    	"<button type='button' class='btn bg-teal-400 dropdown-toggle btn-xs' data-toggle='dropdown'><span class='caret'></span></button>"+
		                    	"<ul class='dropdown-menu dropdown-menu-right'>"+
									string+
									"<li class='divider'></li>"+
									"<li><a href='#' class='billing-type-btn' ng-click=\""+deleteButtonAction+"\" "+options+"><i class='icon-cross text-danger'></i> Delete Request</a></li>"+
								"</ul>"+
							"</div>";
			return group;
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
			viewPaymentBill: function(id){
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

				$scope.paymentRequestBillingItems(id, false);

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

	$scope.reloadTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.loadRequests = function(){
		$scope.dtInstance.reloadData();
	}
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var url = '/accounts-biller/payment-request/load-all-requests?';
		var filter = $scope.requestFilter;
		if (filter.type == 'date'){
			var dates = filter.value.split(" - ");
			url += 'filtertype=date&startdate='+dates[0]+'&enddate='+dates[1];
		}
		else if (filter.type == 'status'){
			url += 'filtertype=status&query='+filter.value;
		}
		else if (filter.type == 'patient'){
			url += 'filtertype=patient&query='+filter.value;
		}
		else if (filter.type == 'department'){
			url += 'filtertype=department&query='+filter.value;
		}

		var requests = utils.serverRequest(url, 'GET');
		return requests;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(50)
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
		utils.DT.columnBuilder.newColumn(null).withTitle("Request Number").renderWith(function(data, full, meta){
			return "<p class='requestNum'>"+
					"<span class='copyButton'><a class='btn btn-icon btn-link btn-default no-bg no-border-radius btn-xs' ng-click='copyToClipboard("+data.PaymentRequestUUID+")'><i class='icon-copy2 text-primary'></i> copy</a></span>"+
					data.PaymentRequestUUID+
					"</p>"
		}),
		utils.DT.columnBuilder.newColumn('PatientFullName').withTitle("Patient Name"),
		utils.DT.columnBuilder.newColumn('GroupName').withTitle("Department"),
		utils.DT.columnBuilder.newColumn('RequestDate').withTitle("Request Date").notVisible(),
		utils.DT.columnBuilder.newColumn(null).withTitle("Request Date").renderWith(function(data, full, meta){
			var string = new Date(data.RequestDate).toDateString();
			if (new Date().toDateString()  == string){
				string = "Today, "+string;
			}
			return "<button style='background-color: transparent !important;' class='btn no-border-radius no-border' data-popup='tooltip' title='"+string+"'>"+data.RequestDate+"</button>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Status").renderWith(function(data, full, meta){
			if (data.RequestFulfillmentStatus == 1){
				var string = "<p class='no-border-radius label label-success label-lg'>Fulfilled</p>";
			}
			else if(data.RequestFulfillmentStatus == -1) {
				var string = "<p class='label label-info label-lg'>Invoice Generated</p>";
			}
			else {
				var string = "<p class='no-border-radius label label-danger label-lg'>Unfulfilled</p>";
			}

			return "<h6>"+string+"</h6>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle('').notVisible().renderWith(function(meta, full, data){ return data.PatientCategoryName+data.PatientTypeName; }),
		utils.DT.columnBuilder.newColumn(null).withTitle('').notSortable().renderWith(functions.actionsMarkUp)
	];

	$scope.paymentRequestBillingItems = function(paymentRequestId, acceptPayment){
		if (typeof(acceptPayment) === 'undefined') {
			acceptPayment = true;
		}
		
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

			if ($scope.temp.fulfillmentStatus == 0 && acceptPayment){
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

						if (acceptPayment){
							$("#request_payment_bill").modal("hide");
							$("#accept_new_payment").modal("show");

							utils.serverRequest("/accounts-biller/payment-request/edit?resourceId="+$scope.temp.requestId, "PUT", edits)
							.then(function(response){
								utils.notify("Info", "An invoice has been generated successfully for this payment request and request status has been updated", "success");
							}, function(error){
								utils.errorHandler(error);
							})
						}
					}
				}, function(responseObject){
					utils.errorHandler(responseObject);
				})
			}
		}, function(error){
			utils.errorHandler(error);
			utils.alert("Unable To Load Payment Form", "Please see the previous errors", "error");
		})
	}
	$scope.makePayment = function(){
		// var edits = {
		// 	resourceId : $scope.temp.requestId,
		// 	staffUUID : utils.userSession.getUUID(),
		// 	fulfilledDate: new Date(),
		// 	status: 1
		// }
		// functions.managePaymentRequest.makePayment(edits);
		// var eventLog = patientEventLogger.accounts.paymentRequestFulfilledEvent(
		// 	$scope.temp.patientID,
		// 	$scope.temp.requestId
		// );
		// eventLog.then(function(response){
		// 	//patient registered event logged
		// }, function(response){
		// 	utils.errorHandler(response);
		// });
		$scope.paymentRequestBillingItems($scope.temp.requestId);
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

	function keepReloading(){
		setInterval(function(){
			$scope.reloadTable();
		}, 2000);
	}

	function loadDepartments(){
		var request = utils.serverRequest("/human-resources/department/view", "GET");
		request.then(function(result){
			$scope.departments = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	loadDepartments();

	$scope.getDateRange = function(selector){
		var today = new Date();
		switch(selector){
			case "today":{
				return today.toLocaleDateString() + " - " + today.toLocaleDateString();
			}
			case "yesterday":{
				var yesterday = new Date(new Date(new Date()).setDate(new Date().getDate() - 1)).toLocaleDateString();
				return yesterday + " - " + yesterday;
				break;
			}
			case "week":{
				var d = new Date(today);
			  	var day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1);

			  	return new Date(d.setDate(diff)).toLocaleDateString() + " - " + today.toLocaleDateString();
			  	break;
			}
			case "month":{
				var year = today.getFullYear();
				var month = today.getMonth() + 1;

				return month+'/1/'+year + ' - ' + today.toLocaleDateString();
				break;
			}
		}
	}

	$scope.activateFilter = function(){
		var selector = $scope.filterSelector;
		switch(selector.type){
			case "status":{
				if (selector.value !== null){
				$scope.requestFilter.type = "status";
					var value = selector.value.split("<seprator>");
					$scope.requestFilter.value = value[1];
					$scope.requestFilter.description = "Status: "+value[0];
				}
				break;
			}
			case "dateRange":{
				$scope.requestFilter.type = "date";
				var value = selector.value.split(" - ");
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Date Ranges Between: "+ new Date(value[0]).toDateString()+" And "+ new Date(value[1]).toDateString();
				break;
			}
			case "patient":{
				$scope.requestFilter.type = "patient";
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Patient Search: '"+selector.value+"'";
				break;
			}
			case "department":{
				$scope.requestFilter.type = "department";
				var value = selector.value.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = "Department: '"+value[0]+"'";
				break;
			}
			default:{
				$scope.requestFilter.type = "date";
				var value = selector.type.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = value[0];
			}
		}

		$scope.reloadTable();
	}
})