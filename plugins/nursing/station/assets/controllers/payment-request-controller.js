angular.module("EmmetBlue")

.controller("nursingStationPaymentRequestController", function($scope, utils, patientEventLogger){
	$scope.loadImage = utils.loadImage;
	$scope.requestItems = {};
	$scope.paymentRequestItem = {};
	$scope.paymentRequestItems = [];
	$scope.requestForm = {
		showSearchResult: true
	}
	$scope.searched = {
		searchIcon: "fa fa-search"
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
		var request = utils.serverRequest(url, "GET");

		request.then(function(response){
			if (typeof response["_source"] !== 'undefined'){
				response = response["_source"];
				$scope.showRequestForm(response);
				$scope.searched.searchIcon = "icon-search4";
			}
			else {
				$scope.searched.searchIcon = "icon-search4";
				utils.notify("Patient not found", "The specified patient hospital number does not exist, please check for errors and try again", "warning");
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

		search("/patients/patient/view?resourceId="+query);
		utils.storage.currentPaymentRequest = "";
	}

	$scope.showRequestForm = function(patient){
		$scope.requestForm.showSearchResult = false;
		$scope.requestForm.currentPatientProfile = patient;
		$scope.paymentRequestItems = [];
		$scope.search.query = "";
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

	$scope.removeItem = function(index){
		$scope.paymentRequestItems.splice(index, 1);
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

			var eventLog = patientEventLogger.accounts.newPaymentRequestEvent(
				$scope.requestForm.currentPatientProfile.patientid,
				'Nursing Station',
				response.lastInsertId
			);
			eventLog.then(function(response){
				//patient registered event logged
			}, function(response){
				utils.errorHandler(response);
			});
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
				$scope.paymentRequestNumber = "";
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
})