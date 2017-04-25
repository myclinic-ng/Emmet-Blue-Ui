angular.module("EmmetBlue")
.controller("accountPaymentRequestController", function($scope, utils, patientEventLogger){
	$scope.loadImage = utils.loadImage;
	$scope.copyToClipboard = function(text) {
	    if (window.clipboardData && window.clipboardData.setData) {
	        return clipboardData.setData("Text", text); 

	    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
	        var textarea = document.createElement("textarea");
	        textarea.textContent = text;
	        textarea.style.position = "fixed";
	        document.body.appendChild(textarea);
	        textarea.select();
	        try {
	            document.execCommand("copy");
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
				"' data-option-staff-uuid-fullname='"+data.RequestByFullName+
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

			var viewButton = "<button type='button' class='btn btn-payment-request bg-danger-400  bg-white btn-danger btn-labeled btn-xs' ng-click=\""+viewButtonAction+"\" "+options+"><b><i class='icon-menu7'></i></b> View Request</button>";

			if (data.RequestFulfillmentStatus == 1){
				var viewButton = "<button type='button' class='btn btn-payment-request bg-success-400 bg-white btn-success btn-labeled btn-xs' ng-click=\""+viewButtonAction+"\" "+options+"><b><i class='icon-menu7'></i></b> Open Request</button>";
			}

			if (data.RequestFulfillmentStatus == -1){
				var viewButton = "<button type='button' class='btn btn-payment-request bg-info-400 bg-white btn-info btn-labeled btn-xs' ng-click=\""+viewButtonAction+"\" "+options+"><b><i class='icon-menu7'></i></b> Open Request</button>";
			}

			var string = "<li><a href='#' class='billing-type-btn' ng-click=\""+makePaymentButtonAction+"\" "+options+"><i class='icon-pencil5'></i> Process Request</a></li>";

			if (data.RequestFulfillmentStatus != 0){
				var string = "<li><a href='#'><i class='icon-pencil5'></i> <strike>Process Request</strike></a></li>";
			}

			if (typeof data.AttachedInvoiceNumber !== "undefined"){
				var val = "<li><a href='#' ng-click='copyToClipboard("+data.AttachedInvoiceNumber+")'><i class='icon-copy2 text-primary'></i> Copy Invoice Number</a></li>";

				string += val;
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
				$scope.dtInstance.rerender();
			},
			paymentRequestDeleted:function(){
				utils.alert("Operation Successful", "The selected Payment Request has been deleted successfully", "success", "notify");
				$scope.dtInstance.rerender();
			},
			verifyPaymentRequestForm:function(){
				$('#verify_payment').modal('show');
			},
			requestPaymentBill: function(id){
				functions.managePaymentRequest.viewPaymentBill(id);
				$scope.paymentRequestBillingItems(id);
				$('#request_payment_bill').modal('hide');
			},
			viewPaymentBill: function(id){
				$scope.temp = {
					requestId:id,
					requestNumber:$(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-payment-request-uuid"),
					staffUUID: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-staff-id"),
					staffUUIDFullName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-staff-uuid-fullname"),
					patientUUID: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-uuid"),
					patientID:$(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-id"),
					patientFullName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-fullname"),
					patientType: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-type"),
					patientCategoryName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-category-name"),
					patientTypeName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-type-name"),
					requestDate: (new Date($(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-request-date"))).toDateString(),
					fulfillmentStatus: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-fulfillment-status"),
					fulfilledDate: (new Date($(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-fulfilled-date"))).toDateString(),
					fulfilledBy: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-fulfilled-by"),
					deptName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-department-name"),
					subDeptName: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-sub-dept-name")
				};
				
				$('#request_payment_bill').modal('show');
			},
			makePayment: function(edits){
				var title = "Request Payment Prompt";
				var text = "You are about to accept Payment from "+$(".btn-payment-request[data-option-id='"+edits.resourceId+"']").attr('data-option-payment-request-uuid')+". Do you want to continue? Please ensure you have colected the Money from theis patient  and also note that this action cannot be undone";
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
				var text = "You are about to delete this payment request ID "+$(".btn-payment-request[data-option-id='"+id+"']").attr('data-option-payment-request-uuid')+". Do you want to continue? Please note that this action cannot be undone";
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
		$scope.dtInstance.rerender();
	}

	$scope.loadRequests = function(){
		$scope.dtInstance.rerender();
	}
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
		var url = '/accounts-biller/payment-request/load-all-requests?';
		var filter = $scope.requestFilter;
		var _filter = "";
		if (filter.type == 'date'){
			var dates = filter.value.split(" - ");
			_filter += 'filtertype=date&startdate='+dates[0]+'&enddate='+dates[1];
		}
		else if (filter.type == 'status'){
			_filter += 'filtertype=status&query='+filter.value;
		}
		else if (filter.type == 'patient'){
			_filter += 'filtertype=patient&query='+filter.value;
		}
		else if (filter.type == 'department'){
			_filter += 'filtertype=department&query='+filter.value;
		}
		else if (filter.type == 'staff'){
			_filter += 'filtertype=staff&query='+filter.staff;
			_filter += "&_date="+filter.date;
		}
		else if (filter.type == 'patienttype'){
			_filter += 'filtertype=patienttype&query='+filter.value;
		}

		var draw = data[0].value;
        var order = data[2].value;
        var start = data[3].value;
        var length = data[4].value;

		$scope.currentRequestsFilter = _filter;
		url = url+_filter+'&paginate&from='+start+'&size='+length;
		if (typeof data[5] !== "undefined" && data[5].value.value != ""){
			url += "&keywordsearch="+data[5].value.value;
		}
		var requests = utils.serverRequest(url, 'GET');
		
		requests.then(function(response){
			var records = {
				data: response.data,
				draw: draw,
				recordsTotal: response.total,
				recordsFiltered: response.filtered
			};

			callback(records);
		}, function(error){
			utils.errorHandler(error);
		});
	})
	.withDataProp('data')
	.withOption('processing', true)
	.withOption('serverSide', true)
	.withOption('paging', true)
	.withPaginationType('full_numbers')
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
        	text: '<i class="icon-statistics"></i> <u>A</u>nalyse Current Data',
        	action: function(){
				if ($scope.requestFilter.type == "patient"){
					$scope.analysisFilters.status = [0, -1];
				}
				else if ($scope.requestFilter.type == "staff"){
					$scope.analysisFilters.status = [1];
					$scope.analysisFilters.dates = (new Date()).toLocaleDateString();
				}

				$scope.retriveAnalysisForCurrentTable();
				$("#show_analysis").modal("show");
        	}
        },
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
		utils.DT.columnBuilder.newColumn(null).withTitle("Request Details").renderWith(function(data, full, meta){
			if (typeof data.AttachedInvoiceNumber !== "undefined"){
				var copyBtn = "<span class='copyButton'><a class='btn btn-icon btn-link btn-default no-bg no-border-radius btn-xs' ng-click='copyToClipboard("+data.AttachedInvoiceNumber+")'><i class='icon-copy2 text-primary'></i></a></span>";
				var string = "<span class='requestNum'>"+
								data.AttachedInvoiceNumber+
								copyBtn+
								"</span>";
				var icon = "<i class='fa fa-print text-success'></i>";
			}
			else {
				var string ="<span class='text-muted text-small'><small>&lt;no attached invoice&gt;</small></span>";
				var icon = "<i class='fa fa-exclamation-circle text-warning'></i>";
			}

			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								icon+
							"</div>"+
							"<div class='media-left'>"+
								"<div class='text-muted text-size-small'>"+
									"<span class='text-small position-left'>ID:</span>"+
									data.PaymentRequestUUID+
								"</div>"+
								"<div class=''>"+string+"</div>"+
							"</div>"+
						"</td>";

			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient").renderWith(function(data, full, meta){
			var image = $scope.loadImage(data.PatientPicture);
			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
							"</div>"+
							"<div class='media-left'>"+
								"<div class=''><a href='#' class='text-default text-bold'>"+data.PatientFullName+"</a></div>"+
								"<div class='text-muted text-size-small'>"+
									"<span class='fa fa-user border-blue position-left'></span>"+
									data.PatientCategoryName+
								"</div>"+
							"</div>"+
						"</td>";
			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Department").renderWith(function(data, full, meta){
			var val ='<span class="display-block">'+data.Name+'</span>';
			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								"<i class='fa fa-caret-right text-info'></i>"+
							"</div>"+
							"<div class='media-left'>"+
								"<div class='text-muted'>"+
								data.RequestByFullName+
								"</div>"+
							"</div>"+
						"</td>";

			return val+html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Request Date").renderWith(function(data, full, meta){
			var date = new Date(data.RequestDate);

			var val ='<span class="display-block">'+date.toDateString()+'</span><span class="text-muted">'+date.toLocaleTimeString()+'</span>';

			return val;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Status").renderWith(function(data, full, meta){
			if (data.RequestFulfillmentStatus == 1){
				var string = "<p class='no-border-radius label label-success label-lg'>Fulfilled</p>";
				string += "<td>"+
							"<div class='media-left media-middle'>"+
								"<span class='text-info text-size-small'>Amount Paid:</span><br/>"+
								"<span ng-currency ng-currency-symbol='naira'></span>"+data.BillingAmountPaid+
							"</div>"+
						"</td>";

			}
			else if(data.RequestFulfillmentStatus == -1) {
				var string = "<p class='label label-info label-lg'>Invoice Generated</p>";
			}
			else {
				var string = "<p class='no-border-radius label label-danger label-lg'>Unfulfilled</p>";
			}

			return "<h6>"+string+"</h6>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle('').notSortable().renderWith(functions.actionsMarkUp)
	];


	$scope.patientTypes = {};

	$scope.loadPatientTypes = function(){
		if (typeof (utils.userSession.getID()) !== "undefined"){
			var requestData = utils.serverRequest("/patients/patient-type-category/view", "GET");
			requestData.then(function(response){
				$scope.patientTypes = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			});
		}
	}

	$scope.loadPatientTypes();

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

						$scope.cTxNum = response.transactionNumber;

						if (acceptPayment){
							$("#request_payment_bill").modal("hide");
							$("#accept_new_payment").modal("show");

							utils.serverRequest("/accounts-biller/payment-request/edit?resourceId="+$scope.temp.requestId, "PUT", edits)
							.then(function(response){
								utils.notify("Info", "An invoice has been generated successfully for this payment request and request status has been updated", "success");
								utils.storage.currentInvoiceNumber = $scope.cTxNum;
								$scope.reloadTable();
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

	$scope.receiptData = {};
	$scope.printReceipt = function(){
		var req = utils.serverRequest("/accounts-biller/transaction/view-by-invoice?resourceId="+$scope.temp.requestId, "GET");

		req.then(function(response){
			$scope.receiptData = {
				amountPaid:response.BillingAmountPaid,
				customerName:response.BillingTransactionCustomerName,
				invoiceData:{
					type:response.invoiceData.BillingType,
					number: response.invoiceData.BillingTransactionNumber,
					createdBy: response.invoiceData.CreatedByUUID,
					status: response.invoiceData.BillingTransactionStatus,
					amount: response.invoiceData.BilledAmountTotal,
					patient: response.invoiceData.PatientID,
					totalAmount: response.invoiceData.BilledAmountTotal,
					items: response.invoiceData.BillingTransactionItems,
					paid: response.invoiceData._meta.status,
					amountPaid: response.invoiceData.BillingAmountPaid,
					department: response.invoiceData.RequestDepartmentName
				},
				metaId: response.BillingTransactionMetaID,
				paymentMethod:response.BillingPaymentMethod,
				transactionId: response.BillingTransactionID,
				transactionStatus:"Reprint"
			};

			$("#request_payment_bill").modal("hide");
			$("#_payment_receipt").modal("show");
		}, function(error){
			utils.errorHandler(error);
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
					$scope.reloadTable();
				}
				break;
			}
			case "dateRange":{
				$scope.requestFilter.type = "date";
				var value = selector.value.split(" - ");
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Date Ranges Between: "+ new Date(value[0]).toDateString()+" And "+ new Date(value[1]).toDateString();
				$scope.reloadTable();
				break;
			}
			case "patient":{
				$scope.requestFilter.type = "patient";
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Patient Search: '"+selector.value+"'";
				$scope.reloadTable();
				break;
			}
			case "staff":{
				$scope.requestFilter.type = "staff";
				$scope.requestFilter.value= selector.value;
				if (typeof selector.date !== "undefined" && selector.date !== ""){
					$scope.requestFilter.date= selector.date;	
				}
				else {
					$scope.requestFilter.date = (new Date()).toLocaleDateString();
				}

				$scope.requestFilter.description = "Staff Search: '"+selector.value+"'";

				var req = utils.serverRequest("/human-resources/staff/get-staff-id?name="+selector.value, "GET");
				req.then(function(result){
					if (typeof result["StaffID"] !== "undefined"){
						$scope.requestFilter.staff = result["StaffID"];
						$scope.reloadTable();
					}
				})
				break;
			}
			case "department":{
				$scope.requestFilter.type = "department";
				var value = selector.value.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = "Department: '"+value[0]+"'";
				$scope.reloadTable();
				break;
			}
			case "patienttype":{
				$scope.requestFilter.type = "patienttype";
				var value = selector.value.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = "Patient Type: '"+value[0]+"'";
				$scope.reloadTable();
				break;
			}
			default:{
				$scope.requestFilter.type = "date";
				var value = selector.type.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = value[0];
				$scope.reloadTable();
			}
		}
	}

	$scope.currentFilterAnalysis = {};
	$scope.analysisFilters = {
	};

	$scope.retriveAnalysisForCurrentTable = function(){
		if (typeof ($scope.paymentRuleAppliedAmount) !== "undefined") {
			delete $scope.paymentRuleAppliedAmount;
		}

		var filter = $scope.currentRequestsFilter;
		var _filters = [];
		if (typeof $scope.analysisFilters.status !== "undefined"){
			var string = "_status="+$scope.analysisFilters.status.join(",");
			_filters.push(string);
		}

		if (typeof $scope.analysisFilters.date !== "undefined"){
			var string = "_date="+$scope.analysisFilters.date;
			string.replace(" ", "");
			_filters.push(string)
		}

		if (typeof $scope.analysisFilters.department !== "undefined"){
			var string = "_department="+$scope.analysisFilters.department.join(",");
			_filters.push(string);
		}

		filter += "&"+_filters.join("&");
		var req = utils.serverRequest("/accounts-biller/payment-request/analyse-requests?"+filter, "GET");

		req.then(function(result){
			$scope.currentFilterAnalysis = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.applyPaymentRule = function(amount){
		utils.serverRequest("/patients/patient/search?query="+$scope.filterSelector.value, "GET").then(function(response){
			var id = response["hits"]["hits"][0]["_source"]["patientid"];

			var req = utils.serverRequest("/accounts-biller/get-item-price/apply-payment-rule?resourceId="+id+"&amount="+amount, "GET");

			req.then(function(response){
				$scope.paymentRuleAppliedAmount = response.amount;
			}, function(error){
				utils.errorHandler(error);
			})
		}, function(error){
			utils.errorHandler(error);
		})
	}
})