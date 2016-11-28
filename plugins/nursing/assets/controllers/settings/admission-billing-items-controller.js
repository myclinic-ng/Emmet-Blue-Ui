angular.module("EmmetBlue")

.controller("nursingSettingAdmissionBillingTypeItemsController", function($scope, utils){
	function dtAction(data, full, meta, type){
		deleteButtonAction = "manage('delete',"+data.AdmissionBillingItemID+")";

		var data = "data-option-id='"+data.AdmissionBillingItemID+"' data-option-name='"+data.BillingTypeItemName+"'";

		deleteButton = "<button class='btn btn-default btn-fields' ng-click=\""+deleteButtonAction+"\""+data+"> <i class='fa fa-close'></i> Remove from list</button>";

		return "<div class='btn-group'>"+deleteButton+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/nursing/admission-billing-items/view', 'GET');
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
		utils.DT.columnBuilder.newColumn('BillingTypeItemName').withTitle("Current Fixed Billing Items For Admitted Patients"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}

	$scope.billingTypeItems = {};
	function loadAdmissionBillingItems(){
		var request = utils.serverRequest("/accounts-biller/billing-type-items/view-by-staff-uuid?resourceId=0&uuid="+utils.userSession.getUUID(), "GET");
		
		request.then(function(result){
			$scope.billingTypeItems = result;
		}, function(error){
			utils.errorHandler(error);
		})
	}
	loadAdmissionBillingItems();
	
	$scope.manage = function(value, id){
		switch(value)
		{
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to remove "+$(".btn-fields[data-option-id='"+id+"']").attr('data-option-name')+" from the billing items list. Do you want to continue?";
				var close = true;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/admission-billing-items/delete?'+utils.serializeParams({
						'resourceId': id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "The selected billing type item has been unlinked successfully", "success");
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
		var billingTypeItems = $scope.billingTypeItem;

		utils.serverRequest("/nursing/admission-billing-items/new", "POST", {"item": billingTypeItems}).then(function(response){
			utils.notify("Operation Successful", "The selected billing type item has been linked successfully", "success");
			reloadTable();
		}, function(error){
			utils.errorHandler(error);
		})
	}
})