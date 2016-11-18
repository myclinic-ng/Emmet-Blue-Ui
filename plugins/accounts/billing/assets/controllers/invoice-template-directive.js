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
			})
		}
	}
})