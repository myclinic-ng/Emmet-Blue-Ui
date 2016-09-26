angular.module("EmmetBlue")

.controller("recordsPatientSettingManagePatientTypesController", function($scope, utils){

	var functions = {
		actionMarkups:{
			categoryActionMarkup: function(data, type, full, meta){
				var editButtonAction = "editPatientType("+data.PatientTypeID+")";
				var deleteButtonAction = "deletePatientType("+data.PatientTypeID+")";

				var dataOpt = "data-option-id='"+data.PatientTypeID+"' data-option-name='"+data.PatientTypeName+"' data-option-description='"+data.PatientTypeDescription+"'";

				var editButton = "<button class='btn btn-patient-type btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-patient-type btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";

				var buttons = "<div class='btn-category'>"+editButton+deleteButton+"</button>";
				return buttons;
			}
		},
		loadPatientTypeCategories: function(){
			var sendRequest = utils.serverRequest('/patients/patient-type-category/view', 'GET');
			sendRequest.then(function(response){
				$scope.patientTypeCategories = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			});
		}
	}

	functions.loadPatientTypeCategories();
	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/patients/patient-type/view', 'GET');

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
				$scope.newPatientType = {};
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
		utils.DT.columnBuilder.newColumn('PatientTypeName').withTitle("PatientType"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.categoryActionMarkup).withOption('width', '25%').notSortable()
	]

	$scope.dtInstance = {};

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}
	$scope.tempHolder = {};

	$scope.editPatientType = function(categoryId){
		$scope.tempHolder.PatientTypeName = $(".btn[data-option-id='"+categoryId+"']").attr('data-option-name');
		$scope.tempHolder.PatientTypeDescription = $(".btn[data-option-id='"+categoryId+"']").attr('data-option-description');
		$scope.tempHolder.resourceId = categoryId;

		$("#edit_setting_records_patient").modal("show");
	}

	$scope.deletePatientType = function(categoryId){
		var title = "Delete Prompt";
		var text = "You are about to delete the category named "+$(".btn[data-option-id='"+categoryId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
		var close = true;
		$scope._categoryId = categoryId;
		var callback = function(){
			var deleteRequest = utils.serverRequest('/patients/patient-type/delete?'+utils.serializeParams({
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
	$scope.saveEditPatientType = function(){
		var data = $scope.tempHolder;
		$('.loader').addClass('show');
		var request = utils.serverRequest('/patients/patient-type/edit', 'PUT', data);

		request.then(function(response){
			$('.loader').removeClass('show');
			utils.alert("Operation Successful", "Your changes has been saved successfully", "success", "notify");
			$("#edit_setting_records_patient").modal("hide");
			$scope.tempHolder = {};
			reloadTable();
		}, function(responseObject){
			$('loader').removeClass('show');
			utils.errorHandler(responseObject);
		})
	}

	$scope.saveNewPatientType = function(){
<<<<<<< HEAD
		var data = $scope.newPatientType;		
		
=======
		var data = $scope.newPatientType;

		console.log(data);
		
		$('.loader').addClass('show');
>>>>>>> fbdd8269a16775979df674767b68dee94d795a53
		var request = utils.serverRequest('/patients/patient-type/new', 'POST', data);

		request.then(function(response){
			$('.loader').removeClass('show');
			utils.alert("Operation Successful", "You have successfully creaed a new category", "success", "notify");
			$("#new_setting_records_patient").modal("hide");
			$scope.newPatientType = {};
			reloadTable();
		}, function(responseObject){
			$('.loader').removeClass('show');
			utils.errorHandler(responseObject);
		})
	}
});