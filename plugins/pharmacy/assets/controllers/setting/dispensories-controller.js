angular.module("EmmetBlue")

.controller("pharmacySettingManageDispensoryController", function($scope, utils){
	function dtAction(data, full, meta, type){
		editButtonAction = "manage('edit',"+data.EligibleDispensoryID+")";
		deleteButtonAction = "manage('delete',"+data.EligibleDispensoryID+")";
		var dataOpt = "data-option-id='"+data.EligibleDispensoryID+
					"' data-option-name='"+data.EligibleDispensory+
					"'";
		editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
		deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";
		return "<div class='btn-group'>"+editButton+deleteButton+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/pharmacy/eligible-dispensory/view', 'GET');
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
			text: '<i class="icon-file-plus"></i> New Dispensory',
			action: function(){
				$('#new_setting_dispensory').modal('show')
			}
		}
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('EligibleDispensoryID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('EligibleDispensory').withTitle("Dispensory Name"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}

	$scope.saveNewDispensory = function(){
		var request = utils.serverRequest("/pharmacy/eligible-dispensory/new", "POST", $scope.newDispensory);

		request.then(function(response){
			$('#new_setting_dispensory').modal('hide');
			reloadTable();
			utils.notify("Operation Successful", "New Dispensory Created Successfully", "success");
			$scope.newDispensory = {};
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.saveEditDispensory = function(){
		var request = utils.serverRequest("/pharmacy/eligible-dispensory/edit", "PUT", $scope.tempHolder);

		request.then(function(response){
			$('#edit_setting_dispensory').modal('hide');
			reloadTable();
			utils.notify("Operation Successful", "Dispensory updated succesfully", "success");
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
				$scope.tempHolder.EligibleDispensory = $(".btn[data-option-id='"+id+"']").attr('data-option-name');
				$('#edit_setting_dispensory').modal('show');
				break;
			}
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to delete the Dispensory titled "+$(".btn[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/pharmacy/eligible-dispensory/delete?'+utils.serializeParams({
						'resourceId': id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "Dispensory has been deleted successfully", "success");
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