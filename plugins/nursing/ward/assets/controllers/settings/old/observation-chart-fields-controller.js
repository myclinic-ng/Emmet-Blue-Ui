angular.module('EmmetBlue')

.controller('observationChartFieldsController', function($scope, utils){
	var functions = {
		actionMarkups: {
			observationChartFieldTitleActionMarkup: function (data, type, full, meta){
				var editButtonAction = "manageObservationChartField('edit', "+data.FieldTitleID+")";
				var deleteButtonAction = "manageObservationChartField('delete', "+data.FieldTitleID+")";

				var dataOpt = "data-option-id='"+data.FieldTitleID+"' data-option-name='"+data.FieldTitleName+"' data-option-type='"+data.FieldTitleType+"' data-option-description='"+data.FieldTitleDescription+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";
				var viewButton = "<button class='btn btn-default'> View</button>";

				var buttons = "<div class='btn-group'>"+viewButton+editButton+deleteButton+"</button>";
				return buttons;
			}
		},
		newObservationChartFieldCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new observation Chart Field", "success", "notify");
			$scope.newObservationChartField = {};
			$("#setting_new_observation_chart_field").modal("hide");

			$scope.reloadProfileRecordsTable();
		},
		observationChartFieldEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$("#setting_edit_observation_chart_field").modal("hide");

			$scope.reloadProfileRecordsTable();
		},
		observationChartFieldDeleted: function(){
			utils.alert("Operation Successful", "The selected department groups have been deleted successfully", "success", "notify");
			$scope.tempHolder = {};
			delete  $scope._recordId;

			$scope.reloadProfileRecordsTable();
		},
		manageObservationChartField: {
			newObservationChartField: function(){
				$("#setting_new_observation_chart_field").modal("show");
			},
			editObservationChartField: function(fieldTitleId){
				$("#setting_edit_observation_chart_field").modal("show");

				$scope.tempHolder.name = $(".btn[data-option-id='"+fieldTitleId+"']").attr('data-option-name');
				$scope.tempHolder.type = $(".btn[data-option-id='"+fieldTitleId+"']").attr('data-option-type');
				$scope.tempHolder.description = $(".btn[data-option-id='"+fieldTitleId+"']").attr('data-option-description');
				$scope.tempHolder.id = fieldTitleId;
			},
			deleteObservationChartField: function(fieldTitleId){
				var title = "Delete Prompt";
				var text = "You are about to delete the Observation Chart Field named "+$(".btn[data-option-id='"+fieldTitleId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._fieldTitleId = fieldTitleId;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/observation-chart-field-title/delete?'+utils.serializeParams({
						'resourceId': $scope._fieldTitleId
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.observationChartFieldDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			},
			deleteAllSelectedProfileRecords: function(){
				var selectedGroups = $scope.observationChartFieldSelector.selected;
				angular.forEach(selectedGroups, function(val, key){
					if (val){
						functions.manageObservationChartField.deleteObservationChartField(key);
					}
				})
			},
			viewObservationChartField: function(fieldTitleId){

			}
		}
	}

	$scope.tempHolder = {};

	$scope.settingsDtInstance = {};
	$scope.settingsDtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var request = utils.serverRequest('/nursing/observation-chart-field-title/view', 'GET');
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
			text: 'New Observation Chart Field',
			action: function(){
				functions.manageObservationChartField.newObservationChartField();
			},
			key: {
        		key: 'n',
        		ctrlKey: false,
        		altKey: true
        	}
		}
	]);	

	$scope.settingsDtColumns = [
		utils.DT.columnBuilder.newColumn('FieldTitleID').withTitle("Field Title ID").withOption('width', '0.5%'),
		utils.DT.columnBuilder.newColumn('FieldTitleName').withTitle("Field Title"),
		utils.DT.columnBuilder.newColumn('FieldTitleType').withTitle("Field Type"),
		utils.DT.columnBuilder.newColumn('FieldTitleDescription').withTitle('Description'),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.observationChartFieldTitleActionMarkup).notSortable()
	];

	$scope.reloadProfileRecordsTable = function(){
		$scope.settingsDtInstance.reloadData();
	}

	$scope.saveNewObservationChartField = function(){
		var newObservationChartField = $scope.newObservationChartField;
		var saveNewObservationChartField = utils.serverRequest('/nursing/observation-chart-field-title/new', 'POST', newObservationChartField);

		saveNewObservationChartField.then(function(response){
			console.log(response)
			functions.newObservationChartFieldCreated();
			$scope.newObservationChartField = {};
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}

	$scope.saveEditObservationChartField = function(){
		var edits = {
			resourceId: $scope.tempHolder.id,
			FieldTitleName: $scope.tempHolder.name,
			FieldTitleType: $scope.tempHolder.type,
			FieldTitleDescription: $scope.tempHolder.description
		}
		var saveEdits = utils.serverRequest('/nursing/observation-chart-field-title/edit', 'PUT', edits);
		saveEdits.then(function(response){
			functions.observationChartFieldEdited();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})

	}

	$scope.manageObservationChartField = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				functions.manageObservationChartField.editObservationChartField(id);
				break;
			}
			case "delete":{
				functions.manageObservationChartField.deleteObservationChartField(id);
				break;
			}
			case "role-management":{
				functions.manageObservationChartField.roleManagement(id);
				break;
			}
		}
	}
});