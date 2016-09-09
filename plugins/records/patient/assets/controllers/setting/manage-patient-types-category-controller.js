
angular.module("EmmetBlue")

.controller("recordsPatientSettingManagePatientTypesCategoryController", function($scope, utils){
	var functions = {
		actionMarkups:{
			categoryActionMarkup: function(data, type, full, meta){
				var editButtonAction = "editCategory("+data.CategoryID+")";
				var deleteButtonAction = "deleteCategory("+data.CategoryID+")";

				var dataOpt = "data-option-id='"+data.CategoryID+"' data-option-name='"+data.CategoryName+"' data-option-description='"+data.CategoryDescription+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";

				var buttons = "<div class='btn-category'>"+editButton+deleteButton+"</button>";
				return buttons;
			}
		}
	}
	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/patients/patient-type-category/view', 'GET');

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
			text: 'New Patient Type',
			action: function(){
				$scope.newCategory = {};
				$("#new_setting_records_patient").modal("show");
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
		utils.DT.columnBuilder.newColumn('CategoryName').withTitle("Category"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.categoryActionMarkup).withOption('width', '25%').notSortable()
	]

	$scope.dtInstance = {};

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}
	$scope.tempHolder = {};

	$scope.editCategory = function(categoryId){
		$scope.tempHolder.CategoryName = $(".btn[data-option-id='"+categoryId+"']").attr('data-option-name');
		$scope.tempHolder.CategoryDescription = $(".btn[data-option-id='"+categoryId+"']").attr('data-option-description');
		$scope.tempHolder.resourceId = categoryId;

		console.log($scope.tempHolder);

		$("#edit_setting_records_patient").modal("show");
	}

	$scope.deleteCategory = function(categoryId){
		var title = "Delete Prompt";
		var text = "You are about to delete the category named "+$(".btn[data-option-id='"+categoryId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
		var close = true;
		$scope._categoryId = categoryId;
		var callback = function(){
			console.log($scope._categoryId);
			var deleteRequest = utils.serverRequest('/patients/patient-type-category/delete?'+utils.serializeParams({
				'resourceId': $scope._categoryId
			}), 'DELETE');

			deleteRequest.then(function(response){
				utils.alert("Operation Successful", "The selected category has been deleted successfully", "success", "notify");
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
	$scope.saveEditCategory = function(){
		var data = $scope.tempHolder;

		var request = utils.serverRequest('/patients/patient-type-category/edit', 'PUT', data);

		request.then(function(response){
			utils.alert("Operation Successful", "Your changes has been saved successfully", "success", "notify");
			$("#edit_setting_records_patient").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	$scope.saveNewCategory = function(){
		var data = $scope.newCategory;
		
		var request = utils.serverRequest('/patients/patient-type-category/new', 'POST', data);

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully creaed a new category", "success", "notify");
			$("#new_setting_records_patient").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
});