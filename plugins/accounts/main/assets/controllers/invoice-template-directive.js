angular.module("EmmetBlue")

.directive('ngInvoice', function(){
	return {
		restrict: "E",
		scope: {
			invoiceData: "=invoiceData"
		},
		templateUrl: "plugins/accounts/billing/assets/includes/invoice-template.html",
		controller: function($scope, utils){
			$scope.$watch("invoiceData", function(nv){
				if (typeof nv != "undefined"){
					var request = utils.serverRequest("/patients/patient/view?resourceId="+nv.patient, "GET");

					request.then(function(response){
						$scope.patient = response["_source"];
					}, function(response){
						utils.errorHandler(response);
					})
				}
			});
			
			$scope.getItemName = function(item){
				utils.serverRequest('/accounts-biller/billing-type-items/view-by-id?resourceId='+item, "GET").then(function(response){
					console.log(response);
					return response;
				})
			}
		}
	}
})