angular.module("EmmetBlue")

.directive('ngPreviewInvoice', function(){
	return {
		restrict: "E",
		scope: {
			invoiceId: "=invoiceId"
		},
		templateUrl: "plugins/accounts/billing/assets/includes/preview-invoice-template.html",
		controller: function($scope, utils){
			$scope.paymentRequestBillingItems = function(paymentRequestId){
				var items = utils.serverRequest('/accounts-biller/payment-request/load-payment-request-billing-items?resourceId='+paymentRequestId,'get');
				items.then(function(response){
					$scope.itemsList = response;
					$scope.itemsList.globalTotal = 0;
					angular.forEach(response, function(value, key){
						$scope.itemsList.globalTotal += +value.totalPrice;
					});

				}, function(error){
					utils.errorHandler(error);
					utils.alert("Unable To Load Payment Form", "Please see the previous errors", "error");
				})
			}

			// $scope.$watch(functon(){
			// 	return $scope.invoiceId;
			// }, function(nv){
			// 	var req=utils.serverRequest("/accounts-biller/payment-request/load-all-requests?filtertype=invoice&query="+nv, "GET");
			// 	req.then(function(response){
			// 		response = response[0];
			// 		$scope.temp = {
			// 			requestId:response.PaymentRequestID,
			// 			requestNumber:response.PaymentRequestUUID,
			// 			staffUUID: response.RequestBy,
			// 			patientUUID: response.PatientUUID,
			// 			patientID:response.RequestPatientID,
			// 			patientFullName: response.PatientFullName,
			// 			patientType: response.PatientType,
			// 			patientCategoryName: response.PatientCategoryName,
			// 			patientTypeName: response.PatientTypeName,
			// 			requestDate: (new Date(response.RequestDate)).toDateString(),
			// 			fulfillmentStatus: response.RequestFulFillmentStatus,
			// 			fulfilledDate: (new Date(response.RequestFulfilledDate)).toDateString(),
			// 			fulfilledBy: response.RequestFulfilledBy,
			// 			deptName: response.GroupName,
			// 			subDeptName: response.Name
			// 		};
			// 	}, function(error){
			// 		utils.errorHandler(error);
			// 	});
			// })

			$scope.$watch(function(){
				if (typeof $scope.invoiceId != "undefined"){
					return $scope.invoiceId
				}
				return 0;
			}, function(nv){
				$scope.temp = {};
				if (nv != 0){
					var req=utils.serverRequest("/accounts-biller/payment-request/load-all-requests?filtertype=invoice&query="+nv, "GET");
					req.then(function(response){
						response = response[0];
						$scope.temp = {
							requestId:response.PaymentRequestID,
							requestNumber:response.PaymentRequestUUID,
							staffUUID: response.RequestBy,
							patientUUID: response.PatientUUID,
							patientID:response.RequestPatientID,
							patientFullName: response.PatientFullName,
							patientType: response.PatientType,
							patientCategoryName: response.PatientCategoryName,
							patientTypeName: response.PatientTypeName,
							requestDate: (new Date(response.RequestDate)).toDateString(),
							fulfillmentStatus: response.RequestFulFillmentStatus,
							fulfilledDate: (new Date(response.RequestFulfilledDate)).toDateString(),
							fulfilledBy: response.RequestFulfilledBy,
							deptName: response.GroupName,
							subDeptName: response.Name
						};
					}, function(error){
						utils.errorHandler(error);
					});
				}
			})

			$scope.$watch(function(){
				if (typeof $scope.temp !== "undefined"){
					return $scope.temp.requestId;
				}
				return "";
			}, function(nv){
				if (typeof nv !== "undefined" && nv != ""){
					$scope.paymentRequestBillingItems(nv);
				}
			})

			$scope.removeFromItemList = function(index, item){
				utils.alert("Operation not allowed", "You are not allowed to perform that action", "info");
			}
		}
	}
})