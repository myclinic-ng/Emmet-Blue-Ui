angular.module("EmmetBlue")

.controller("nursingStationMenuController", function($scope, utils){
	$scope.loadImage = utils.loadImage;
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

	$scope.loadDailyLog = function(){
		var data = {
			startdate: (new Date()).toLocaleDateString(),
			enddate: (new Date()).toLocaleDateString(),
			filtertype: 'staff',
			query: utils.userSession.getID(),
			paginate: '',
			size: 20,
			from: 1
		}

		var req = utils.serverRequest("/nursing/reports/view-patient-process-log", "POST", data);
		req.then(function(response){
			$scope.dailyLog = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.getTime = function(date){
		return (new Date(date)).toLocaleTimeString();
	}
})

.controller("nursingStationDashboardController", function($scope, utils, $rootScope){
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/nursing/station/assets/includes/";
		switch(segment){
			case "patient-queue":{
				$scope.pageSegment = "plugins/nursing/station/"+"queued-patients.html";
				break;
			}
			case "payment-request":{
				$("#_payment_request").modal("show");
				break;
			}
			case "prescription-request":{
				$("#_pharmacy_request").modal("show");
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

	$scope.reloadQueue = function(){
		$rootScope.$broadcast("reloadQueue")
	}

	$scope.loadPageSegment('patient-queue');
})