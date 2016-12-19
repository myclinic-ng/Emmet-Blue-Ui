angular.module('EmmetBlue')

.controller('humanResourcesSettingsStaffProfileRecordsController', function($scope, utils){
	var functions = {
		actionMarkups: {
			profileRecordActionMarkup: function (data, type, full, meta){
				var editButtonAction = "manageProfileRecord('edit', "+data.FieldTitleID+")";
				var deleteButtonAction = "manageProfileRecord('delete', "+data.FieldTitleID+")";

				var dataOpt = "data-option-id='"+data.FieldTitleID+"' data-option-name='"+data.FieldTitleName+"' data-option-description='"+data.FieldTitleDescription+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-edit'></i> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash'></i> Delete</button>";
				var viewButton = "<button class='btn btn-default'> View</button>";

				var buttons = "<div class='btn-group'>"+editButton+deleteButton+"</button>";
				return buttons;
			}
		},
		newProfileRecordCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new profile record for staffs", "success", "notify");
			$scope.newProfileRecord = {};
			$("#setting_new_staff_profile_record").modal("hide");

			$scope.reloadProfileRecordsTable();
		},
		profileRecordEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$("#setting_edit_staff_profile_record").modal("hide");

			$scope.reloadProfileRecordsTable();
		},
		profileRecordDeleted: function(){
			utils.alert("Operation Successful", "The selected department groups have been deleted successfully", "success", "notify");
			$scope.tempHolder = {};
			delete  $scope._recordId;

			$scope.reloadProfileRecordsTable();
		},
		manageProfileRecords: {
			newProfileRecord: function(){
				$("#setting_new_staff_profile_record").modal("show");
			},
			editProfileRecord: function(recordId){
				$("#setting_edit_staff_profile_record").modal("show");

				$scope.tempHolder.name = $(".btn[data-option-id='"+recordId+"']").attr('data-option-name');
				$scope.tempHolder.description = $(".btn[data-option-id='"+recordId+"']").attr('data-option-description');
				$scope.tempHolder.id = recordId;
			},
			deleteProfileRecord: function(recordId){
				var title = "Delete Prompt";
				var text = "You are about to delete the department group named "+$(".btn[data-option-id='"+recordId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._recordId = recordId;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/human-resources/staff-profile-record/delete?'+utils.serializeParams({
						'resourceId': $scope._recordId
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.profileRecordDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			},
			deleteAllSelectedProfileRecords: function(){
				var selectedGroups = $scope.profileRecordSelector.selected;
				angular.forEach(selectedGroups, function(val, key){
					if (val){
						functions.manageProfileRecord.deleteProfileRecord(key);
					}
				})
			},
			viewProfileRecord: function(recordId){

			}
		}
	}

	$scope.tempHolder = {};

	$scope.settingsDtInstance = {};
	$scope.settingsDtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var request = utils.serverRequest('/human-resources/staff-profile-record/view', 'GET');
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
			text: 'New profile record',
			action: function(){
				functions.manageProfileRecords.newProfileRecord();
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
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.profileRecordActionMarkup).notSortable()
	];

	$scope.reloadProfileRecordsTable = function(){
		$scope.settingsDtInstance.reloadData();
	}

	$scope.saveNewProfileRecord = function(){
		var newProfileRecord = $scope.newProfileRecord;
		var saveNewProfileRecord = utils.serverRequest('/human-resources/staff-profile-record/new', 'POST', newProfileRecord);

		saveNewProfileRecord.then(function(response){
			functions.newProfileRecordCreated();
			$scope.newProfileRecord = {};
		}, function(response){
			utils.errorHandler(response);
		});
	}

	$scope.saveEditProfileRecord = function(){
		var edits = {
			resourceId: $scope.tempHolder.id,
			FieldTitleName: $scope.tempHolder.name,
			FieldTitleDescription: $scope.tempHolder.description
		}

		var saveEdits = utils.serverRequest('/human-resources/staff-profile-record/edit', 'PUT', edits);
		saveEdits.then(function(response){
			functions.profileRecordEdited();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})

	}

	$scope.manageProfileRecord = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				functions.manageProfileRecords.editProfileRecord(id);
				break;
			}
			case "delete":{
				functions.manageProfileRecords.deleteProfileRecord(id);
				break;
			}
			case "role-management":{
				functions.manageProfileRecords.roleManagement(id);
				break;
			}
		}
	}
});