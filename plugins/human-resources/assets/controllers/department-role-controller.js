angular.module("EmmetBlue")

.controller('humanResourcesDepartmentRoleController', function($scope, utils){
	$scope.startWatching = false;
	$scope.$watch(function(){
		return utils.storage.roleDepartmentData
	}, function(newValue){
		$scope.departmentName = newValue.name;
		$scope.department = newValue.id;

		if (!$scope.startWatching){
			$scope.startWatching = true;
		}
		else{
			$scope.reloadRoleTable();
		}
	})

	var functions = {
		actionMarkups: {
			roleActionMarkup: function (data, type, full, meta){
				var editButtonAction = "manageRole('edit', "+data.RoleID+")";
				var deleteButtonAction = "manageRole('delete', "+data.RoleID+")";

				var dataOpt = "data-option-id='"+data.RoleID+"' data-option-name='"+data.Name+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";
				var viewButton = "<button class='btn btn-default'> <i class='fa fa-eye'></i></button>";

				var buttons = "<div class='btn-group'>"+viewButton+editButton+deleteButton+"</button>";
				return buttons;
			}
		},
		newRoleCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new role", "success", "notify");
			$scope.newRole = {};
			$("#new_role").modal("hide");

			$scope.reloadRoleTable();
		},
		roleEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$("#edit_role").modal("hide");

			$scope.reloadRoleTable();
		},
		roleDeleted: function(){
			utils.alert("Operation Successful", "The selected role has been deleted successfully", "success", "notify");
			delete  $scope._id;

			$scope.reloadRoleTable();
		},
		manageRole: {
			newRole: function(){
				$("#new_role").modal("show");
			},
			editRole: function(id){
				$scope.tempHolder.name = $(".btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.id = id;

				$("#edit_role").modal("show");
			},
			deleteRole: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete the Role named "+$(".btn[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/human-resources/Role/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.roleDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			},
			viewRole: function(groupId){

			}
		}
	}

	$scope.ddtInstance = {};

	$scope.ddtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var roles = utils.serverRequest('/human-resources/role/view-by-department?resourceId='+$scope.department, 'GET');
		return roles;
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
			text: 'New Role',
			action: function(){
				functions.manageRole.newRole();
			}
		}
	]);	

	$scope.ddtColumns = [
		utils.DT.columnBuilder.newColumn('RoleID').withTitle("ID").withOption('width', '0.5%').notSortable(),
		utils.DT.columnBuilder.newColumn('Name').withTitle("Role"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.roleActionMarkup).withOption('width', '25%').notSortable()
	];

	$scope.reloadRoleTable = function(){
		$scope.ddtInstance.reloadData();
	}

	$scope.saveNewRole = function(){
		var newRole = $scope.newRole;
		newRole.department = $scope.department;
		var saveNewRole = utils.serverRequest('/human-resources/role/new', 'POST', newRole);

		saveNewRole.then(function(response){
			functions.newRoleCreated();
		}, function(response){
			utils.errorHandler(response);
		});
	}

	$scope.saveEditRole = function(){
		var edits = {
			resourceId: $scope.tempHolder.id,
			Name: $scope.tempHolder.name
		}

		var saveEdits = utils.serverRequest('/human-resources/role/edit', 'PUT', edits);
		saveEdits.then(function(response){
			functions.roleEdited();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})

	}

	$scope.manageRole = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				functions.manageRole.editRole(id);
				break;
			}
			case "delete":{
				functions.manageRole.deleteRole(id);
				break;
			}
			case "role-management":{
				functions.manageRole.roleManagement(id);
				break;
			}
		}
	}
});
