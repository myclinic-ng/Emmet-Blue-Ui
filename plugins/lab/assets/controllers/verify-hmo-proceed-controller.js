angular.module("EmmetBlue")

.controller('verifyHmoProceedController', function($scope, utils){
	$scope.getHmoProceedStatus = function(id){
		if (typeof id !== "undefined"){
			var request = utils.serverRequest("/accounts-biller/hmo-sales-verification/get-status?uuid="+id+"&staff="+utils.userSession.getID(), "GET");

			request.then(function(response){
				if (typeof response[0] !== "undefined" && typeof response[0].ProceedStatus !== "undefined" && response[0].ProceedStatus != false && response[0].ProceedStatus != null){
					utils.alert("Verification successful", "Proceed status confirmed", "success");
					if (response[0].SignComment !== null && response[0].SignComment !== ""){
						utils.notify("HMO Proceed Message", response[0].SignComment, "info");
					}
				}
				else if (typeof response[0] !== "undefined" && response[0].ProceedStatus == null){
					utils.notify("Request unconfirmed", "The specified request has not been processed, please refer patient to HMO", "info");
				}
				else{
					utils.alert("Verification Denied", "The specified request has been denied, please refer patient to HMO", "error");
					if (typeof response[0] !== "undefined" && response[0].SignComment !== null && response[0].SignComment !== ""){
						utils.notify("HMO Proceed Message", response[0].SignComment, "info");
					}
				}
				
				$("#verifyHmoProceed").modal("hide");
			}, function(error){
				utils.errorHandler(error);
			})
		}
		else {
			utils.notify("Unable to retrieve status", "Please provide a patient ID", "warning");
		}
	}
});