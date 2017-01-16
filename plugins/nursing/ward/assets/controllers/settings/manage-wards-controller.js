angular.module("EmmetBlue")

.controller("nursingManageWardsController", function($scope, utils){
	function dtAction(data, full, meta, type){
		editButtonAction = "manage('edit',"+data.WardID+")";
		deleteButtonAction = "manage('delete',"+data.WardID+")";
		sectionButtonAction = "manage('section',"+data.WardID+")";
		var dataOpt = "data-option-id='"+data.WardID+
					"' data-option-name='"+data.WardName+
					"' data-option-description='"+data.WardDescription+
					"'";
		editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
		deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";
		manageSectionButton = "<button class='btn btn-default' ng-click=\""+sectionButtonAction+"\" "+dataOpt+"> <i class='icon-atom2'></i> Manage Sections</button>";
		return "<div class='btn-group'>"+manageSectionButton+editButton+deleteButton+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/nursing/ward/view', 'GET');
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
			text: '<i class="icon-file-plus"></i> New Ward',
			action: function(){
				$('#new_ward').modal('show')
			}
		}
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('WardID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('WardName').withTitle("Ward Name"),
		utils.DT.columnBuilder.newColumn("WardDescription").withTitle("Ward Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}

	$scope.saveWard = function(){
		var request = utils.serverRequest("/nursing/ward/new", "POST", $scope.ward);

		request.then(function(response){
			$('#new_ward').modal('hide');
			reloadTable();
			utils.notify("Operation Successful", "New Ward Registrated Successfully", "success");
			$scope.ward = {};
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.saveEditWard = function(){
		var request = utils.serverRequest("/nursing/ward/edit", "PUT", $scope.tempHolder);

		request.then(function(response){
			$('#edit_ward').modal('hide');
			reloadTable();
			utils.notify("Operation Successful", "Ward updated succesfully", "success");
			$scope.tempHolder = {};
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.tempHolder = {};
	$scope.manage = function(value, id){
		switch(value)
		{
			case "edit":{
				$scope.tempHolder.resourceId = id;
				$scope.tempHolder.WardName = $(".btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.WardDescription = $(".btn[data-option-id='"+id+"']").attr('data-option-description');
				$('#edit_ward').modal('show');
				break;
			}
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to delete the Ward titled "+$(".btn[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/ward/delete?'+utils.serializeParams({
						'resourceId': id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "Ward has been deleted successfully", "success");
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
			case "editSection":{
				$scope.tempHolder.resourceId = id;
				$scope.tempHolder.WardSectionName = $(".btn-section[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.WardSectionDescription = $(".btn-section[data-option-id='"+id+"']").attr('data-option-description');
				$('#edit_section').modal('show');
				break;
			}
			case "deleteSection":{
				var title = "Delete Prompt";
				var text = "You are about to delete the Ward Section titled "+$(".btn[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/ward-section/delete?'+utils.serializeParams({
						'resourceId': id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "Section has been deleted successfully", "success");
						reloadSectionTable();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
				break;
			}
			case "section":{
				$scope.currentWard = id;
				reloadSectionTable();
				$("#manage_sections").modal("show");
				break;
			}
		}
	}

	function dttAction(data, full, meta, type){
		editButtonAction = "manage('editSection',"+data.WardSectionID+")";
		deleteButtonAction = "manage('deleteSection',"+data.WardSectionID+")";
		sectionButtonAction = "manage('section',"+data.WardSectionID+")";
		var dataOpt = "data-option-id='"+data.WardSectionID+
					"' data-option-name='"+data.WardSectionName+
					"' data-option-description='"+data.WardSectionDescription+
					"'";
		editButton = "<button class='btn btn-default btn-section' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
		deleteButton = "<button class='btn btn-default btn-section' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";
		return "<div class='btn-group'>"+editButton+deleteButton+"</div>";
	}

	$scope.dttInstance = {};

	$scope.dttOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/nursing/ward-section/view?resourceId='+$scope.currentWard, 'GET');
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
			text: '<i class="icon-file-plus"></i> New Section',
			action: function(){
				$('#new_section').modal('show')
			}
		}
	]);	

	$scope.dttColumns = [
		utils.DT.columnBuilder.newColumn('WardSectionID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('WardSectionName').withTitle("Section Name"),
		utils.DT.columnBuilder.newColumn("WardSectionDescription").withTitle("Section Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dttAction).notSortable()
	];

	function reloadSectionTable(){
		$scope.dttInstance.reloadData();
	}

	$scope.saveSection = function(){
		$scope.section.ward = $scope.currentWard;
		var request = utils.serverRequest("/nursing/ward-section/new", "POST", $scope.section);

		request.then(function(response){
			$('#new_section').modal('hide');
			reloadSectionTable();
			utils.notify("Operation Successful", "New Section Registrated Successfully", "success");
			$scope.section = {};
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.saveEditSection = function(){
		var request = utils.serverRequest("/nursing/ward-section/edit", "PUT", $scope.tempHolder);

		request.then(function(response){
			$('#edit_section').modal('hide');
			reloadSectionTable();
			utils.notify("Operation Successful", "Ward Section updated succesfully", "success");
			$scope.tempHolder = {};
		}, function(error){
			utils.errorHandler(error);
		})
	}
})