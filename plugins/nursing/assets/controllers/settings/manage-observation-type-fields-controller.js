angular.module("EmmetBlue")

.controller("nursingSettingManageObservationTypeFieldsController", function($scope, utils){
	function dtAction(data, full, meta, type){
		editButtonAction = "manage('edit',"+data.FieldID+")";
		deleteButtonAction = "manage('delete',"+data.FieldID+")";
		var fieldsButtonAction = "manage('defaults', "+data.FieldID+")";

		var dataOpt = "data-option-id='"+data.FieldID+
					"' data-option-name='"+data.FieldName+
					"' data-option-description='"+data.FieldDescription+
					"'";
		editButton = "<button class='btn btn-default btn-fields' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
		deleteButton = "<button class='btn btn-default btn-fields' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";
		fieldsButton = "<button class='btn btn-default' ng-click=\""+fieldsButtonAction+"\" "+dataOpt+"><i class='icon-eye'> </i> Default Values</button>";

		return "<div class='btn-group'>"+fieldsButton+editButton+deleteButton+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/nursing/observation-type-field/view?resourceId='+$scope.currentObservationType, 'GET');
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
				$('#new_setting_observation_type_field').modal('show')
			}
		}
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('FieldID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('FieldName').withTitle("Field Name"),
		utils.DT.columnBuilder.newColumn("FieldDescription").withTitle("Field Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}

	function loadObservationTypes(){
		var request = utils.serverRequest("/nursing/observation-type/view", "GET");

		request.then(function(response){
			$scope.observationTypes = response
		}, function(error){
			utils.errorHandler(error);
		});
	}
	loadObservationTypes();

	function loadFieldTypes(){
		var request = utils.serverRequest("/nursing/observation-type-field/view-types", "GET");

		request.then(function(response){
			$scope.fieldTypes = response
		}, function(error){
			utils.errorHandler(error);
		});
	}
	loadFieldTypes();

	$scope.$watch("currentObservationType", function(nv){
		reloadTable();
	})

	$scope.saveNewObservationTypeField = function(){
		var data = $scope.newObservationTypeField;
		data.observationType = $scope.currentObservationType;
		var request = utils.serverRequest("/nursing/observation-type-field/new", "POST", data);

		request.then(function(response){
			$('#new_setting_observation_type_field').modal('hide');
			reloadTable();
			utils.notify("Operation Successful", "New Field Created Successfully", "success");
			$scope.newObservationTypeField = {};
		})
	}

	$scope.saveEditObservationTypeField = function(){
		var request = utils.serverRequest("/nursing/observation-type-field/edit", "PUT", $scope.tempHolder);

		request.then(function(response){
			$('#edit_setting_observation_type_field').modal('hide');
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
				$scope.tempHolder.FieldName = $(".btn-fields[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.FieldDescription = $(".btn-fields[data-option-id='"+id+"']").attr('data-option-description');
				$('#edit_setting_observation_type_field').modal('show');
				break;
			}
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to delete the Field titled "+$(".btn-fields[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/observation-type-field/delete?'+utils.serializeParams({
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
			case "defaults":{
				if (typeof id !== "undefined"){
					utils.serverRequest('/nursing/observation-type-field-default/view?resourceId='+id, 'GET').then(function(response){
						$scope.currentDefaultValues = response;
						$scope.currentDefaultValuesField = id;
					}, function(error){
						utils.errorHandler(error);
					})
					$("#field_defaults").modal("show");
				}
				break;
			}
		}
	}

	$scope.saveNewDefaultValue = function(){
		var value = {
			"field":$scope.currentDefaultValuesField,
			"value":$scope.newDefaultValue
		}

		var request = utils.serverRequest("/nursing/observation-type-field-default/new", "POST", value);
		request.then(function(response){
			utils.notify("Operation Successful", "New default value registered successfully", "success");
			$scope.manage("defaults", $scope.currentDefaultValuesField);
			$scope.newDefaultValue = "";
		}, function(response){
			utils.errorHandler(response);
		})
	}

	$scope.deleteDefaultValue = function(id, index){
		utils.serverRequest('/nursing/observation-type-field-default/delete?resourceId='+id, 'DELETE').then(function(response){
			$scope.currentDefaultValues.splice(index, 1);
			utils.alert("Operation successful", "The delete request has been processed successfully", "success", "notify");
		}, function(error){
			utils.errorHandler(error);
		})
	}
})