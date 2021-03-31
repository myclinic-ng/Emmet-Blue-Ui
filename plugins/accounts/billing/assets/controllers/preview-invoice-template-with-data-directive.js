angular.module("EmmetBlue")

.directive('ngPreviewInvoiceWithData', function(){
	return {
		restrict: "E",
		scope: {
			temp: "=previewInvoiceData"
		},
		templateUrl: "plugins/accounts/billing/assets/includes/preview-invoice-template-with-data.html",
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