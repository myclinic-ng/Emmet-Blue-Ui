angular.module("EmmetBlue")

.controller('pharmacyStandaloneDispensoryDispensationController', function($scope, utils, patientEventLogger, $rootScope){
	$scope.currentStore = {};
	$scope.customerName = "";
	$scope.patient = {};
	function loadDefaultDispensoryAndStore(){
		var request = utils.serverRequest("/pharmacy/store/get-default-store-and-dispensory", "GET");
		request.then(function(result){
			$scope.defaultStoreLink = result;
			$scope.currentStore = {
				name: result.StoreName,
				id: result.Store
			};

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

	loadDefaultDispensoryAndStore();

	$scope.$watch(function(){
		return $scope.currentStore.id;
	}, function(newValue){
		if (typeof newValue !== "undefined"){
			$scope.reloadInventoryTable();
			$scope.$broadcast("storeLoaded");
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

        var url = '/pharmacy/store-inventory/view-available-items-by-store?resourceId='+$scope.currentStore.id+'&paginate&from='+start+'&size='+length;
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
			if (typeof data.Tags !== "undefined"){
				for (var i = 0; i < data.Tags.length; i++) {
					invisible += data.Tags[i].TagTitle+": "+data.Tags[i].TagName+" ";
					string += "<h6 class='display-block'><span class='label label-info text-muted pull-left' style='border-right:0px !important;'>"+data.Tags[i].TagTitle+"</span><span class='label label-warning pull-left' style='border-left:0px !important;'> "+data.Tags[i].TagName+"</span></h6><br/><br/>";
				}
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
		var _p = 0;
		var _q = $scope.currentItem.quantity;
		var _id = $scope.currentItem.itemID;
		var _it = $scope.currentItem.Item;

		utils.serverRequest("/accounts-biller/get-item-price/calculate?resourceId="+_p+"&item="+_i+"&quantity="+_q, "GET")
		.then(function(response){
			$scope.dispensationItems.push({
				Item: _it,
				ItemCode: _i,
				item: _i,
				itemID: _id,
				price: response.totalPrice,
				quantity: _q
			});
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
			eligibleDispensory: $scope.defaultStoreLink.Dispensory,
			dispensingStore: $scope.currentStore.id,
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
		}, function(error){
			utils.errorHandler(error);
		})
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
			var requestId = response.lastInsertId;

			generateInvoice(requestId);

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
		}, function(error){
			utils.errorHandler(error);

		})
	}

	var registerCustomerAndSaveRequest = function(){
		var names = $scope.customerName.split(" ");
		var firstname = names[0];
		var lastname = "";
		if (names.length > 1){
			names[0] = "";
			lastname = names.join(" ");
		}

		var newPatient = {
			'First Name': firstname,
			'Last Name': lastname,
			'patientName': $scope.customerName,
			'patientType': 1,
			'createdBy':utils.userSession.getID()
		};

		var request = utils.serverRequest("/patients/patient/new", "POST", newPatient);
		request.then(function(response){
			if (typeof response.lastInsertId !== "undefined"){
				$scope.patient.id = response.lastInsertId;
				saveDispensation();
				createRequest();

				$scope.customerName = "";
			}
		}, function(error){
			utils.errorHandler(error);
		});
	}

	var generateInvoice = function(paymentRequestId, acceptPayment){
		$scope.requestId = paymentRequestId;
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
				type: "deptName",
				createdBy: utils.userSession.getUUID(),
				status: 'Payment Request',
				amount: response.globalTotal,
				items: response,
				patient: $scope.patient.id
			}

			if (acceptPayment){
				var request = utils.serverRequest("/accounts-biller/transaction-meta/new", "POST", data);

				request.then(function(response){
					var lastInsertId = response.lastInsertId;

					if (lastInsertId){
						var edits = {
							AttachedInvoice: lastInsertId,
							RequestFulfillmentStatus: -1,
							resourceId: $scope.requestId
						};

						$scope.cTxNum = response.transactionNumber;

						if (acceptPayment){
							$("#accept_new_payment").modal("show");

							utils.serverRequest("/accounts-biller/payment-request/edit?resourceId="+$scope.requestId, "PUT", edits)
							.then(function(response){
								utils.notify("Info", "An invoice has been generated successfully for this payment request and request status has been updated", "success");
								utils.storage.currentInvoiceNumber = $scope.cTxNum;
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

	$scope.generatePaymentRequest = function(){
		registerCustomerAndSaveRequest();
	}
});