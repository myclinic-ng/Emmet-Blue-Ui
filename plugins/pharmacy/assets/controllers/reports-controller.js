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
		description: 'Today\'s Dispensations',
		value: $scope.getDateRange("today")
	}

	$scope.createdFilters = [];
	$scope.createdFilters.push({
		type: 'nil',
		description: 'Today\'s Dispensations',
		value: $scope.getDateRange("today")
	});

	$scope.dateRange = $scope.getDateRange("today");

	$scope.$watch("dateRange", function(nv){
		var dates = nv.split(" - ");
		if (dates[0] == dates[1]){
			$scope.requestFilter = {
				type: "nil",
				description: "All dispensations on "+(new Date(dates[0])).toDateString(),
				value: nv
			};
		}
		else {
			$scope.requestFilter = {
				type: "nil",
				description: "Date Range Between "+(new Date(dates[0])).toDateString()+" and "+(new Date(dates[1])).toDateString(),
				value: nv
			};	
		}

		$scope.reloadDispensationsTable(true);
	})

	$("option[status='disabled']").attr("disabled", "disabled");
	
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
		var filter = $scope.createdFilters;
		
		var draw = data[0].value;
        var order = data[2].value;
        var start = data[3].value;
        var length = data[4].value;

        var dates = filter[0].value.split(" - ");

        // filter.splice(0, 1);

        var data = {
        	"startdate": dates[0],
        	"enddate": dates[1],
        	"resourceId":0,
        	"paginate":true,
        	"from":start,
        	"size":length,
        	"filtertype":"filtercombo",
        	"query":[]
        }

		if (typeof data[5] !== "undefined" && data[5].value.value != ""){
			data.keywordsearch = data[5].value.value;
		}

		for (var i = filter.length - 1; i >= 1; i--) {
			var _filter = filter[i];
			if (_filter.use){
				data.query.push({
					type:_filter.type,
					value:_filter.value
				});	
			}
		}

        var url = '/pharmacy/dispensation/retrieve-dispensed-items-report';

		var dispensations = utils.serverRequest(url, 'POST', data);
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
		utils.DT.columnBuilder.newColumn(null).withTitle("Item").renderWith(function(data){
			return "<span class='text-bold'>"+data.BillingTypeItemName+"</span> <br/> <span class='text-size-small'>"+data.BillingTypeName+"</span> <br/> <span class='text-size-small text-info'>Item Code: "+data.ItemID+"</span>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Dispensed Quantity").renderWith(function(data){
			return "<span class='text-bold'>"+data.DispensedQuantity+"</span>";
		}),
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

	$scope.reloadDispensationsTable = function(applyToFirstIndex=false){
		if (typeof $scope.requestFilter.type !== "undefined"){	
			var data = {
				description: $scope.requestFilter.description,
				value: $scope.requestFilter.value,
				type: $scope.requestFilter.type,
				use: true
			};

			if (applyToFirstIndex){
				$scope.createdFilters[0] = data;
			}
			else{
				$scope.createdFilters.push(data);
			}
			$scope.requestFilter = {};	
		}
		
		rerenderTable();
	}

	function rerenderTable(){
		if (angular.isFunction($scope.dtInstance.rerender)){
			$scope.dtInstance.rerender();	
		}
	}

	$scope.stores = {};
	var loadStores = function(){
		var request = utils.serverRequest("/pharmacy/store/view", "GET");
		request.then(function(result){
			$scope.stores = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}();

	$scope.billingTypes = {};

	var loadBillingTypes = function(){
		var request = utils.serverRequest("/accounts-biller/billing-type/view", "GET");
		request.then(function(result){
			$scope.billingTypes = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}();

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
				$scope.reloadDispensationsTable(true);
				break;
			}
			case "patient":{
				$scope.requestFilter.type = "patient";
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Patient Search: '"+selector.value+"'";

				var req = utils.serverRequest("/patients/patient/search", "POST", {"query": selector.value, "from": 0, "size": 1});
				req.then(function(result){
					if (typeof result.hits.hits[0]["_source"]["patientid"] !== "undefined"){
						$scope.requestFilter.value = result.hits.hits[0]["_source"]["patientid"];
						$scope.reloadDispensationsTable();
					}
					else {
						utils.notify("Invalid Search Query", "Please enter a valid patient profile identifier to continue", "warning");
					}
				}, function(error){
					utils.errorHandler(error);
				})
				break;
			}
			case "staff":{
				$scope.requestFilter.type = "staff";
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Staff Search: '"+selector.value+"'";

				var req = utils.serverRequest("/human-resources/staff/get-staff-id?name="+selector.value, "GET");
				req.then(function(result){
					if (typeof result["StaffID"] !== "undefined"){
						$scope.requestFilter.value = result["StaffID"];
						$scope.reloadDispensationsTable();
					}
					else {
						utils.notify("Invalid Staff Username", "Please enter a valid username to continue", "warning");
					}
				}, function(error){
					utils.errorHandler(error);
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
			case "billingtype":{
				$scope.requestFilter.type = "billingtype";
				var value = selector.value.split("<seprator>");
				$scope.requestFilter.value = value[0];
				$scope.requestFilter.description = "Billing Type Item: '"+value[1]+"'";
				$scope.reloadDispensationsTable();
				break;
			}
			case "store":{
				$scope.requestFilter.type = "store";
				var value = selector.value.split("<seprator>");
				$scope.requestFilter.value = value[0];
				$scope.requestFilter.description = "Dispensing Store: '"+value[1]+"'";
				$scope.reloadDispensationsTable();
				break;
			}
			case "itemcode":{
				$scope.requestFilter.type = "itemcode";
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Item Code: '"+selector.value+"'";
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