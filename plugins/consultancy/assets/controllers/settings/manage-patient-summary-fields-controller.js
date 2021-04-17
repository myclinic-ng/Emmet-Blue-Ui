angular.module("EmmetBlue")

.controller("consultancySettingManagePatientSummaryFieldsController", function($scope, utils){
	function dtAction(data, full, meta, type){
		editButtonAction = "manage('edit',"+data.FieldID+")";
		deleteButtonAction = "manage('delete',"+data.FieldID+")";

		var dataOpt = "data-option-id='"+data.FieldID+
					"' data-option-name='"+data.FieldTitle+
					"' data-option-description='"+data.FieldDescription+
					"'";
		editButton = "<button class='btn btn-default btn-fields' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
		deleteButton = "<button class='btn btn-default btn-fields' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";

		return "<div class='btn-group'>"+editButton+deleteButton+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/patients/medical-summary/view-field', 'GET');
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
			text: '<i class="icon-file-plus"></i> New Field',
			action: function(){
				$('#new_setting_field').modal('show')
			}
		}
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('FieldID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('FieldTitle').withTitle("Field Name"),
		utils.DT.columnBuilder.newColumn("FieldDescription").withTitle("Field Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	function reloadTable(){
		if (typeof $scope.dtInstance.reloadData == 'function'){
			$scope.dtInstance.reloadData();
		}
	}

	$scope.saveNewField = function(){
		var data = $scope.newField;
		var request = utils.serverRequest("/patients/medical-summary/new-field", "POST", data);

		request.then(function(response){
			$('#new_setting_field').modal('hide');
			reloadTable();
			utils.notify("Operation Successful", "New Field Created Successfully", "success");
			$scope.newField = {};
		})
	}

	$scope.saveEditField = function(){
		var request = utils.serverRequest("/patients/medical-summary/edit-field", "PUT", $scope.tempHolder);

		request.then(function(response){
			$('#edit_setting_field').modal('hide');
			reloadTable();
			utils.notify("Operation Successful", "Field updated succesfully", "success");
			$scope.tempHolder = {};
		})
	}

	$scope.tempHolder = {};
	$scope.manage = function(value, id){
		switch(value)
		{
			case "edit":{
				$scope.tempHolder.resourceId = id;
				$scope.tempHolder.FieldTitle = $(".btn-fields[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.FieldDescription = $(".btn-fields[data-option-id='"+id+"']").attr('data-option-description');
				$('#edit_setting_field').modal('show');
				break;
			}
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to delete the Field titled "+$(".btn-fields[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/patients/medical-summary/delete-field?'+utils.serializeParams({
						'resourceId': id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "The selected field has been deleted successfully", "success");
						reloadTable();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
				break;
			}
		}
	}
})