angular.module("EmmetBlue")

.controller('pharmacyDispensationController', function($scope, utils, patientEventLogger, $rootScope){
	$scope.loadImage = utils.loadImage;
	$scope.patient = {};

	$scope.$on("loadPatientNumberForDispensation", function(){
		$scope.patientNumber = utils.storage.patientNumberForDispensation;
		$scope.currentRequest = utils.storage.currentRequest;
		utils.storage.patientNumberForDispensation = null;
		utils.storage.currentRequest = null;
		$scope.loadPatientProfile();
	});

	$scope.loadPatientProfile = function(){
		var patient = utils.serverRequest("/patients/patient/search", "POST", {
			"query":$scope.patientNumber,
			"from":0,
			"size":1
		});

		patient.then(function(response){
			var profile = response.hits.hits[0]["_source"];
			$scope.patient.fullName = profile["first name"]+" "+profile["last name"];
			$scope.patient.id = profile["patientid"];
			$scope.patientNumber = "";
		}, function(error){
			utils.errorHandler(error);
		})
	}

	var actions = function (data, type, full, meta){
		var viewButtonAction = "manageDispensation('view', "+data.DispensationID+")";
			
		var items = JSON.stringify(data.items);
		var dataOpt = "data-option-id='"+data.DispensationID+"' data-request-id='"+data.RequestID+"' data-option-items='"+items+"'";

		var viewButton = "<button class='btn btn-danger billing-type-pharm-btn' ng-click=\""+viewButtonAction+"\" "+dataOpt+"><i class='icon-eye'></i> view</button>";
		
		var buttons = "<div class='btn-group'>"+viewButton+"</button>";
		return buttons;
	}

	$scope.requestFilter = {
		type: 'status',
		description: 'Open Acknowledged Requests',
		value: -1
	}

	$("option[status='disabled']").attr("disabled", "disabled");
	
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
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

		$scope.currentRequestsFilter = _filter;
		var draw = data[0].value;
        var order = data[2].value;
        var start = data[3].value;
        var length = data[4].value;

        var url = '/pharmacy/dispensation/view?'+_filter+'&resourceId=0&paginate&from='+start+'&size='+length;

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
		utils.DT.columnBuilder.newColumn(null).withTitle("").notSortable().renderWith(function(data, full, meta){
			switch(data.Acknowledged){
				case "1":{
					var html = "<i class='icon-checkmark3 text-success'></i>";
					break;
				}
				case "-1":{
					var html = "<i class='fa fa-pause text-danger-400'></i>";
					break;
				}
				default:{
					var html = "<span class='text-grey-400 fa fa-dot-circle-o'></span>";
				}
			}
			
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
									"<span class='status-mark border-blue position-left'></span>"+
									data.PatientUUID+
								"</div>"+
							"</div>"+
						"</td>";

			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Dispensory").renderWith(function(data){
			return "<span class='text-bold'>"+data.Dispensory+"</span> <br/>"+data.StoreName+"";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Dispensation Date").renderWith(function(data, a, b){
			return (new Date(data.DispensationDate)).toDateString()+"<br/>"+(new Date(data.DispensationDate)).toLocaleTimeString();
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(actions).notSortable()
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

	$scope.currentDispensory;
	loadDispensories();
	// loadStores();

	$scope.$watch(function(){
		return $scope.currentDispensory;
	}, function(newValue){
		if (typeof newValue !== "undefined"){
			loadStores(newValue);
		}
	})

	$scope.$watch(function(){
		return $scope.currentStore;
	}, function(newValue){
		if (typeof newValue !== "undefined"){
			$scope.reloadInventoryTable();
		}
	})


	var inventoryActions = function (data, type, full, meta){
		var buttonAction = "selectItem('select', "+data.ItemID+")";

		var dataOpt = "data-option-id='"+data.ItemID+"' data-option-name='"+data.BillingTypeItemName+"' data-option-code='"+data.Item+"'";

		var button = "<button class='btn btn-default inventory-btn' ng-click=\""+buttonAction+"\" "+dataOpt+">select item </button>";
		
		var buttons = "<div class='btn-group'>"+button+"</button>";
		return buttons;
	}

	$scope.ddtInstance = {};
	$scope.ddtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
		var draw = data[0].value;
        var order = data[2].value;
        var start = data[3].value;
        var length = data[4].value;

        var url = '/pharmacy/store-inventory/view-available-items-by-store?resourceId='+$scope.currentStore+'&paginate&from='+start+'&size='+length;
		if (typeof data[5] !== "undefined" && data[5].value.value != ""){
			url += "&keywordsearch="+data[5].value.value;
		}

		var inventory = utils.serverRequest(url, 'GET');
		inventory.then(function(response){
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

	$scope.ddtColumns = [
		utils.DT.columnBuilder.newColumn('Item').withTitle("Item Code").notVisible(),
		utils.DT.columnBuilder.newColumn('BillingTypeItemName').withTitle("Item"),
		utils.DT.columnBuilder.newColumn('ItemBrand').withTitle("Brand"),
		utils.DT.columnBuilder.newColumn('ItemManufacturer').withTitle("Manufacturer").notVisible(),
		utils.DT.columnBuilder.newColumn(null).withTitle("Tags").renderWith(function(data, type, full){
			var string = invisible = "";
			for (var i = 0; i < data.Tags.length; i++) {
				invisible += data.Tags[i].TagTitle+": "+data.Tags[i].TagName+" ";
				string += "<h6 class='display-block'><span class='label label-info text-muted pull-left' style='border-right:0px !important;'>"+data.Tags[i].TagTitle+"</span><span class='label label-warning pull-left' style='border-left:0px !important;'> "+data.Tags[i].TagName+"</span></h6><br/><br/>";
			}
			
			return string;
		}),
		utils.DT.columnBuilder.newColumn('ItemQuantity').withTitle("Quantity in stock"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(inventoryActions).notSortable()
	];

	$scope.reloadInventoryTable = function(){
		$scope.ddtInstance.rerender();
	}

	$scope.currentItem = {

	};

	$scope.dispensationItems = [];

	$scope.itemQuantityBoxValue = 1;

	$scope.selectItem = function(value, id){
		switch(value){
			case "select":{
				$("#item_qty").modal("show");
				var sel = $(".inventory-btn[data-option-id='"+id+"']");
				$scope.currentItem.ItemCode = sel.attr('data-option-code');
				$scope.currentItem.Item = sel.attr('data-option-name');
				$scope.currentItem.item = sel.attr('data-option-code');
				$scope.currentItem.itemID = id;
				break;
			}
		}
	}

	$scope.addItemToList = function(){
		$scope.currentItem.quantity = $scope.itemQuantityBoxValue;
		$scope.itemQuantityBoxValue = 1;
		$("#item_qty").modal("hide");

		var _i = $scope.currentItem.ItemCode;
		var _p = $scope.patient.id;
		var _q = $scope.currentItem.quantity;

		utils.serverRequest("/accounts-biller/get-item-price/calculate?resourceId="+_p+"&item="+_i+"&quantity="+_q, "GET")
		.then(function(response){
			$scope.currentItem.price = response.totalPrice;

			$scope.dispensationItems.push($scope.currentItem);
			$scope.currentItem = {};
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.removeItemFromList = function(index){
		$scope.dispensationItems.splice(index, 1);
	}

	var saveDispensation = function(){
		var data = {
			dispensedItems: $scope.dispensationItems,
			eligibleDispensory: $scope.currentDispensory,
			dispensingStore: $scope.currentStore,
			patient: $scope.patient.id,
			dispensee: utils.userSession.getUUID()
		}

		if (typeof $scope.currentRequest !== "undefined" && typeof $scope.currentRequest.RequestID !== "undefined"){
			data.request = $scope.currentRequest.RequestID;
		}

		utils.serverRequest('/pharmacy/dispensation/new', 'POST', data).then(function(response){
			$scope.reloadInventoryTable();
			$("#new_dispensation").modal("hide");
			var data = {
				resourceId: $scope.currentRequest.RequestID,
				status: -1,
				staff: utils.userSession.getID()
			};

			utils.serverRequest('/pharmacy/pharmacy-request/close', 'PUT', data).then(function(response){
				$rootScope.$broadcast("reloadRequests");
			}, function(error){
				utils.errorHandler(error);
			});

			var eventLog = patientEventLogger.pharmacy.newDispensationEvent(
				$scope.patient.id,
				0
			);
			eventLog.then(function(response){
				//patient registered event logged
			}, function(response){
				utils.errorHandler(response);
			});
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.close = function(){
		var data = {
			resourceId: $scope.currentRequestID,
			status: 1,
			staff: utils.userSession.getID()
		};

		utils.serverRequest('/pharmacy/pharmacy-request/close', 'PUT', data).then(function(response){
			$("#ack_view_modal").modal("hide");
			$scope.reloadDispensationsTable();
		}, function(error){
			utils.errorHandler(error);
		});
	}

	var createRequest = function(){
		var reqData = {
			patient: $scope.patient.id,
			requestBy: utils.userSession.getUUID(),
			items: $scope.dispensationItems
		}

		var request = utils.serverRequest("/accounts-biller/payment-request/new", "POST", reqData);

		request.then(function(response){
			utils.notify("Operation successful", "Request generated successfully", "success");
			var eventLog = patientEventLogger.accounts.newPaymentRequestEvent(
				$scope.patient.id,
				'Pharmacy',
				response.lastInsertId
			);
			eventLog.then(function(response){
				//patient registered event logged
			}, function(response){
				utils.errorHandler(response);
			});
			$scope.dispensationItems = [];
			$scope.patient = {};
		}, function(error){
			utils.errorHandler(error);

		})
	}

	$scope.generatePaymentRequest = function(){
		saveDispensation();
		createRequest();
	}

	$scope.manageDispensation = function(action, id){
		switch(action){
			case "view":{
				var items = $(".billing-type-pharm-btn[data-option-id='"+id+"'").attr("data-option-items");

				items = JSON.parse(items);

				$scope.currrentDispensedItems = items;
				$scope.currentRequestID = $(".billing-type-pharm-btn[data-option-id='"+id+"'").attr("data-request-id");
				utils.serverRequest("/pharmacy/pharmacy-request/view?resourceId="+$scope.currentRequestID, "GET")
				.then(function(response){
					$scope._currentRequest = response;
				}, function(error){
					utils.errorHandler(eror);
				});

				$("#ack_view_modal").modal("show");
				break;
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