angular.module("EmmetBlue")
.controller("accountPatientTypeDepositsWorkspaceController", function($scope, utils, patientEventLogger){
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

	$scope.requestFilter = {
		type: 'date',
		description: 'Today\'s Requests',
		value: $scope.getDateRange('today')
	}

	$("option[status='disabled']").attr("disabled", "disabled");

	var functions = {
		newDepositTransaction: function(){
			$("#deposits_account").modal("show");
		},
		actionsMarkUp: function(meta, full, data){
			var viewButtonAction = "functions.viewReceipt("+data.TransactionID+")";

			var options = 
				" data-option-id='"+data.TransactionID+
				"' data-option-account-id='"+data.AccountID+
				"' data-option-patient-uuid='"+data.PatientUUID+
				"' data-option-patient-id='"+data.PatientID+
				"' data-option-patient-fullname='"+data.PatientFullName+
				"' data-option-patient-type='"+data.PatientType+
				"' data-option-staff-id='"+data.StaffID+
				"' data-option-staff-name='"+data.StaffName+
				"' data-option-transaction-date='"+data.TransactionDate+
				"' data-option-transaction-amount='"+data.TransactionAmount+
				"' data-option-transaction-comment='"+data.TransactionComment+
				"' ";

			var viewButton = "<button type='button' class='btn btn-payment-request bg-success-400  bg-white btn-success btn-labeled btn-xs' ng-click=\""+viewButtonAction+"\" "+options+"><b><i class='icon-printer'></i></b> View Receipt</button>";

			return viewButton;
		},
		viewReceipt: function(id){
			var txStatus = "Credit";
			if ($(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-transaction-amount") < 0){
				txStatus = "Debit";
			}

			var _receiptData = {
				amountPaid:$(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-transaction-amount"),
				customerName:$(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-fullname"),
				invoiceData:{
					type:'',
					number: id,
					createdBy: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-staff-name"),
					status: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-transaction-comment"),
					amount: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-transaction-amount"),
					patient: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-patient-id"),
					totalAmount: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-transaction-amount"),
					items: [],
					paid: 1,
					amountPaid: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-transaction-amount"),
					department: ''
				},
				metaId: $(".btn-payment-request[data-option-id='"+id+"']").attr("data-option-account-id"),
				paymentMethod:'Deposit',
				transactionId: id,
				transactionStatus:"Deposit Receipt ("+txStatus+")"
			};

			$scope.printReceipt(_receiptData);
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
		var url = '/accounts-biller/deposit-account/view-transactions-by-patient-type?';
		var filter = $scope.requestFilter;
		var _filter = "";
		if (filter.type == 'date'){
			var dates = filter.value.split(" - ");
			_filter += 'filtertype=date&startdate='+dates[0]+'&enddate='+dates[1];
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
        	text: '<i class="fa fa-plus"></i> <u>N</u>ew Deposit Transaction',
        	action: function(){
        		functions.newDepositTransaction();
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
		utils.DT.columnBuilder.newColumn(null).withTitle("Transaction ID").renderWith(function(data, full, meta){
			var string = "<p>"+data.TransactionID+"</p>";

			if (data.TransactionAmount > 0){
				string += "<span class='no-border-radius label label-success label-lg'>Credit</span>";

			}
			else {
				string += "<span class='no-border-radius label label-danger label-lg'>Debit</span>";
			}

			return string;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient Type").renderWith(function(data, full, meta){
			var image = $scope.loadImage(data.PatientPicture);
			var html = "<td>"+
							"<div class='media-left'>"+
								"<div class=''><a href='#' class='text-default text-bold' title='filter'>"+data.PatientTypeName+" </a></div>"+
								"<div class='text-muted text-size-small'>"+
									"<span class='fa fa-user border-blue position-left'></span>"+
									data.CategoryName+
								"</div>"+
							"</div>"+
						"</td>";
			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Amount").renderWith(function(data, full, meta){
			var string = "<div class='media-left media-middle text-bold'>"+
							"<span ng-currency ng-currency-symbol='naira'></span> "+data.TransactionAmount+
						"</div>";

			return string;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Transaction Comment").renderWith(function(data, full, meta){
			var val ='<span class="display-block">'+data.TransactionComment+'</span>';
			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								"<i class='fa fa-user text-info'></i>"+
							"</div>"+
							"<div class='media-left'>"+
								"<div class='text-muted'>"+
								data.StaffName+
								"</div>"+
							"</div>"+
						"</td>";

			return val+html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Transaction Date").renderWith(function(data, full, meta){
			var date = new Date(data.TransactionDate);

			var val ='<span class="display-block">'+date.toDateString()+'</span><span class="text-muted">'+date.toLocaleTimeString()+'</span>';

			return val;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle('').notSortable().renderWith(functions.actionsMarkUp)
	];

	$scope.receiptData = {};
	$scope.printReceipt = function(response){
		$scope.receiptData = response; 

		$("#__payment_receipt").modal("show");
	}

	$scope.functions = functions;

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
			case "patientcategory":{
				$scope.requestFilter.type = "patientcategory";
				var value = selector.value.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = "Patient Category: '"+value[0]+"'";
				$scope.reloadTable();
				break;
			}
			case "paymentmethod":{
				$scope.requestFilter.type = "paymentmethod";
				var value = selector.value.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = "Payment Method: '"+value[0]+"'";
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

	$scope.reloadCurrentDay = function(){
		$scope.requestFilter = {
			type: 'date',
			description: 'Today\'s Requests',
			value: $scope.getDateRange('today')
		}

		$scope.reloadTable();
	}
})