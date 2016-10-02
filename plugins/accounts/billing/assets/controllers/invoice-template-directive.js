angular.module("EmmetBlue")

.directive('ngInvoice', function(){
	return {
		restrict: "E",
		scope: {
			invoiceData: "=invoiceData"
		},
		templateUrl: "plugins/accounts/billing/assets/includes/invoice-template.html",
		controller: function($scope, utils){
			var request = utils.serverRequest("/patients/patient/view?resourceId="+$scope.invoiceData.patient, "GET");

			request.then(function(response){
				$scope.patient = response["_source"];
				console.log($scope.patient);
			}, function(response){
				utils.errorHandler(response);
			})
		}
	}
})