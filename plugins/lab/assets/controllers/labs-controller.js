angular.module("EmmetBlue")

.controller("manageLabsController", function($scope, utils){
	var actions = function (data, type, full, meta){
		var editButtonAction = "manageLab('edit', "+data.LabID+")";
		var deleteButtonAction = "manageLab('delete', "+data.LabID+")";
		var fieldsButtonAction = "manageLab('fields', "+data.LabID+")";

		var dataOpt = "data-option-id='"+data.LabID+"' data-option-name='"+data.LabName+"' data-option-description='"+data.LabDescription+"'";

		var editButton = "<button class='btn btn-default billing-type-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='icon-pencil5'></i> </button>";
		var deleteButton = "<button class='btn btn-default billing-type-btn' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"><i class='icon-bin'></i> </button>";
		var fieldsButton = "<button class='btn btn-default' ng-click=\""+fieldsButtonAction+"\" "+dataOpt+"><i class='icon-eye'> </i> Fields</button>";
		
		var buttons = "<div class='btn-group'>"+editButton+deleteButton+fieldsButton+"</button>";
		return buttons;
	}
	
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var lab = utils.serverRequest('/lab/lab/view', 'GET');
		return lab;
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
			text: '<i class="icon-file-plus"></i> <u>N</u>ew Lab',
			action: function(){
				$("#new_lab").modal("show");
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
		utils.DT.columnBuilder.newColumn('LabID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('LabName').withTitle("Lab Name"),
		utils.DT.columnBuilder.newColumn('LabDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(actions).notSortable()
	];

	$scope.reloadLabsTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.manageLab = function(type, id){
		switch(type){
			case "edit":{
				$scope.tempLab = {
					resourceId: id,
					LabName: $("button[data-option-id='"+id+"'").attr("data-option-name"),
					LabDescription: $("button[data-option-id='"+id+"'").attr("data-option-description")
				}
				$("#edit_lab").modal("show");
				break;
			}
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to delete the lab named "+$("button[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/lab/lab/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "The specified lab has been deleted successfully", "success");
						$scope.reloadLabsTable();
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
				utils.storage.fieldsLabID = id;
				$("#lab_fields").modal("show");
				break;
			}
		}
	}

	$scope.saveNewLab = function(){
		var lab = $scope.newLab;

		var request = utils.serverRequest("/lab/lab/new", "POST", lab);
		request.then(function(response){
			utils.notify("Operation Successful", "New Lab created successfully", "success");
			$scope.reloadLabsTable();
			$("#new_lab").modal("hide");
			$scope.newLab = {};
		}, function(response){
			utils.errorHandler(response);
		})
	}

	$scope.saveEditedLab = function(){
		var lab = $scope.tempLab;

		var request = utils.serverRequest("/lab/lab/edit", "PUT", lab);
		request.then(function(response){
			utils.notify("Operation Successful", "New Lab updated successfully", "success");
			$scope.reloadLabsTable();
			$("#edit_lab").modal("hide");
			$scope.tempLab = {};
		}, function(response){
			utils.errorHandler(response);
		})
	}

	function loadLabs(){
		utils.serverRequest('/lab/lab/view', 'GET').then(function(response){
			$scope.lab = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	loadLabs();
})