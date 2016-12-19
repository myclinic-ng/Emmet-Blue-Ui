angular.module("EmmetBlue")

.controller("nursingStationMenuController", function($scope, utils){
	function countQueue(){
		var req = utils.serverRequest('/patients/patient/view-unlocked-profiles', 'GET');
		req.then(function(response){
			$scope.queueCount = response.length;
		})
	};

	$scope.$on("recountQueue", function(){
		countQueue();
	})

	countQueue();
})

.controller("nursingStationDashboardController", function($scope, utils){
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/nursing/station/assets/includes/";
		switch(segment){
			case "patient-queue":{
				$scope.pageSegment = "plugins/nursing/"+"queued-patients.html";
				break;
			}
			case "payment-request":{
				$("#_payment_request").modal("show");
				break;
			}
			case "view-statistics":{
				$scope.pageSegment = urlPart+"manage-invoices/view-statistics.html";
				break;
			}
			case "load-settings":{
				$scope.pageSegment = urlPart+"manage-invoices/settings.html";
				break;
			}
		}
	}

	$scope.loadPageSegment('patient-queue');
})