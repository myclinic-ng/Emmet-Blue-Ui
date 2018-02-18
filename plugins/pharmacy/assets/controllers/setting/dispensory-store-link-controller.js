angular.module("EmmetBlue")

.controller("pharmacySettingDispensoryStoreLinkingController", function($scope, utils){
	function loadDispensories(){
		var request = utils.serverRequest("/pharmacy/eligible-dispensory/view", "GET");
		request.then(function(result){
			$scope.dispensories = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	function loadStores(){
		var request = utils.serverRequest("/pharmacy/store/view", "GET");
		request.then(function(result){
			$scope.stores = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.dispensories = {};
	$scope.stores = {};
	$scope.currentDispensory;
	loadDispensories();
	loadStores();

	$scope.linkDtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/pharmacy/dispensory-store-link/view-by-dispensory?resourceId='+$scope.currentDispensory, 'GET');

		return request;
	})
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
			text: 'Link new store',
			action: function(){
				$("#new_setting_dispensory_store_link").modal("show");
			}
		},
        {
        	extend: 'print',
        	text: '<u>P</u>rint this data page'
        },
        {
        	extend: 'copy',
        	text: '<u>C</u>opy this data'
        }
    ]);

	$scope.linkDtColumns = [
		utils.DT.columnBuilder.newColumn('StoreName').withTitle("Linked store"),
		utils.DT.columnBuilder.newColumn('StoreDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(unlinkDispensoryAction).withOption('width', '25%').notSortable()
	]

	$scope.linkDtInstance = {};

	function unlinkDispensoryAction(data, type, full, meta){
		var link = "unlinkDispensory("+data.LinkID+")";

		return "<button class='btn btn-danger' ng-click='"+link+"'>Unlink</button>";
	}

	function reloadTable(){
		if (typeof $scope.linkDtInstance === "object"){
			$scope.linkDtInstance.reloadData();
		}
	}

	$scope.$watch('currentDispensory', function(newValue, oldValue){
		if (typeof $scope.currentDispensory !== 'undefined'){
			reloadTable();
		}
	})

	$scope.unlinkDispensory = function(dispensory){
		var request = utils.serverRequest('/pharmacy/dispensory-store-link/delete?resourceId='+dispensory, 'GET');

		request.then(function(response){
			utils.alert("Operation Successful", "The store has been unlinked", "success", "notify");

			reloadTable();
		}, function(error){
			utils.errorHandler(error);
		})
	}
	$scope.currentDispensory = "";
	$scope.currentStore = "";
	$scope.completeLinking = function(){
		var request = utils.serverRequest("/pharmacy/dispensory-store-link/new", "POST", {
			dispensory: $scope.currentDispensory,
			store: $scope.currentStore
		});

		console.log({
			dispensory: $scope.currentDispensory,
			store: $scope.currentStore
		});

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully linked a new store", "success", "notify");
			$("#new_setting_dispensory_store_link").modal("hide");
			reloadTable();
		}, function(response){
			utils.errorHandler(response);
		});
	}
});