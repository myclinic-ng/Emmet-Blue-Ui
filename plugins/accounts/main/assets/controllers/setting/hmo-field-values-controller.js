angular.module("EmmetBlue")

.controller("accountsBillingSettingHmoFieldValuesController", function($scope, utils){
	$scope.patientCategories = {};
	$scope.loadPatientCategories = function(){
		var requestData = utils.serverRequest("/patients/patient-type-category/view", "GET");
		requestData.then(function(response){
			$scope.patientCategories = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}

	$scope.loadPatientCategories();

	function tableAction(data, type, full, meta){
		var editButtonAction = "manageField('edit', "+data.FieldTitleID+")";
		var deleteButtonAction = "manageField('delete', "+data.FieldTitleID+")";

		var dataOpt = "data-option-id='"+data.FieldTitleID+"' data-option-name='"+data.FieldTitleName+"' data-option-description='"+data.FieldTitleDescription+"'";

		var editButton = "<button class='btn btn-default btn-field-values' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-edit'></i> Edit</button>";
		var deleteButton = "<button class='btn btn-default btn-field-values' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash'></i> Delete</button>";
		var viewButton = "<button class='btn btn-default btn-field-values'> View</button>";

		var buttons = "<div class='btn-group'>"+editButton+deleteButton+"</button>";
		return buttons;
	}

	$scope.settingsDtInstance = {};
	$scope.settingsDtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/hmo-field-title/view?resourceId='+$scope.currentPatientCategory, 'GET');
		return request;
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
			text: 'New Field',
			action: function(){
				$("#setting_new_field_value").modal("show");
			},
			key: {
        		key: 'n',
        		ctrlKey: false,
        		altKey: true
        	}
		}
	]);	

	$scope.settingsDtColumns = [
		utils.DT.columnBuilder.newColumn('FieldTitleID').withTitle("Field ID"),
		utils.DT.columnBuilder.newColumn('FieldTitleName').withTitle("Field Name"),
		utils.DT.columnBuilder.newColumn('FieldTitleType').withTitle("Field Type"),
		utils.DT.columnBuilder.newColumn('FieldTitleDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(tableAction).notSortable()
	];

	$scope.reloadTable = function(){
		$scope.settingsDtInstance.reloadData();
	}

	$scope.$watch('currentPatientCategory', function(newValue, oldValue){
		if (typeof $scope.currentPatientCategory !== 'undefined'){
			$scope.reloadTable();
		}
	})

	$scope.saveNewField = function(){
		var newField = $scope.newField;
		newField.patientCategory = $scope.currentPatientCategory;

		var saveNewField = utils.serverRequest('/accounts-biller/hmo-field-title/new', 'POST', newField);

		saveNewField.then(function(response){
			utils.notify("Operation successful", "submitted field has been registered successfully", "success");
			$scope.newField = {};
			$("#setting_new_field_value").modal("hide");
			$scope.reloadTable();
		}, function(response){
			utils.errorHandler(response);
		});
	}

	$scope.saveEditField = function(){
		var edits = {
			resourceId: $scope.tempHolder.id,
			FieldTitleName: $scope.tempHolder.name,
			FieldTitleDescription: $scope.tempHolder.description
		}

		var saveEdits = utils.serverRequest('/accounts-biller/hmo-field-title/edit', 'PUT', edits);
		saveEdits.then(function(response){
			utils.notify("Operation successful", "selected field has been updated", "success");
			$("#setting_edit_field_value").modal("hide");
			$scope.reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})

	}

	$scope.manageField = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				$("#setting_edit_field_value").modal("show");

				$scope.tempHolder = {};
				$scope.tempHolder.name = $(".btn-field-values[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.description = $(".btn-field-values[data-option-id='"+id+"']").attr('data-option-description');
				$scope.tempHolder.id = id;
				break;
			}
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to delete the field named "+$(".btn-field-values[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/accounts-biller/hmo-field-title/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation successful", "selected field has been deleted successfully", "success");
						$scope.reloadTable();
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
});