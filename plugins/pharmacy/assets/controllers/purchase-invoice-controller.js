angular.module("EmmetBlue")

.controller('pharmacyPurchaseInvoiceController', function($scope, utils, patientEventLogger, $rootScope){
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
		description: 'Current Months\'s Invoices',
		value: $scope.getDateRange("month")
	}

	$scope.createdFilters = [];
	$scope.createdFilters.push($scope.requestFilter);

	$scope.dateRange = $scope.getDateRange("month");

	$scope.$watch("dateRange", function(nv){
		var dates = nv.split(" - ");
		if (dates[0] == dates[1]){
			$scope.requestFilter = {
				type: "nil",
				description: "All transfers on "+(new Date(dates[0])).toDateString(),
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

		$scope.reloadLogTable(true);
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

        var datum = {
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
			datum.keywordsearch = data[5].value.value;
		}

		for (var i = filter.length - 1; i >= 1; i--) {
			var _filter = filter[i];
			if (_filter.use){
				datum.query.push({
					type:_filter.type,
					value:_filter.value
				});	
			}
		}

        var url = '/pharmacy/purchase-log/view';

		var transfers = utils.serverRequest(url, 'POST', datum);
		transfers.then(function(response){
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
        	text: '<i class="icon-new"></i> <u>N</u>ew Invoice Log',
        	key: {
        		key: 'n',
        		ctrlKey: false,
        		altKey: true
        	},
        	action: function(){
        		$("#new_purchase_log").modal("show");	
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
		utils.DT.columnBuilder.newColumn(null).withTitle("Invoice No.").renderWith(function(data){
			if (data.InvoiceNumber == null){
				data.InvoiceNumber = "N/A";
			}
			return "<span>"+data.InvoiceNumber+"</span>"
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Item").renderWith(function(data){
			return "<span class='text-bold'>"+data.BillingTypeItemName+
					"</span> <br/> <span class='text-size-small'>Brand: "+data.ItemBrand;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Vendor").renderWith(function(data){
			if (data.VendorAddress == null){
				data.VendorAddress = "";
			}

			return "<span>"+data.VendorName+
					"</span> <br/> <span class='text-size-small text-muted'>"+data.VendorAddress;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Cost Price").renderWith(function(data){
			return "<span ng-currency ng-currency-symbol='naira'></span>"+"<span>"+data.ItemCostPrice+"</span>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Purchased Quantity").renderWith(function(data){
			return "<span>"+data.ItemQuantity+"</span>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Purchased By").renderWith(function(data){
			return "<span>"+data.ItemBuyee+"</span>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Purchased Date").renderWith(function(data){
			return (new Date(data.ItemPurchaseDate)).toDateString();
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Logged By").renderWith(function(data, full, meta){
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
		utils.DT.columnBuilder.newColumn(null).withTitle("Date Logged").renderWith(function(data, a, b){
			return (new Date(data.DateCreated)).toDateString()+"<br/>"+(new Date(data.DateCreated)).toLocaleTimeString();
		})
	];

	$scope.reloadLogTable = function(applyToFirstIndex=false){
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
			case "dateRange":{
				$scope.requestFilter.type = "date";
				var value = selector.value.split(" - ");
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Date Ranges Between: "+ new Date(value[0]).toDateString()+" And "+ new Date(value[1]).toDateString();
				$scope.reloadLogTable(true);
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
						$scope.reloadLogTable();
					}
					else {
						utils.notify("Invalid Staff Username", "Please enter a valid username to continue", "warning");
					}
				}, function(error){
					utils.errorHandler(error);
				})
				break;
			}
			case "invoice number":{
				$scope.requestFilter.type = "invoicenumber";
				var value = selector.value;
				$scope.requestFilter.value = value;
				$scope.requestFilter.description = "Invoice Number: '"+value+"'";
				$scope.reloadLogTable();
				break;
			}
			case "item code":{
				$scope.requestFilter.type = "itemcode";
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Item Code: '"+selector.value+"'";
				$scope.reloadLogTable();
				break;
			}
			default:{
				$scope.requestFilter.type = "date";
				var value = selector.type.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = value[0];
				$scope.reloadLogTable();
			}
		}
	}

	function loadInventoryItems(){
		var request = utils.serverRequest("/pharmacy/store-inventory/view", "GET");

		request.then(function(response){
			$scope.inventoryItems = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadInventoryItems();

	function loadVendors(){
		var request = utils.serverRequest("/financial-accounts/corporate-vendor/view", "GET");

		request.then(function(response){
			$scope.corporateVendors = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadVendors();

	$scope.listItem = {};
	$scope.newItem = {};

	$scope.newItem.items = [];

	$scope.addItemToInvoice = function(){
		var item = $scope.listItem;
		selector = item.itemSelector.split("|");
		item.item = selector[1];
		item._item = selector[0];
		$scope.newItem.items.push(item);
		$scope.listItem = {};
	}

	$scope.removeItemFromInvoice = function(index){
		$scope.newItem.items.splice(index, 1);
	}

	$scope.saveInvoice = function(){
		var data = $scope.newItem;
		data.staff = utils.userSession.getID();

		var request = utils.serverRequest("/pharmacy/purchase-log/new", "POST", data);
		request.then(function(response){
			if (response){
				utils.notify("Operation Successful", "Invoice has been logged successfully", "success");
				$("#new_purchase_log").modal("hide");
				$scope.reloadLogTable();
			}
			else {
				utils.notify("An error occurred", "Please try again", "error");
			}
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.newVendorData = {}
	$scope.addNewVendor = function(){
		var req = utils.serverRequest("/financial-accounts/corporate-vendor/new", "POST", $scope.newVendorData);
		req.then(function(response){
			if (response){
				utils.notify("Operation Successful", "Vendor has been registered successfully", "success");
				$("#add_new_vendor").modal("hide");
				loadVendors();
				$scope.newVendorData = {};
			}
			else {
				utils.notify("An error occurred", "Please try again", "error");
			}
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.newProduct = {
		"billing":{},
		"price":0,
		"inventory":{}
	};

	$scope.addNewProduct = function(){
		var req = utils.serverRequest("/pharmacy/purchase-log/register-new-item", "POST", $scope.newProduct);
		req.then(function(response){
			if (response){
				utils.notify("Operation Successful", "Item has been registered successfully", "success");
				$("#add_new_item").modal("hide");
				loadInventoryItems();
				$scope.newProduct = {
					"billing":{},
					"price":0,
					"inventory":{}
				};
			}
			else {
				utils.notify("An error occurred", "Please try again", "error");
			}
		}, function(error){
			utils.errorHandler(error);
		});
	}
});