angular.module("EmmetBlue")

.controller('humanResourcesDepartmentGroupsController', function($scope, utils){
	var functions = {
		actionMarkups: {
			departmentGroupActionMarkup: function (data, type, full, meta){
				var editButtonAction = "manageDepartmentGroup('edit', "+data.DepartmentGroupID+")";
				var deleteButtonAction = "manageDepartmentGroup('delete', "+data.DepartmentGroupID+")";

				var dataOpt = "data-option-id='"+data.DepartmentGroupID+"' data-option-name='"+data.GroupName+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='icon-pencil5'></i> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"><i class='icon-bin'></i> Delete</button>";
				var viewButton = "<button class='btn btn-default'><i class='icon-eye'> </i> View</button>";

				var buttons = "<div class='btn-group'>"+viewButton+editButton+deleteButton+"</button>";
				return buttons;
			},
			
			departmentGroupSerialNumberMarkup: function(data, type, full, meta){
				return "<span class='text-center'>"+ ++(meta.row) +"</span>";
			},

			checkAll: {
				title: '<input ng-model="departmentGroupSelector.selectAll" ng-click="departmentGroupSelector.toggleAll(departmentGroupSelector.selectAll, departmentGroupSelector.selected)" type="checkbox">',
				body: function(data, type, full, meta){
					$scope.departmentGroupSelector.selected[full.DepartmentGroupID] = false;
					return '<input ng-model="departmentGroupSelector.selected[' + data.DepartmentGroupID + ']" ng-click="departmentGroupSelector.toggleOne(departmentGroupSelector.selected)" type="checkbox">';
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
	                    $scope.departmentGroupSelector.selectAll = false;
	                    return;
	                }
	            }
	        }
	        $scope.departmentGroupSelector.selectAll = true;
		},
		newDepartmentGroupCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new department group", "success", "notify");
			$scope.newDepartmentGroup = {};
			$("#new_department_group").modal("hide");

			$scope.reloadDepartmentGroupsTable();
		},
		departmentGroupEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$("#edit_department_group").modal("hide");

			$scope.reloadDepartmentGroupsTable();
		},
		departmentGroupDeleted: function(){
			utils.alert("Operation Successful", "The selected department groups have been deleted successfully", "success", "notify");
			$scope.tempHolder = {};
			delete  $scope._groupId;

			$scope.reloadDepartmentGroupsTable();
		},
		manageDepartmentGroup: {
			newDepartmentGroup: function(){
				$("#new_department_group").modal("show");
			},
			editDepartmentGroup: function(groupId){
				$("#edit_department_group").modal("show");

				$scope.tempHolder.groupName = $(".btn[data-option-id='"+groupId+"']").attr('data-option-name');
				$scope.tempHolder.groupId = groupId;
			},
			deleteDepartmentGroup: function(groupId){
				var title = "Delete Prompt";
				var text = "You are about to delete the department group named "+$(".btn[data-option-id='"+groupId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._groupId = groupId;
				var callback = function(){
					console.log($scope._groupId);
					var deleteRequest = utils.serverRequest('/human-resources/department-group/delete?'+utils.serializeParams({
						'resourceId': $scope._groupId
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.departmentGroupDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			},
			deleteAllSelectedDepartmentGroups: function(){
				var selectedGroups = $scope.departmentGroupSelector.selected;
				angular.forEach(selectedGroups, function(val, key){
					if (val){
						functions.manageDepartmentGroup.deleteDepartmentGroup(key);
					}
				})
			},
			viewDepartmentGroup: function(groupId){

			}
		}
	}


	$scope.departmentGroupSelector = {
		selectAll: false,
		toggleAll: functions.toggleAllCheckboxes,
		toggleOne: functions.toggleOneCheckbox,
		selected: {}
	};

	$scope.tempHolder = {};

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var departmentGroups = utils.serverRequest('/human-resources/department-group/view', 'GET');
		return departmentGroups;
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
			text: '<i class="icon-file-plus"> </i> <u>N</u>ew department group',
			action: function(){
				functions.manageDepartmentGroup.newDepartmentGroup();
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
        },
        {
        	text: '<i class="icon-bin"></i> <u>D</u>elete the selected data',
        	key: {
        		key: 'd',
        		ctrlKey: false,
        		altKey: true
        	},
        	action: function(e, dt, node, config){
        		functions.manageDepartmentGroup.deleteAllSelectedDepartmentGroups();
        	}
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn(null).withTitle(functions.actionMarkups.checkAll.title).renderWith(functions.actionMarkups.checkAll.body).withOption('width', '0.5%').notSortable(),
		utils.DT.columnBuilder.newColumn('DepartmentGroupID').withTitle("Department Group ID").withOption('width', '0.5%'),
		utils.DT.columnBuilder.newColumn('GroupName').withTitle("Department Group Name"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.departmentGroupActionMarkup).withOption('width', '25%').notSortable()
	];

	$scope.reloadDepartmentGroupsTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.saveNewDepartmentGroup = function(){
		var newDepartmentGroup = $scope.newDepartmentGroup;
		var saveNewDepartmentGroup = utils.serverRequest('/human-resources/department-group/new', 'POST', newDepartmentGroup);

		saveNewDepartmentGroup.then(function(response){
			functions.newDepartmentGroupCreated();
			$scope.newDepartmentGroup = {};
		}, function(response){
			utils.errorHandler(response);
		});
	}

	$scope.saveEditDepartmentGroup = function(){
		var edits = {
			resourceId: $scope.tempHolder.groupId,
			GroupName: $scope.tempHolder.groupName
		}

		var saveEdits = utils.serverRequest('/human-resources/department-group/edit', 'PUT', edits);
		saveEdits.then(function(response){
			functions.departmentGroupEdited();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})

	}

	$scope.manageDepartmentGroup = function(manageGroup, groupId){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				functions.manageDepartmentGroup.editDepartmentGroup(groupId);
				break;
			}
			case "delete":{
				functions.manageDepartmentGroup.deleteDepartmentGroup(groupId);
				break;
			}
		}
	}
});