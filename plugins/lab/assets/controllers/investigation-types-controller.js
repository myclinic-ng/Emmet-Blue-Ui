angular.module("EmmetBlue")

.controller('labInvestigationTypesController', function($scope, utils){
	var actions = function (data, type, full, meta){
		var editButtonAction = "manageInvestigationType('edit', "+data.InvestigationTypeID+")";
		var deleteButtonAction = "manageInvestigationType('delete', "+data.InvestigationTypeID+")";
		var fieldsButtonAction = "manageInvestigationType('fields', "+data.InvestigationTypeID+")";

		var dataOpt = "data-option-id='"+data.InvestigationTypeID+"' data-option-name='"+data.InvestigationTypeName+"' data-option-description='"+data.InvestigationTypeDescription+"'";

		var editButton = "<button class='btn btn-default billing-type-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='icon-pencil5'></i> </button>";
		var deleteButton = "<button class='btn btn-default billing-type-btn' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"><i class='icon-bin'></i> </button>";
		var fieldsButton = "<button class='btn btn-default' ng-click=\""+fieldsButtonAction+"\" "+dataOpt+"><i class='icon-eye'> </i> Fields</button>";
		
		var buttons = "<div class='btn-group'>"+editButton+deleteButton+fieldsButton+"</button>";
		return buttons;
	}
	
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var investigationTypes = utils.serverRequest('/lab/investigation-type/view', 'GET');
		return investigationTypes;
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
			text: '<i class="icon-file-plus"></i> <u>N</u>ew Investigation Type',
			action: function(){
				$("#new_investigation_type").modal("show");
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
		utils.DT.columnBuilder.newColumn('InvestigationTypeID').withTitle("ID").withOption('width', '0.5%'),
		utils.DT.columnBuilder.newColumn('InvestigationTypeName').withTitle("Name"),
		utils.DT.columnBuilder.newColumn('LabName').withTitle("Lab"),
		utils.DT.columnBuilder.newColumn('InvestigationTypeDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(actions).withOption('width', '25%').notSortable()
	];

	$scope.reloadInvestigationTypesTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.manageInvestigationType = function(type, id){
		switch(type){
			case "edit":{
				$scope.tempInvestigationType = {
					resourceId: id,
					InvestigationTypeName: $("button[data-option-id='"+id+"'").attr("data-option-name"),
					InvestigationTypeDescription: $("button[data-option-id='"+id+"'").attr("data-option-description")
				}
				$("#edit_investigation_type").modal("show");
				break;
			}
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to delete the investigationType named "+$("button[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/lab/investigation-type/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "The specified investigation type has been deleted successfully", "success");
						$scope.reloadInvestigationTypesTable();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
				break;
			}
			case "fields":{
				utils.storage.fieldsInvestigationTypeID = id;
				$("#investigation_type_fields").modal("show");
				break;
			}
		}
	}

	$scope.saveNewInvestigationType = function(){
		var investigationType = $scope.newInvestigationType;

		var request = utils.serverRequest("/lab/investigation-type/new", "POST", investigationType);
		request.then(function(response){
			utils.notify("Operation Successful", "New Investigation Type created successfully", "success");
			$scope.reloadInvestigationTypesTable();
			$("#new_investigation_type").modal("hide");
			$scope.newInvestigationType = {};
		}, function(response){
			utils.errorHandler(response);
		})
	}

	$scope.saveEditedInvestigationType = function(){
		var investigationType = $scope.tempInvestigationType;

		var request = utils.serverRequest("/lab/investigation-type/edit", "PUT", investigationType);
		request.then(function(response){
			utils.notify("Operation Successful", "New Investigation Type updated successfully", "success");
			$scope.reloadInvestigationTypesTable();
			$("#edit_investigation_type").modal("hide");
			$scope.tempInvestigationType = {};
		}, function(response){
			utils.errorHandler(response);
		})
	}

	function loadLabs(){
		utils.serverRequest('/lab/lab/view', 'GET').then(function(response){
			$scope.labs = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	loadLabs();
});