angular.module("EmmetBlue")

.controller("labPaymentRequestController", function($scope, utils, patientEventLogger, $rootScope){
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

	$scope.$watch(function(){
		return utils.storage.currentPaymentRequest;
	}, function(nv){
		if (typeof nv !== "undefined" && nv !== "" && nv !== null){
			$scope.search.query = nv;
			$scope.search();
		}
	});

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
			if (typeof response[0] !== 'undefined'){
				var a = [];
				for (var i = 0; i < response.length; i++){
					a.push(response[i].InvestigationTypeName);
				}
				$scope.investigation = a.join(", ");
				response = response[0];
				$scope.showRequestForm(response);
				$scope.searched.searchIcon = "icon-search4";
			}
			else {
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

		search("/lab/patient/view?resourceId="+query);
		$scope.requestId = utils.storage.currentPaymentRequest;
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

		var _i = item._item.BillingTypeItemID;
		var _p = $scope.requestForm.currentPatientProfile.PatientID;
		var _q = item.quantity;

		$scope.item = item;

		utils.serverRequest("/accounts-biller/get-item-price/calculate?resourceId="+_p+"&item="+_i+"&quantity="+_q, "GET")
		.then(function(response){
			$scope.item.price = response.totalPrice;

			$scope.paymentRequestItems.push(item);
			$scope.paymentRequestItem = {};
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.removeItem = function(index){
		$scope.paymentRequestItems.splice(index, 1);
	}

	$scope.createRequest = function(){
		var reqData = {
			patient: $scope.requestForm.currentPatientProfile.PatientID,
			requestBy: utils.userSession.getUUID(),
			items: $scope.paymentRequestItems
		}

		var request = utils.serverRequest("/accounts-biller/payment-request/new", "POST", reqData);

		request.then(function(response){
			utils.notify("Operation successful", "Request generated successfully", "success");
			$scope.requestForm.showSearchResult = true;

			utils.serverRequest("/lab/lab-request/close-request", "POST", {"request": $scope.requestId, "staff": utils.userSession.getID()})
			.then(function(response){
				$rootScope.$broadcast("ReloadQueue");
				$rootScope.$broadcast("reloadLabPatients", {});
			}, function(error){
				utils.errorHandler(error);
			});

			var eventLog = patientEventLogger.accounts.newPaymentRequestEvent(
				$scope.requestForm.currentPatientProfile.PatientID,
				'Laboratory',
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