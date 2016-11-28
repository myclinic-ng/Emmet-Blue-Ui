angular.module("EmmetBlue")

.controller('humanResourcesDepartmentRootsController', function($scope, utils){
	$scope.tempHolder = {};

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var departmentRoots = utils.serverRequest('/human-resources/department/view-root-url', 'GET');
		return departmentRoots;
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
			text: '<i class="icon-file-plus"> </i> <u>N</u>ew URL',
			action: function(){
				$("#new_department_root").modal("show");
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
		utils.DT.columnBuilder.newColumn(null).withTitle("S/N").renderWith(function(data, type, full, meta){
			return meta.row + 1;
		}),
		utils.DT.columnBuilder.newColumn('Name').withTitle("Department"),
		utils.DT.columnBuilder.newColumn('Url').withTitle("Root URL"),
	];

	$scope.reloadDepartmentRootsTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.saveNewDepartmentRoot = function(){
		$('.loader').addClass('show');
		var newDepartmentRoot = $scope.newDepartmentRoot;
		var saveNewDepartmentRoot = utils.serverRequest('/human-resources/department/new-root-url', 'POST', newDepartmentRoot);

		saveNewDepartmentRoot.then(function(response){
			$('.loader').removeClass('show');
			utils.notify("Operation successful", "url registered successfully", "success");
			$("#new_department_root").modal("hide");
			$scope.reloadDepartmentRootsTable();
			$scope.newDepartmentRoot = {};
		}, function(response){
			$('.loader').removeClass('show');
			utils.errorHandler(response);
		});
	}

	$scope.saveEditDepartmentRoot = function(){
		var edits = {
			resourceId: $scope.tempHolder.groupId,
			RootName: $scope.tempHolder.groupName
		}
			$('.loader').addClass('show');
		var saveEdits = utils.serverRequest('/human-resources/department/edit', 'PUT', edits);
		saveEdits.then(function(response){
			$('.loader').removeClass('show');
			functions.departmentRootEdited();
		}, function(responseObject){
			$('.loader').removeClass('show');
			utils.errorHandler(responseObject);
		})

	}

	$scope.manageDepartmentRoot = function(manageRoot, groupId){
		switch(manageRoot.toLowerCase()){
			case "edit":{
				functions.manageDepartmentRoot.editDepartmentRoot(groupId);
				break;
			}
			case "delete":{
				functions.manageDepartmentRoot.deleteDepartmentRoot(groupId);
				break;
			}
		}
	}
});