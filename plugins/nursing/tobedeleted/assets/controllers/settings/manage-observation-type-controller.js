angular.module("EmmetBlue")

.controller("nursingSettingManageObservationTypeController", function($scope, utils){
	function dtAction(data, full, meta, type){
		editButtonAction = "manage('edit',"+data.ObservationTypeID+")";
		deleteButtonAction = "manage('delete',"+data.ObservationTypeID+")";
		var dataOpt = "data-option-id='"+data.ObservationTypeID+
					"' data-option-name='"+data.ObservationTypeName+
					"' data-option-description='"+data.ObservationTypeDescription+
					"'";
		editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
		deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";
		return "<div class='btn-group'>"+editButton+deleteButton+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/nursing/observation-type/view', 'GET');
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
			text: '<i class="icon-file-plus"></i> New Observation Type',
			action: function(){
				$('#new_setting_observation_type').modal('show')
			}
		}
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('ObservationTypeID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('ObservationTypeName').withTitle("Observation Type Name"),
		utils.DT.columnBuilder.newColumn("ObservationTypeDescription").withTitle("Observation Type Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}

	$scope.saveNewObservationType = function(){
		var request = utils.serverRequest("/nursing/observation-type/new", "POST", $scope.newObservationType);

		request.then(function(response){
			$('#new_setting_observation_type').modal('hide');
			reloadTable();
			utils.notify("Operation Successful", "New Observation Type Created Successfully", "success");
			$scope.newObservationType = {};
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.saveEditObservationType = function(){
		var request = utils.serverRequest("/nursing/observation-type/edit", "PUT", $scope.tempHolder);

		request.then(function(response){
			$('#edit_setting_observation_type').modal('hide');
			reloadTable();
			utils.notify("Operation Successful", "Observation type updated succesfully", "success");
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
				$scope.tempHolder.ObservationTypeName = $(".btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.ObservationTypeDescription = $(".btn[data-option-id='"+id+"']").attr('data-option-description');
				$('#edit_setting_observation_type').modal('show');
				break;
			}
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to delete the Observation Type titled "+$(".btn[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/observation-type/delete?'+utils.serializeParams({
						'resourceId': id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "Observation Type has been deleted successfully", "success");
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
		}
	}
})