angular.module("EmmetBlue")

.controller('pharmacyReportsController', function($scope, utils, patientEventLogger, $rootScope){
	$scope.loadImage = utils.loadImage;
	$scope.patient = {};

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
		type: 'nil',
		description: '',
		value: $scope.getDateRange("today")
	}

	$scope.dateRange = $scope.getDateRange("today");

	$("option[status='disabled']").attr("disabled", "disabled");
	
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
		var filter = $scope.requestFilter;
		var _filter = "";
		var dates = $scope.dateRange.split(" - ");
		_filter += 'startdate='+dates[0]+'&enddate='+dates[1];

		if (filter.type == 'nil'){
			_filter += '&filtertype=nil' 
		}
		else if (filter.type == 'patient'){
			_filter += '&filtertype=patient&query='+filter.value;
		}
		else if (filter.type == 'billingtype'){
			_filter += '&filtertype=billingtype&query='+filter.value;
		}
		else if (filter.type == 'staff'){
			_filter += '&filtertype=staff&query='+filter.staff;
			_filter += "&_date="+filter.date;
		}
		else if (filter.type == 'patienttype'){
			_filter += '&filtertype=patienttype&query='+filter.value;
		}

		$scope.currentRequestsFilter = _filter;
		var draw = data[0].value;
        var order = data[2].value;
        var start = data[3].value;
        var length = data[4].value;

        var url = '/pharmacy/dispensation/retrieve-dispensed-items-report?'+_filter+'&resourceId=0&paginate&from='+start+'&size='+length;

		if (typeof data[5] !== "undefined" && data[5].value.value != ""){
			url += "&keywordsearch="+data[5].value.value;
		}

		var dispensations = utils.serverRequest(url, 'GET');
		dispensations.then(function(response){
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
	.withDisplayLength(10)
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
			text: '<i class="icon-file-plus"></i> <u>N</u>ew Dispensation',
			action: function(){
				$("#new_dispensation").modal("show");
			},
			key: {
        		key: 'n',
        		ctrlKey: false,
        		altKey: true
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
		// utils.DT.columnBuilder.newColumn(null).withTitle("").notSortable().renderWith(function(data, full, meta){
		// 	switch(data.Acknowledged){
		// 		case "1":{
		// 			var html = "<i class='icon-checkmark3 text-success'></i>";
		// 			break;
		// 		}
		// 		case "-1":{
		// 			var html = "<i class='fa fa-pause text-danger-400'></i>";
		// 			break;
		// 		}
		// 		default:{
		// 			var html = "<span class='text-grey-400 fa fa-dot-circle-o'></span>";
		// 		}
		// 	}
			
		// 	return html;
		// }),
		utils.DT.columnBuilder.newColumn('ItemID').withTitle("Item ID"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Item").renderWith(function(data){
			return "<span class='text-bold'>"+data.BillingTypeItemName+"</span> <br/> <span class='text-size-small'>"+data.BillingTypeName+"</span>";
		}),
		utils.DT.columnBuilder.newColumn("DispensedQuantity").withTitle("Dispensed Quantity"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Dispensing Store").renderWith(function(data){
			return "<span class='text-bold'>"+data.StoreName+"</span> <br/>"+data.DispensoryName+"";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient").renderWith(function(data, full, meta){
			var image = $scope.loadImage(data.patientInfo.patientpicture);
			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
							"</div>"+
							"<div class='media-left'>"+
								"<div class=''><a href='#' class='text-default'>"+data.patientInfo.patientfullname+"</a></div>"+
								"<span class='text-info'>"+data.CategoryName+"</span>"+
								"<div class='text-muted text-size-small'>"+
									data.patientInfo.patientuuid+
								"</div>"+
							"</div>"+
						"</td>";

			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Staff").renderWith(function(data, full, meta){
			var image = $scope.loadImage(data.staffInfo.StaffPicture);
			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
							"</div>"+
							"<div class='media-left'>"+
								"<div class=''><a href='#' class='text-default'>"+data.staffInfo.StaffFullName+"</a></div>"+
								"<div class='text-muted text-size-small'>"+
									data.staffInfo.Role+
								"</div>"+
							"</div>"+
						"</td>";

			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Dispensation Date").renderWith(function(data, a, b){
			return (new Date(data.DispensationDate)).toDateString()+"<br/>"+(new Date(data.DispensationDate)).toLocaleTimeString();
		})
	];

	$scope.reloadDispensationsTable = function(){
		$scope.dtInstance.rerender();
	}

	function loadDispensories(){
		var request = utils.serverRequest("/pharmacy/eligible-dispensory/view", "GET");
		request.then(function(result){
			$scope.dispensories = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	function loadStores(dispensory){
		var request = utils.serverRequest("/pharmacy/eligible-dispensory/view-by-store?resourceId="+dispensory, "GET");
		request.then(function(result){
			$scope.stores = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

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

	// loadStores();

	$scope.activateFilter = function(){
		var selector = $scope.filterSelector;
		switch(selector.type){
			case "status":{
				if (selector.value !== null){
				$scope.requestFilter.type = "status";
					var value = selector.value.split("<seprator>");
					$scope.requestFilter.value = value[1];
					$scope.requestFilter.description = "Status: "+value[0];
					$scope.reloadDispensationsTable();
				}
				break;
			}
			case "dateRange":{
				$scope.requestFilter.type = "date";
				var value = selector.value.split(" - ");
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Date Ranges Between: "+ new Date(value[0]).toDateString()+" And "+ new Date(value[1]).toDateString();
				$scope.reloadDispensationsTable();
				break;
			}
			case "patient":{
				$scope.requestFilter.type = "patient";
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Patient Search: '"+selector.value+"'";
				$scope.reloadDispensationsTable();
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
						$scope.reloadDispensationsTable();
					}
				})
				break;
			}
			case "patienttype":{
				$scope.requestFilter.type = "patienttype";
				var value = selector.value.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = "Patient Type: '"+value[0]+"'";
				$scope.reloadDispensationsTable();
				break;
			}
			default:{
				$scope.requestFilter.type = "date";
				var value = selector.type.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = value[0];
				$scope.reloadDispensationsTable();
			}
		}
	}
});