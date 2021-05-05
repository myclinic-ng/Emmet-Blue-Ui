angular.module("EmmetBlue")
.controller("accountsBillingTransactionsReceiptsController", function($scope, utils, patientEventLogger){
	$scope.loadImage = utils.loadImage;

	$scope.receiptsMeta = {
		"sumTotal":0,
		"sumTotalSales":0,
		"totalPatients":0,
		"totalReceipts":0,
		"totalDepositCredits":0
	};

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
				"' data-option-transaction-status='"+data.BillingTransactionStatus+
				"' ";
			var deleteButton = "";//"<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+options+"><i class='icon-bin'></i> </button>";
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
							"</div>";
			return group;
		}
	}

	$scope.reloadTable = function(){
		$scope.dtInstance.rerender();
	}

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
		var url = '/accounts-biller/payment-receipt/view?';
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
		else if (filter.type == 'patientcategory'){
			_filter += 'filtertype=patientcategory&query='+filter.value;
		}
		else if (filter.type == 'paymentmethod'){
			_filter += 'filtertype=paymentmethod&query='+filter.value;
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

			$scope.receiptsMeta = response.meta;

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
		utils.DT.columnBuilder.newColumn(null).withTitle("ID").renderWith(function(data, full, meta){
			var string = "<span class='requestNum'>"+
							data.BillingTransactionID+
							"</span>";
			var icon = "<i class='fa fa-print text-success'></i>";

			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								icon+
							"</div>"+
							"<div class='media-left'>"+
								"<div class=''>"+string+"</div>"+
							"</div>"+
						"</td>";

			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient").renderWith(function(data, full, meta){
			var image = $scope.loadImage(data.PatientPicture);
			var filterString = "filterByPatient(\""+data.PatientUUID+"\",\""+data.PatientFullName+"\")";
			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
							"</div>"+
							"<div class='media-left'>"+
								"<div class=''><a href='#' class='text-default text-bold' title='filter' ng-click='"+filterString+"'>"+data.PatientFullName+
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
								"<i class='fa fa-user text-info'></i>"+
							"</div>"+
							"<div class='media-left'>"+
								"<div class='text-muted'>"+
								data.RequestByFullName+
								"</div>"+
							"</div>"+
						"</td>";

			return val+html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Date").renderWith(function(data, full, meta){
			var date = new Date(data.BillingTransactionDate);

			var val ='<span class="display-block">'+date.toDateString()+'</span><span class="text-muted">'+date.toLocaleTimeString()+'</span>';

			return val;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Status").renderWith(function(data, full, meta){
			if (data.RequestFulfillmentStatus == 1){
				var transactionStatus = data.BillingTransactionStatus;
				var label = "label-default";
				if (transactionStatus == "Paid"){
					label = "label-success";
				}
				else if (transactionStatus == "Part Payment"){
					label = "label-danger";
				}

				var string = "<p class='no-border-radius label "+label+" label-lg'>"+transactionStatus+"</p>";
				string += "<td>"+
							"<div class='media-left media-middle'>"+
								"<span class='text-info text-size-small'>Amount Paid:</span><br/>"+
								"<span ng-currency ng-currency-symbol='naira'></span>"+data.BillingAmountPaid+
							"</div>"+
						"</td>";

			}
			else if(data.RequestFulfillmentStatus == -1) {
				var string = "<span class='text-muted text-size-small'>N/A</span>";
			}
			else {
				var string = "<span class='text-muted text-size-small'>N/A</span>";
			}

			return "<h6>"+string+"</h6>";
		}),
		// utils.DT.columnBuilder.newColumn(null).withTitle('').notSortable().renderWith(functions.actionsMarkUp)
	];



	$scope.$watch(function(){
		return utils.storage.currentReportDateRange;
	}, function(nv){
		if (typeof nv !== "undefined"){
			$scope.requestFilter = {
				type: 'date',
				description: nv[0]+" - "+nv[1],
				value: nv[0]+" - "+nv[1]
			}

			$scope.reloadTable();
		}
	})
})