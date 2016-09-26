
angular.module("EmmetBlue")

.controller("recordsPatientSettingManagePatientTypesCategoryController", function($scope, utils){
	var functions = {
		actionMarkups:{
			categoryActionMarkup: function(data, type, full, meta){
				var editButtonAction = "editCategory("+data.CategoryID+")";
				var deleteButtonAction = "deleteCategory("+data.CategoryID+")";

				var dataOpt = "data-option-id='"+data.CategoryID+"' data-option-name='"+data.CategoryName+"' data-option-description='"+data.CategoryDescription+"'";

				var editButton = "<button class='btn btn-patient-type-category btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-patient-type-category btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";

				var buttons = "<div class='btn-group'>"+editButton+deleteButton+"</div>";
				return buttons;
			}
		}
	}
	$scope.categorydtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
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
			text: 'New Category',
			action: function(){
				$scope.newCategory = {};
				$("#new_setting_records_patient_category").modal("show");
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

	$scope.categorydtColumns = [
		utils.DT.columnBuilder.newColumn('CategoryName').withTitle("Category"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.categoryActionMarkup).withOption('wicategorydth', '25%').notSortable()
	]

	$scope.categorydtInstance = {};

	function reloadTable(){
		$scope.categorydtInstance.reloadData();
	}
	$scope.tempHolder = {};

	$scope.editCategory = function(categoryId){
		$scope.tempHolder.CategoryName = $(".btn-patient-type-category[data-option-id='"+categoryId+"']").attr('data-option-name');
		$scope.tempHolder.CategoryDescription = $(".btn-patient-type-category[data-option-id='"+categoryId+"']").attr('data-option-description');
		$scope.tempHolder.resourceId = categoryId;

		$("#edit_setting_records_patient_category").modal("show");
	}

	$scope.deleteCategory = function(categoryId){
		var title = "Delete Prompt";
		var text = "You are about to delete the category named "+$(".btn-patient-type-category[data-option-id='"+categoryId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
		var close = true;
		$scope._categoryId = categoryId;
		var callback = function(){
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
		$('.loader').addClass('show');
		var request = utils.serverRequest('/patients/patient-type-category/edit', 'PUT', data);

		request.then(function(response){
			$('.loader').removeClass('show');
			utils.alert("Operation Successful", "Your changes has been saved successfully", "success", "notify");
			$("#edit_setting_records_patient_category").modal("hide");
			reloadTable();
		}, function(responseObject){
			$('.loader').removeClass('show');
			utils.errorHandler(responseObject);
		})
	}

	$scope.saveNewCategory = function(){
		var data = $scope.newCategory;
		$('.loader').addClass('show');
		var request = utils.serverRequest('/patients/patient-type-category/new', 'POST', data);

		request.then(function(response){
			$('.loader').removeClass('show');
			utils.alert("Operation Successful", "You have successfully creaed a new category", "success", "notify");
			$("#new_setting_records_patient_category").modal("hide");
			$scope.newCategory = {};
			reloadTable();
		}, function(responseObject){
			$('.loader').removeClass('show');
			utils.errorHandler(responseObject);
		})
	}
});