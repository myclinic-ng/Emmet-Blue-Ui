angular.module("EmmetBlue")

.controller('humanResourcesDepartmentController', function($scope, utils){
	var functions = {
		actionMarkups: {
			departmentActionMarkup: function (data, type, full, meta){
				var editButtonAction = "manageDepartment('edit', "+data.DepartmentID+")";
				var deleteButtonAction = "manageDepartment('delete', "+data.DepartmentID+")";
				var roleManagementButtonAction = "manageDepartment('role-management', "+data.DepartmentID+")";

				var dataOpt = "data-option-id='"+data.DepartmentID+"' data-option-name='"+data.Name+"' data-option-group='"+data.GroupID+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";
				var viewButton = "<button class='btn btn-default'> View</button>";
				var roleManagementButton = "<button class='btn btn-default' ng-click=\""+roleManagementButtonAction+"\" "+dataOpt+"> Manage Roles</button>";

				var buttons = "<div class='btn-group'>"+viewButton+editButton+deleteButton+roleManagementButton+"</button>";
				return buttons;
			},
			checkAll: {
				title: '<input ng-model="departmentSelector.selectAll" ng-click="departmentSelector.toggleAll(departmentSelector.selectAll, departmentSelector.selected)" type="checkbox">',
				body: function(data, type, full, meta){
					$scope.departmentSelector.selected[full.DepartmentID] = false;
					return '<input ng-model="departmentSelector.selected[' + data.DepartmentID + ']" ng-click="departmentSelector.toggleOne(departmentSelector.selected)" type="checkbox">';
				}
			}
		},
		toggleAllCheckboxes: function(selectAll, selectedItems){
			for (var id in selectedItems) {
	            if (selectedItems.hasOwnProperty(id)) {
	                selectedItems[id] = selectAll;
	            }
	        }
		},
		toggleOneCheckbox: function(selectedItems){
			console.log(selectedItems);
	       for (var id in selectedItems) {
	            if (selectedItems.hasOwnProperty(id)) {
	                if(!selectedItems[id]) {
	                    $scope.departmentSelector.selectAll = false;
	                    return;
	                }
	            }
	        }
	        $scope.departmentSelector.selectAll = true;
		},
		newDepartmentCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new department", "success", "notify");
			$scope.newDepartment = {};
			$("#new_department").modal("hide");

			$scope.reloadDepartmentTable();
		},
		departmentEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$("#edit_department").modal("hide");

			$scope.reloadDepartmentTable();
		},
		departmentDeleted: function(){
			utils.alert("Operation Successful", "The selected department has been deleted successfully", "success", "notify");
			$scope.tempHolder = {};
			delete  $scope._id;

			$scope.reloadDepartmentTable();
		},
		manageDepartment: {
			newDepartment: function(){
				$("#new_department").modal("show");
			},
			editDepartment: function(id){
				$scope.tempHolder.name = $(".btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.groupId = $(".btn[data-option-id='"+id+"']").attr('data-option-group');
				$scope.tempHolder.id = id;

				$("#edit_department").modal("show");
			},
			deleteDepartment: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete the department named "+$(".btn[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					console.log($scope._id);
					var deleteRequest = utils.serverRequest('/human-resources/department/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.departmentDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			},
			roleManagement: function(id){
				var data = {
					name: $(".btn[data-option-id='"+id+"']").attr('data-option-name'),
					id: id
				}

				utils.storage.roleDepartmentData = data;
				$("#role_management").modal("show");
			},
			deleteAllSelectedDepartments: function(){
				var selectedGroups = $scope.departmentSelector.selected;
				angular.forEach(selectedGroups, function(val, key){
					if (val){
						functions.manageDepartment.deleteDepartment(key);
					}
				})
			},
			viewDepartment: function(groupId){

			}
		},
		loadDepartmentGroups: function(){
			var loadDepartmentGroups = utils.serverRequest('/human-resources/department-group/view', 'GET');

			loadDepartmentGroups.then(function(response){
				$scope.departmentGroups = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		}
	}

	$scope.departmentGroups = {};
	$scope.departmentSelector = {
		selectAll: false,
		toggleAll: functions.toggleAllCheckboxes,
		toggleOne: functions.toggleOneCheckbox,
		selected: {}
	};

	$scope.tempHolder = {};

	functions.loadDepartmentGroups();

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var departments = utils.serverRequest('/human-resources/department/view', 'GET');
		return departments;
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
			text: '<u>N</u>ew department',
			action: function(){
				functions.manageDepartment.newDepartment();
			},
			key: {
        		key: 'n',
        		ctrlKey: false,
        		altKey: true
        	}
		},
        {
        	extend: 'print',
        	text: '<u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	}
        },
        {
        	extend: 'copy',
        	text: '<u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: false,
        		altKey: true
        	}
        },
        {
        	text: '<u>M</u>anage the selected departments',
        	key: {
        		key: 'm',
        		ctrlKey: false,
        		altKey: true
        	},
        	action: function(e, dt, node, config){
        	}
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn(null).withTitle(functions.actionMarkups.checkAll.title).renderWith(functions.actionMarkups.checkAll.body).withOption('width', '0.5%').notSortable(),
		utils.DT.columnBuilder.newColumn('DepartmentID').withTitle("Department ID").withOption('width', '0.5%'),
		utils.DT.columnBuilder.newColumn('Name').withTitle("Department Name"),
		utils.DT.columnBuilder.newColumn('GroupName').withTitle("Department Group"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.departmentActionMarkup).withOption('width', '25%').notSortable()
	];

	$scope.reloadDepartmentTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.saveNewDepartment = function(){
		var newDepartment = $scope.newDepartment;
		var saveNewDepartment = utils.serverRequest('/human-resources/department/new', 'POST', newDepartment);

		saveNewDepartment.then(function(response){
			functions.newDepartmentCreated();
		}, function(response){
			utils.errorHandler(response);
		});
	}

	$scope.saveEditDepartment = function(){
		var edits = {
			resourceId: $scope.tempHolder.id,
			Name: $scope.tempHolder.name,
			GroupID: $scope.tempHolder.groupId
		}

		var saveEdits = utils.serverRequest('/human-resources/department/edit', 'PUT', edits);
		saveEdits.then(function(response){
			functions.departmentEdited();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})

	}

	$scope.manageDepartment = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				functions.manageDepartment.editDepartment(id);
				break;
			}
			case "delete":{
				functions.manageDepartment.deleteDepartment(id);
				break;
			}
			case "role-management":{
				functions.manageDepartment.roleManagement(id);
				break;
			}
		}
	}
});
