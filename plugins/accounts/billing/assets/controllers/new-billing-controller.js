angular.module("EmmetBlue")

.controller("accountsBillingGenerateNewBillingController", function($scope, utils){
	var billingTypes = utils.serverRequest('/accounts-biller/billing-type/view', 'GET');
	
	billingTypes.then(function(response){
		$scope.billingItems = response;
	}, function(response){
		utils.errorHandler(response);
	});

	$scope.setBillingTypeID = function(){
		utils.storage.billingType = $scope.billingTypeId;
	}

	$scope.startWatching = false;
	$scope.$watch(function(){
		return $scope.billingTypeId;
	}, function(newValue){
		if (typeof newValue !== "undefined"){
			newValue = JSON.parse(newValue);
			$scope.billingType = newValue;
			var billingTypeItems = utils.serverRequest('/accounts-biller/billing-type-items/view?resourceId='+newValue.BillingTypeID, 'GET');
			billingTypeItems.then(function(response){
				$scope.billingTypeItems = response;
				$scope.billingTypeItemsInfo = [];
				angular.forEach(response, function(val, key){
					$scope.billingTypeItemsInfo[val.BillingTypeItemID] = val;
				})

			}, function(response){
				utils.errorHandler(response);
			})

			var transactionStatus = utils.serverRequest('/accounts-biller/transaction-status/view', 'GET');
			transactionStatus.then(function(response){
				$scope.statuses = response;
			}, function(response){
				utils.errorHandler(response);
				
			}) 

			if (!$scope.startWatching){
				$scope.startWatching = true;
			}
			else{
			}
		}
	});

	var patientRequest = utils.serverRequest("/patients/patient/view", "GET");
	patientRequest.then(function(response){
		$scope.patients = response;

		angular.forEach(response, function(val, key){
			$scope.patients[key]["PatientFullName"] = val.PatientFirstName + " " + val.PatientLastName;
		});
	}, function(response){
		utils.errorHandler(response);
	});

	$scope.show_name = false;
	$scope.show_phone = false;
	$scope.show_number = true;

	$scope.patient = "";

	$scope.filterOption = function(option){
		if (option == "name"){
			$scope.show_name = true;
			$scope.show_phone = false;
			$scope.show_number = false;
		}
		if (option == "phone"){
			$scope.show_name = false;
			$scope.show_phone = true;
			$scope.show_number = false;
		}
		if (option == "number"){
			$scope.show_name = false;
			$scope.show_phone = false;
			$scope.show_number = true;
		}
	}

	$scope.itemList = [];
	$scope.priceTotal = 0;
	$scope.addItemToList = function(){
		var items = $scope.newBillingTypeItems;
		var patient = $scope.patient;

		var requestPrice = utils.serverRequest(
			"/accounts-biller/get-item-price/calculate?resourceId="+patient+"&item="+items.item+"&quantity="+items.quantity,
			"GET"
		);

		requestPrice.then(function(response){
			$scope.priceTotal += response.totalPrice;
			$scope.newBillingTypeItems;
			var data = {
				itemName: $scope.billingTypeItems[0].BillingTypeItemName,
				itemCode: $scope.newBillingTypeItems.item,
				itemQuantity: $scope.newBillingTypeItems.quantity,
				itemPrice: response.totalPrice
			}

			$scope.itemList.push(data);
			$scope.newBillingTypeItems = {}
		}, function(response){
			utils.errorHandler(response);
		})
	}

	$scope.removeFromItemList = function(id, data){
		$scope.priceTotal -= data.itemPrice;
		$scope.itemList.splice(id, 1);
	}

	$scope.showRateQuantity = false;
	$scope.showRateQuantityField = function(){
		$scope.showRateQuantity = true;
		var id = $scope.newBillingTypeItems.item;
		var patient = $scope.patient;

		var sendRequest = utils.serverRequest('/accounts-biller/billing-type-items/is-rate-based?resourceId='+patient+'&item='+id, 'GET');
		sendRequest.then(function(response){
			switch((response.rateIdentifier).toLowerCase()){
				case "daily":{
					response.rateIdentifier = "Day";
					break;
				}
			}
			$scope.currentItem = {
				rateIdentifier: response.rateIdentifier
			};
			if (response.rateBased == '1'){
				$scope.currentItem.rateBased = true;
			}
			else {
				$scope.currentItem.rateBased = false;
			}
		})
	}

	$scope.generateBill = function(){
		var data = {
			type: $scope.billingType.BillingTypeName,
			createdBy: 'fb7cc895996f28a4d9ac',
			status: $scope.billStatus,
			amount: $scope.priceTotal,
			items: $scope.itemList,
			patient: $scope.patient
		}

		var request = utils.serverRequest("/accounts-biller/transaction-meta/new", "POST", data);

		request.then(function(response){
			var lastInsertId = response.lastInsertId;

			if (lastInsertId){
				utils.alert("Info", "Bill Saved Successfully", "success");
			}
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
})