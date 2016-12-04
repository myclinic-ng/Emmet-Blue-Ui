angular.module("EmmetBlue")

.controller('pharmacyDashboardStoreInventoryController', function($scope, utils){
	function loadStores(){
		var request = utils.serverRequest("/pharmacy/store/view", "GET");

		request.then(function(response){
			$scope.stores = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadStores();

	$scope.$watch("selectedStore", function(nv){
		utils.storage = {
			inventoryStoreID: nv
		}
	});
});