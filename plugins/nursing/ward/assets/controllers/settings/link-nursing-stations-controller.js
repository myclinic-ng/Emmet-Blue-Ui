angular.module("EmmetBlue")

.controller("nursingSettingLinkNursingStationsController", function($scope, utils){
	function dtAction(data, full, meta, type){
		deleteButtonAction = "manage('delete',"+data.LogID+")";

		var data = "data-option-id='"+data.LogID+"' data-option-name='"+data.Name+"'";

		deleteButton = "<button class='btn btn-default btn-fields' ng-click=\""+deleteButtonAction+"\""+data+"> <i class='fa fa-close'></i> Remove from list</button>";

		return "<div class='btn-group'>"+deleteButton+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/nursing/nursing-station-departments/view-departments', 'GET');
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

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('Name').withTitle("Currently Linked Departments"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}

	function loadDepartments(){
		var request = utils.serverRequest("/human-resources/department/view", "GET");
		request.then(function(result){
			$scope.departments = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}
	loadDepartments();
	
	$scope.manage = function(value, id){
		switch(value)
		{
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to remove "+$(".btn-fields[data-option-id='"+id+"']").attr('data-option-name')+" from the nursing stations list. Do you want to continue?";
				var close = true;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/nursing-station-departments/delete-department?'+utils.serializeParams({
						'resourceId': id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "The selected department has been unlinked successfully", "success");
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

	$scope.submit = function(){
		var department = $scope.department;

		utils.serverRequest("/nursing/nursing-station-departments/new-department", "POST", {"department": department}).then(function(response){
			utils.notify("Operation Successful", "The selected department has been linked as a nursing station successfully", "success");
			reloadTable();
		}, function(error){
			utils.errorHandler(error);
		})
	}
})