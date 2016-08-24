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

		var price = parseFloat(itemInfo.BillingTypeItemPrice) * items.quantity

		$scope.priceTotal += price;
		$scope.itemList.push({
			'itemName':itemInfo.BillingTypeItemName,
			'itemQuantity':items.quantity,
			'itemPrice':price
		})
	}
})