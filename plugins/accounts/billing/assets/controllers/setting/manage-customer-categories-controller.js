angular.module("EmmetBlue")

.controller("accountsBillingSettingManageCustomerCategoryController", function($scope, utils){
	var functions = {
		actionMarkups:{
			customerCategoryActionMarkup: function(data, type, full, meta){
				var editButtonAction = "editCustomerCategory("+data.CustomerCategoryID+")";
				var deleteButtonAction = "deleteCustomerCategory("+data.CustomerCategoryID+")";

				var dataOpt = "data-option-id='"+data.CustomerCategoryID+"' data-option-name='"+data.CustomerCategoryName+"' data-option-description='"+data.CustomerCategoryDescription+"'";

				var editButton = "<button class='btn btn-default btn-customer-category' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default btn-customer-category' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";

				var buttons = "<div class='btn-customerCategory'>"+editButton+deleteButton+"</button>";
				return buttons;
			}
		}
	}
	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/customer-category/view', 'GET');

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
			text: 'New Customer Category',
			action: function(){
				$scope.newCustomerCategory = {};
				$("#new_setting_customer_category").modal("show");
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
		utils.DT.columnBuilder.newColumn('CustomerCategoryName').withTitle("CustomerCategory"),
		utils.DT.columnBuilder.newColumn('CustomerCategoryDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.customerCategoryActionMarkup).withOption('width', '25%').notSortable()
	]

	$scope.dtInstance = {};

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}
	$scope.tempHolder = {};

	$scope.editCustomerCategory = function(customerCategoryId){
		$scope.tempHolder.CustomerCategoryName = $(".btn-customer-category[data-option-id='"+customerCategoryId+"']").attr('data-option-name');
		$scope.tempHolder.CustomerCategoryDescription = $(".btn-customer-category[data-option-id='"+customerCategoryId+"']").attr('data-option-description');
		$scope.tempHolder.resourceId = customerCategoryId;

		$("#edit_setting_customer_category").modal("show");
	}

	$scope.deleteCustomerCategory = function(customerCategoryId){
		var title = "Delete Prompt";
		var text = "You are about to delete the customerCategory named "+$(".btn-customer-category[data-option-id='"+customerCategoryId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
		var close = true;
		$scope._customerCategoryId = customerCategoryId;
		var callback = function(){
			var deleteRequest = utils.serverRequest('/accounts-biller/customer-category/delete?'+utils.serializeParams({
				'resourceId': $scope._customerCategoryId
			}), 'DELETE');

			deleteRequest.then(function(response){
				utils.alert("Operation Successful", "The selected customerCategory has been deleted successfully", "success", "notify");
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
	$scope.saveEditCustomerCategory = function(){
		var data = $scope.tempHolder;

		var request = utils.serverRequest('/accounts-biller/customer-category/edit', 'PUT', data);

		request.then(function(response){
			utils.alert("Operation Successful", "Your changes has been saved successfully", "success", "notify");
			$("#edit_setting_customer_category").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	$scope.saveNewCustomerCategory = function(){
		var data = $scope.newCustomerCategory;
		
		var request = utils.serverRequest('/accounts-biller/customer-category/new', 'POST', data);

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully creaed a new payment method", "success", "notify");
			$("#new_setting_customer_category").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
});