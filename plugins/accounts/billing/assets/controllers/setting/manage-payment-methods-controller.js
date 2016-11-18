angular.module("EmmetBlue")

.controller("accountsBillingSettingManagePaymentMethodsController", function($scope, utils){
	var functions = {
		actionMarkups:{
			paymentMethodActionMarkup: function(data, type, full, meta){
				var editButtonAction = "editPaymentMethod("+data.PaymentMethodID+")";
				var deleteButtonAction = "deletePaymentMethod("+data.PaymentMethodID+")";

				var dataOpt = "data-option-id='"+data.PaymentMethodID+"' data-option-name='"+data.PaymentMethodName+"' data-option-description='"+data.PaymentMethodDescription+"'";

				var editButton = "<button class='btn btn-default btn-payment-method' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default btn-payment-method' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";

				var buttons = "<div class='btn-paymentMethod'>"+editButton+deleteButton+"</button>";
				return buttons;
			}
		}
	}
	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/payment-method/view', 'GET');

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
			text: 'New Payment Method',
			action: function(){
				$scope.newPaymentMethod = {};
				$("#new_setting_payment_method").modal("show");
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
		utils.DT.columnBuilder.newColumn('PaymentMethodName').withTitle("PaymentMethod"),
		utils.DT.columnBuilder.newColumn('PaymentMethodDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.paymentMethodActionMarkup).withOption('width', '25%').notSortable()
	]

	$scope.dtInstance = {};

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}
	$scope.tempHolder = {};

	$scope.editPaymentMethod = function(paymentMethodId){
		$scope.tempHolder.PaymentMethodName = $(".btn-payment-method[data-option-id='"+paymentMethodId+"']").attr('data-option-name');
		$scope.tempHolder.PaymentMethodDescription = $(".btn-payment-method[data-option-id='"+paymentMethodId+"']").attr('data-option-description');
		$scope.tempHolder.resourceId = paymentMethodId;
		$("#edit_setting_payment_method").modal("show");
	}

	$scope.deletePaymentMethod = function(paymentMethodId){
		var title = "Delete Prompt";
		var text = "You are about to delete the payment method named \""+$(".btn[data-option-id='"+paymentMethodId+"']").attr('data-option-name')+"\". Do you want to continue? Please note that this action cannot be undone";
		var close = true;
		$scope._paymentMethodId = paymentMethodId;
		var callback = function(){
			var deleteRequest = utils.serverRequest('/accounts-biller/payment-method/delete?'+utils.serializeParams({
				'resourceId': $scope._paymentMethodId
			}), 'DELETE');

			deleteRequest.then(function(response){
				utils.alert("Operation Successful", "The selected paymentMethod has been deleted successfully", "success", "notify");
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
	$scope.saveEditPaymentMethod = function(){
		var data = $scope.tempHolder;

		var request = utils.serverRequest('/accounts-biller/payment-method/edit', 'PUT', data);

		request.then(function(response){
			utils.alert("Operation Successful", "Your changes has been saved successfully", "success", "notify");
			$("#edit_setting_payment_method").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	$scope.saveNewPaymentMethod = function(){
		var data = $scope.newPaymentMethod;
		
		var request = utils.serverRequest('/accounts-biller/payment-method/new', 'POST', data);

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully creaed a new payment method", "success", "notify");
			$("#new_setting_payment_method").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
});