angular.module("EmmetBlue")

.directive('ngPaymentReceipt', function(){
	return {
		restrict: "AE",
		scope: {
			receiptData: "=receiptData"
		},
		templateUrl: "plugins/accounts/billing/assets/includes/receipt-template.html",
		controller: function($scope, utils){
			// $scope.$watch("receiptData", function(nv){
			// })

			$scope.today = function(){
				return utils.today()+ " " + (new Date()).toLocaleTimeString();
			}

			var req = utils.serverRequest("/human-resources/staff/view-staff-profile?resourceId="+utils.userSession.getID(), "GET");

			req.then(function(response){
				$scope.currentStaffInfo = response[0];
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}
})