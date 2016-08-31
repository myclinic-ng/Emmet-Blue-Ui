angular.module("EmmetBlue")

.controller("accountsBillingGenerateNewBillingController", function($scope, utils){
	$scope.startWatching = false;
	$scope.$watch(function(){
		return utils.storage.billingType
	}, function(newValue){
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
	});

	$scope.itemList = [];
	$scope.priceTotal = 0;
	$scope.addItemToList = function(){
		var items = $scope.newBillingTypeItems;
		var itemInfo = $scope.billingTypeItemsInfo[items.item];

		if (typeof items.quantity == 'undefined'){
			items.quantity = 1;
		}

		var qty = items.quantity;

		if (itemInfo.IntervalBased == '1'){
			var id = itemInfo.BillingTypeItemID;
			var intervalRequest = utils.serverRequest("/accounts-biller/billing-type-items/view-item-intervals?resourceId="+id, 'GET');
			intervalRequest.then(function(response){
				var price = parseFloat(itemInfo.BillingTypeItemPrice);
				var totalPrice = 0;
				angular.forEach(response, function(value){
					var intervalCounter = parseInt(value.Interval);
					var intervalType = value.IntervalIncrementType;
					var intervalIncrement = parseFloat(value.IntervalIncrement);

					if (items.quantity > 0){
						switch(intervalType){
							case "additive":{
								var numberOfCounterDivision = items.quantity / intervalCounter;
								var numberOfCounterModulus = items.quantity % intervalCounter;
								for (var i = 1; i < numberOfCounterDivision; i++){
									price += intervalIncrement;
									totalPrice += price * intervalCounter;
								}

								price += intervalIncrement;
								totalPrice += price * numberOfCounterModulus;

								break;
							}
							case "multiplicative":{
								var numberOfCounterDivision = items.quantity / intervalCounter;
								var numberOfCounterModulus = items.quantity % intervalCounter;
								for (var i = 1; i < numberOfCounterDivision; i++){
									price *= intervalIncrement;
									totalPrice += price * intervalCounter;
								}

								price *= intervalIncrement;
								totalPrice += price * numberOfCounterModulus;

								break;
							}
							case "geometric":{
								var numberOfCounterDivision = items.quantity / intervalCounter;
								var numberOfCounterModulus = items.quantity % intervalCounter;
								for (var i = 1; i < numberOfCounterDivision; i++){
									price *= price;
									totalPrice += price * intervalCounter;
								}

								price *= price;
								totalPrice += price * numberOfCounterModulus;

								break;
							}
							case "custom":{
								if (items.quantity < intervalCounter){
									intervalCounter = items.quantity;
								}
								price += intervalIncrement;
								totalPrice += price * intervalCounter;

								items.quantity = items.quantity - intervalCounter;
								break;
							}
						}
					}
				});

				$scope.priceTotal += totalPrice;
				$scope.itemList.push({
					'itemName':itemInfo.BillingTypeItemName,
					'itemQuantity':qty,
					'itemPrice':totalPrice
				})

				$scope.newBillingTypeItems = {};
			}, function(responseObject){
				utils.errorHandler(responseObject);
			});
		}
		else
		{
			price = parseFloat(itemInfo.BillingTypeItemPrice) * items.quantity;

			$scope.priceTotal += price;
			$scope.itemList.push({
				'itemName':itemInfo.BillingTypeItemName,
				'itemQuantity':items.quantity,
				'itemPrice':price
			})

			$scope.newBillingTypeItems = {};
		}
	}

	$scope.showRateQuantity = false;
	$scope.showRateQuantityField = function(){
		$scope.showRateQuantity = true;
		var id = $scope.newBillingTypeItems.item;
		var itemInfo = $scope.billingTypeItemsInfo[id];

		$scope.currentItem = {
			rateIdentifier: itemInfo.RateIdentifier
		};
		if (itemInfo.RateBased == '1'){
			$scope.currentItem.rateBased = true;
		}
		else {
			$scope.currentItem.rateBased = false;
		}
	}

	$scope.generateBill = function(){
		console.log($scope.itemList, $scope.billStatus, $scope.priceTotal);
	}
})