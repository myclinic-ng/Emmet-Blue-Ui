angular.module("EmmetBlue")

.controller("ConsultancyExamTypeController", function($scope, utils){
	var functions = {
		actionMarkups:{
			statusActionMarkup: function(data, type, full, meta){
				var editButtonAction = "editExamType("+data.ExamTypeID+")";
				var deleteButtonAction = "deleteExamType("+data.ExamTypeID+")";

				var dataOpt = "data-option-id='"+data.ExamTypeID+"' data-option-name='"+data.ExamTypeTitle+"' data-option-description='"+data.ExamTypeDescription+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";

				var buttons = "<div class='btn-status'>"+editButton+deleteButton+"</button>";
				return buttons;
			}
		}
	}
	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/consultancy/examination-type/view', 'GET');

		return request;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
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
			text: 'New status',
			action: function(){
				$scope.newExamType = {};
				$("#new_setting_accounts_billing").modal("show");
			}
		},
        {
        	extend: 'print',
        	text: '<u>P</u>rint this data page'
        },
        {
        	extend: 'copy',
        	text: '<u>C</u>opy this data'
        }
    ]);

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('ExamTypeTitle').withTitle("Examination"),
		utils.DT.columnBuilder.newColumn('ExamTypeDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.statusActionMarkup).notSortable()
	]

	$scope.dtInstance = {};

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}
	$scope.tempHolder = {};

	$scope.editExamType = function(statusId){
		$scope.tempHolder.ExamTypeName = $(".btn[data-option-id='"+statusId+"']").attr('data-option-name');
		$scope.tempHolder.ExamTypeDescription = $(".btn[data-option-id='"+statusId+"']").attr('data-option-description');
		$scope.tempHolder.resourceId = statusId;

		$("#edit_setting_accounts_billing").modal("show");
	}

	$scope.deleteExamType = function(statusId){
		var title = "Delete Prompt";
		var text = "You are about to delete the status named "+$(".btn[data-option-id='"+statusId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
		var close = true;
		$scope._statusId = statusId;
		var callback = function(){
			var deleteRequest = utils.serverRequest('/accounts-biller/transaction-status/delete?'+utils.serializeParams({
				'resourceId': $scope._statusId
			}), 'DELETE');

			deleteRequest.then(function(response){
				utils.alert("Operation Successful", "The selected status has been deleted successfully", "success", "notify");
				delete  $scope._groupId;

				reloadTable();
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		}
		var type = "warning";
		var btnText = "Delete";

		utils.confirm(title, text, close, callback, type, btnText);
	}
	$scope.saveEditExamType = function(){
		var data = $scope.tempHolder;

		var request = utils.serverRequest('/accounts-biller/transaction-status/edit', 'PUT', data);

		request.then(function(response){
			utils.alert("Operation Successful", "Your changes has been saved successfully", "success", "notify");
			$("#edit_setting_accounts_billing").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	$scope.saveNewExamType = function(){
		var data = $scope.newExamType;
		
		var request = utils.serverRequest('/accounts-biller/transaction-status/new', 'POST', data);

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully created a new status", "success", "notify");
			$("#new_setting_accounts_billing").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
});