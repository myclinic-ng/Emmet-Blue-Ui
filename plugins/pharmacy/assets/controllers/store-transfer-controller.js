angular.module("EmmetBlue")

.controller("pharmacyStoreTransferController", function($scope, utils, $rootScope){
	function viewStores(){
		var request = utils.serverRequest("/pharmacy/store/view", "GET");

		request.then(function(response){
			$scope._stores = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	viewStores();

	if (typeof utils.storage.inventoryStoreID != "undefined"){
		$scope.storeID = utils.storage.inventoryStoreID;
		loadStores();
	}

	$scope.globalRestockItems = [];
	$scope.inventoryItemsDetails = [];

	function loadStores(){
		var storeInventory = utils.serverRequest('/pharmacy/store-inventory/view-by-store?resourceId='+$scope.receivingStore, 'GET');

		storeInventory.then(function(response){
			$scope.inventoryItems = response;
			for (var i = 0; i < response.length; i++){
				$scope.inventoryItemsDetails[response[i].ItemID] = response[i];
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.itemBrandIsNull = function(brand){
		return brand == "" || brand == null;
	}	

	$scope.$watch(function(){return utils.storage.inventoryStoreID}, function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			$scope.storeID = newValue;
		}
	});

	$scope.$watch(function(){
		return $scope.receivingStore
	}, function(nv){
		loadStores();
	})

	$scope.addStockToList = function(){
		if (typeof $scope.stock.quantity == "undefined" || $scope.stock.quantity <= 0){
			utils.notify("Seems like you've not entered a valid value for the quantity field", "Item quantity must be greater than 0", "warning");
		}
		else {
			angular.forEach($scope.stock.selectedItems, function(value){
				var data = {};
				data.item = value;
				data.quantityAdded = $scope.stock.quantity;
				data.quantityBefore = $scope.inventoryItemsDetails[value].ItemQuantity;
				data.itemName = $scope.inventoryItemsDetails[value].BillingTypeItemName;
				if (!$scope.itemBrandIsNull($scope.inventoryItemsDetails[value].ItemBrand)){
					data.itemName += " ("+$scope.inventoryItemsDetails[value].ItemBrand+")";
				}
				$scope.globalRestockItems.push(data);
			})
			$scope.stock = {};
			$("#selectedItems").select2("val", "");
		}
	}

	$scope.removeFromList = function(index){
		$scope.globalRestockItems.splice(index, 1);
	}

	$scope.stock = {global: false};
	$scope.save = function(){
		var data = {};

		data.items = $scope.globalRestockItems;
		data.comment = $scope.stockNote;
		data.staffId = utils.userSession.getID();
		data.globalRestock = $scope.stock.global;
		data.storeId = $scope.storeID;

		var req = utils.serverRequest('/pharmacy/store-restock-history/new', 'POST', data);

		req.then(function(response){
			utils.alert("Inventory Items Updated", "You have just updated the inventory items database successfully", "success");
			$scope.globalRestockItems = [];
			$scope.stock = {global: false};
			$rootScope.$broadcast("reloadStats");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.storeTransfer = function(){
		var data = {};

		data.items = $scope.globalRestockItems;
		data.staffId = utils.userSession.getID();
		data.storeId = $scope.storeID;
		data.receivingStore = $scope.receivingStore;

		var req = utils.serverRequest('/pharmacy/store-transfer/new', 'POST', data);

		req.then(function(response){
			utils.alert("Inventory Items Transferred", "You have just updated the inventory items database successfully", "success");
			$scope.stock = {global: false};
			$rootScope.$broadcast("reloadStats");
		}, function(error){
			utils.errorHandler(error);
		})
	}
})