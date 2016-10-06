angular.module("EmmetBlue")

.controller('pharmacyStoreManageStoresController', function($scope, utils){
	var actions = function (data, type, full, meta){
		var editButtonAction = "manageStore('edit', "+data.StoreID+")";
		var deleteButtonAction = "manageStore('delete', "+data.StoreID+")";
		// var itemManagementButtonAction = "manageStore('item-management', "+data.StoreID+")";

		var dataOpt = "data-option-id='"+data.StoreID+"' data-option-name='"+data.StoreName+"' data-option-description='"+data.StoreDescription+"'";

		var editButton = "<button class='btn btn-default billing-type-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='icon-pencil5'></i> </button>";
		var deleteButton = "<button class='btn btn-default billing-type-btn' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"><i class='icon-bin'></i> </button>";
		var viewButton = "<button class='btn btn-default'><i class='icon-eye'> </i> View</button>";
		// var itemManagementButton = "<button class='btn btn-default billing-type-btn' ng-click=\""+itemManagementButtonAction+"\" "+dataOpt+"><i class='icon-equalizer'></i> Manage Items</button>";

		var buttons = "<div class='btn-group'>"+editButton+deleteButton+"</button>";
		return buttons;
	}
	
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var stores = utils.serverRequest('/pharmacy/store/view', 'GET');
		return stores;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
	.withFixedHeader()
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
			text: '<i class="icon-file-plus"></i> <u>N</u>ew Store',
			action: function(){
				// functions.manageStore.newStore();
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
		utils.DT.columnBuilder.newColumn('StoreID').withTitle("ID").withOption('width', '0.5%'),
		utils.DT.columnBuilder.newColumn('StoreName').withTitle("Name"),
		utils.DT.columnBuilder.newColumn('StoreDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(actions).withOption('width', '25%').notSortable()
	];

	$scope.reloadStoresTable = function(){
		$scope.dtInstance.reloadData();
	}

	var manageStore = function(type, id){
		switch(type){
			case "edit":{
				alert("editing "+id);
			}
		}
	}
});