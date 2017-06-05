angular.module("EmmetBlue")

.directive('ngAccountAnalysisReport', function(){
	return {
		restrict: "E",
		scope: {
			// invoiceData: "=invoiceData"
		},
		templateUrl: "plugins/accounts/main/assets/includes/reports/account-analysis-template.html",
		controller: function($scope, utils){
			var req = utils.serverRequest("/financial-accounts/account-register/get-account-entries?resourceId=14700&startdate=05/01/2017&enddate=05/31/2017", "GET");

			req.then(function(response){
				$scope.analysis = response;
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}
})