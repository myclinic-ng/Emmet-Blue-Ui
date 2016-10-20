angular.module("EmmetBlue")

.controller("recordsPatientPaymentRequestController", function($scope, utils, patientEventLogger){
	$scope.loadImage = utils.loadImage;
	$scope.requestItems = {};
	$scope.paymentRequestItem = {};
	$scope.paymentRequestItems = [];
	$scope.requestForm = {
		showSearchResult: true
	}

	function loadRequestItems(staff){
		var request = utils.serverRequest("/accounts-biller/billing-type-items/view-by-staff-uuid?resourceId=0&uuid="+staff, "GET");

		request.then(function(response){
			$scope.requestItems = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadRequestItems(utils.userSession.getUUID());	

	function search(url){
		$scope.requestForm.showSearchResult = true;
		$scope.searched.searchIcon = "fa fa-spinner fa-spin";
		if ($scope.searched.pageSize < 1){
			$scope.searched.pageSize = $scope.searched.pageSizeInc = 30;
		}
		var size = $scope.searched.pageSize;
		var from = $scope.searched.fromCounter;
		var request = utils.serverRequest(url+'&size='+size+'&from='+from, "GET");

		request.then(function(response){
			if (typeof response.hits !== 'undefined'){
				$scope.searched.totalPageCount = response.hits.total;
				$scope.searched.patients = response.hits.hits;
				$scope.searched.searchIcon = "icon-search4";
			}
		}, function(response){
			utils.errorHandler(response);
			$scope.searched.searchIcon = "icon-search4";
		})
	}

	$scope.search = function(newSearch = false){
		var query = $scope.search.query;

		if (newSearch){
			$scope.searched.fromCounter = 0;
		}

		search("/patients/patient/search?query="+query);
	}

	$scope.showRequestForm = function(patient){
		$scope.requestForm.showSearchResult = false;
		$scope.requestForm.currentPatientProfile = patient;
		$scope.paymentRequestItems = [];
	}

	$scope.addPaymentRequestItemToList = function(){
		var item = {
			quantity: $scope.paymentRequestItem.quantity ? $scope.paymentRequestItem.quantity: 1,
			_item:  JSON.parse($scope.paymentRequestItem.item)
		}
		item.item = item._item.BillingTypeItemID;
		$scope.paymentRequestItems.push(item);
		$scope.paymentRequestItem = {};
	}

	$scope.createRequest = function(){
		var reqData = {
			patient: $scope.requestForm.currentPatientProfile.patientid,
			requestBy: utils.userSession.getUUID(),
			items: $scope.paymentRequestItems
		}

		var request = utils.serverRequest("/accounts-biller/payment-request/new", "POST", reqData);

		request.then(function(response){
			utils.notify("Operation successful", "Request generated successfully", "success");
			$scope.requestForm.showSearchResult = true;
			$scope.paymentRequestItems = [];
		}, function(error){
			utils.errorHandler(error);

		})
	}

	$scope.verifyPayment = function(requestNumber){
		var request = utils.serverRequest('/accounts-biller/payment-request/get-status?resourceId&requestNumber='+requestNumber, 'GET');
		request.then(function(response){
			if (response.length < 1){
				utils.notify("An error occurred", "Seems like that payment request number does not exist or you have submitted an empty form, please try again", "warning");
			}
			else
			{
				if (response[0]["Status"] == 1){
					utils.alert("Verification successful", "The specified payment request has been fulfilled", "success");
				}
				else {
					utils.alert("Request Unfulfilled", "The specified payment request has not been fulfilled", "error");
				}
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.loadRequests = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var requests = utils.serverRequest('/accounts-biller/payment-request/load-requests?resourceId&staff='+utils.userSession.getUUID(), 'GET');
		return requests;
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
        	extend: 'print',
        	text: '<i class="icon-printer"></i> <u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	}
        },
        {
        	extend: 'copy',
        	text: '<i class="icon-copy"></i> <u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: false,
        		altKey: true
        	}
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('PaymentRequestUUID').withTitle("Request Number"),
		utils.DT.columnBuilder.newColumn('RequestDate').withTitle("Request Date"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Fulfillment Status").renderWith(function(data, full, meta){
			if (data.RequestFulfillmentStatus == 1){
				return "<p class='badge badge-success badge-lg'>Fulfilled</p>";
			}
			else {
				return "<p class='badge badge-danger badge-lg'>Unfulfilled</p>";
			}
		})
	];
})