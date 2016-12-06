angular.module("EmmetBlue")

.controller("pharmacyStoreManagementSegmentController", function($scope, utils){
	var statistics = {
		loadDaysSinceLastRestock: function(){
			var req = utils.serverRequest('/pharmacy/statistics/days-since-last-global-restock?resourceId='+$scope.storeID, 'GET');

			req.then(function(response){
				$scope.statistics.daysSinceLastRestock = response;
			}, function(error){
				utils.errorHandler(error);
			})
		},

		getItemQuantityOfLastRestock: function(){
			var req = utils.serverRequest('/pharmacy/statistics/item-quantity-during-last-restock?resourceId='+$scope.storeID, 'GET');

			req.then(function(response){
				$scope.statistics.itemQuantityOfLastRestock = response;
			}, function(error){
				utils.errorHandler(error);
			})
		},

		getItemLeftInStore: function(){
			var req = utils.serverRequest('/pharmacy/statistics/total-item-count-in-store?resourceId='+$scope.storeID, 'GET');

			req.then(function(response){
				$scope.statistics.itemLeftInStore = response;
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}

	function init(){
		$scope.statistics = {};
		$scope.statistics.daysSinceLastRestock = $scope.statistics.itemQuantityOfLastRestock = $scope.statistics.itemLeftInStore = "<i class='fa fa-spinner fa-spin'></i>";
		bootstrap();
	}

	function bootstrap(){
		statistics.loadDaysSinceLastRestock();
		statistics.getItemQuantityOfLastRestock();
		statistics.getItemLeftInStore();
	}

	$scope.$on("reloadStats", function(){
		init();
	})

	$scope.$watch(function(){return utils.storage.inventoryStoreID}, function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			$scope.storeID = newValue;
			init();
		}
	});

	if (typeof utils.storage.inventoryStoreID != "undefined"){
		$scope.storeID = utils.storage.inventoryStoreID;
		init();
	}
})