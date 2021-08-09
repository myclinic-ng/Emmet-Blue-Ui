angular.module("EmmetBlue")

.controller('labInvestigationTypeFieldsController', function($scope, utils){
	$scope.ddtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var field = utils.serverRequest('/lab/investigation-type-field/view?resourceId='+$scope.investigationType, 'GET');
		return field;
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
    .withOption('order', [])
	.withButtons([
		{
			text: '<i class="icon-file-plus"></i> <u>N</u>ew Field',
			action: function(){
				$("#new_investigation_field").modal("show");
			},
			key: {
        		key: 'n',
        		ctrlKey: false,
        		altKey: true
        	}
		}
	]);	

	$scope.ddtColumns = [
		utils.DT.columnBuilder.newColumn(null).withTitle("Name").renderWith(function(data, type, full){
			var string = "<span class='text-bold'>"+data.FieldName+"</span><br/>"+data.TypeName;
			return string;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Reference Range").renderWith(function(data, type, full){
			var string = (data.FieldDescription).split("|");
			if (typeof string[0] !== "undefined"){
				return string[0];
			}
			return "";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Units").renderWith(function(data, type, full){
			var string = (data.FieldDescription).split("|");
			if (typeof string[1] !== "undefined"){
				return string[1];
			}
			return "";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(actions).notSortable()
	];

	$scope.ddtInstance = {};

	function actions(data, type, full){
		var editButtonAction = "manageField('edit', "+data.FieldID+")";
		var deleteButtonAction = "manageField('delete', "+data.FieldID+")";
		var fieldsButtonAction = "manageField('defaults', "+data.FieldID+")";

		var dataOpt = "data-option-id='"+data.FieldID+"' data-option-name='"+data.FieldName+"' data-option-description='"+data.FieldDescription+"' data-option-type='"+data.FieldType+"' data-option-type-name='"+data.TypeName+"'";

		var editButton = "<button class='btn btn-default investigation-field-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='icon-pencil5'></i> </button>";
		var deleteButton = "<button class='btn btn-default investigation-field-btn' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"><i class='icon-bin'></i> </button>";
		var fieldsButton = "<button class='btn btn-default' ng-click=\""+fieldsButtonAction+"\" "+dataOpt+"><i class='icon-eye'> </i> Default Values</button>";
		
		var buttons = "<div class='btn-group'>"+fieldsButton+editButton+deleteButton+"</button>";

		return buttons;
	}

	$scope.reloadFieldTable = function(){
		if (typeof $scope.ddtInstance.reloadData === "function"){
			$scope.ddtInstance.reloadData();
		}
	}
	$scope.$watch(function(){return utils.storage.fieldsInvestigationTypeID}, function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			$scope.investigationType = newValue;
			$scope.reloadFieldTable();
			$scope.editField = {};
		}
	});

	$scope.newField = {
		refrange: 'Ref. Range',
		units: 'Units',
		tags:[]
	}
	
	$scope.fieldTag = {
	};

	$scope.addTagToList = function(){
		$scope.newField.tags.push($scope.fieldTag);
		$scope.fieldTag = {};
	}

	$scope.saveNewField = function(){
		$scope.newField.refrange = $scope.newField.refrange.replace(">", "gt ");
		$scope.newField.refrange = $scope.newField.refrange.replace("<", "lt ");
		var field = {
			"investigationType":$scope.investigationType,
			"fieldType":$scope.newField.type,
			"name":$scope.newField.name,
			"description":$scope.newField.refrange + " | " + $scope.newField.units
		}

		var request = utils.serverRequest("/lab/investigation-type-field/new", "POST", field);
		request.then(function(response){
			utils.notify("Operation Successful", "New field created successfully", "success");
			$("#new_investigation_field").modal("hide");
			$scope.reloadFieldTable();
			$scope.newField = {};
		}, function(response){
			utils.errorHandler(response);
		})
	}

	$scope.updateField = function(){
		$scope.editField.refrange = $scope.editField.refrange.replace(">", "gt ");
		$scope.editField.refrange = $scope.editField.refrange.replace("<", "lt ");
		var field = {
			"FieldType":$scope.editField.type,
			"FieldName":$scope.editField.name,
			"FieldDescription":$scope.editField.refrange + " | " + $scope.editField.units,
			"resourceId":$scope.editField.fieldId
		}

		var request = utils.serverRequest("/lab/investigation-type-field/edit", "PUT", field);
		request.then(function(response){
			utils.notify("Operation Successful", "Field updated successfully", "success");
			$("#edit_investigation_field").modal("hide");
			$scope.reloadFieldTable();
			$scope.editField = {};
		}, function(response){
			utils.errorHandler(response);
		})
	}


	$scope.saveNewDefaultValue = function(){
		var value = {
			"field":$scope.currentDefaultValuesField,
			"value":$scope.newDefaultValue
		}

		var request = utils.serverRequest("/lab/investigation-type-field/new-default-value", "POST", value);
		request.then(function(response){
			utils.notify("Operation Successful", "New default value registered successfully", "success");
			$scope.manageField("defaults", $scope.currentDefaultValuesField);
			$scope.newDefaultValue = "";
		}, function(response){
			utils.errorHandler(response);
		})
	}

	$scope.deleteDefaultValue = function(id, index){
		utils.serverRequest('/lab/investigation-type-field/delete-default-value?resourceId='+id, 'DELETE').then(function(response){
			$scope.currentDefaultValues.splice(index, 1);
			utils.alert("Operation successful", "The delete request has been processed successfully", "success", "notify");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	function loadFieldTypes(){
		utils.serverRequest('/lab/investigation-type-field/view-field-types', 'GET').then(function(response){
			$scope.fieldTypes = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	loadFieldTypes();

	$scope.manageField = function(val, id){
		switch(val){
			case "defaults":{
				if (typeof id !== "undefined"){
					utils.serverRequest('/lab/investigation-type-field/view-default-values?resourceId='+id, 'GET').then(function(response){
						$scope.currentDefaultValues = response;
						$scope.currentDefaultValuesField = id;
					}, function(error){
						utils.errorHandler(error);
					})
					$("#field_defaults").modal("show");
				}
				break;
			}
			case "delete":{
				if (typeof id !== "undefined"){
					var title = "Delete Prompt";
					var text = "Do you want to continue? Please note that this action cannot be undone";
					var close = true;
					var callback = function(){
						utils.serverRequest('/lab/investigation-type-field/delete?resourceId='+id, 'DELETE').then(function(response){
							$scope.reloadFieldTable();
						}, function(error){
							utils.errorHandler(error);
						})
					}
					var type = "warning";
					var btnText = "Delete";

					utils.confirm(title, text, close, callback, type, btnText);
				}
				break;
			}
			case "edit":{
				if (typeof id !== "undefined"){
					var string = ($(".investigation-field-btn[data-option-id='"+id+"']").attr('data-option-description')).split("|");
					$scope.editField = {
						name:$(".investigation-field-btn[data-option-id='"+id+"']").attr('data-option-name'),
						refrange:string[0],
						units:string[1],
						type:$(".investigation-field-btn[data-option-id='"+id+"']").attr('data-option-type'),
						typeName:$(".investigation-field-btn[data-option-id='"+id+"']").attr('data-option-type-name'),
						fieldId: id
					}

					$("#edit_investigation_field").modal("show");
				}
				break;
			}
		}
	}
});