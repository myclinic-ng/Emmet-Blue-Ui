angular.module("EmmetBlue")

.controller("mainController", function($rootScope, $scope, utils){
	$scope.queuedPatients = {};
	$scope.iconSpinner = "<i class='fa fa-spin fa-circle-o-notch'></i>";
	$scope.queueCount = $scope.iconSpinner;

	function loadQueue(){
		var consultant = utils.userSession.getID();
		$scope.queuedPatients = {};
		var req = utils.serverRequest("/consultancy/patient-queue/view?resourceId="+consultant, "GET");

		req.then(function(response){
			$scope.queuedPatients = response;
			$scope.queueCount = response.length;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	var loadTodayAppointment = function(dates){
		var req = utils.serverRequest("/patients/patient-appointment/view-by-staff?staff="+utils.userSession.getID()+"&daterange&sdate="+dates[0]+"&edate="+dates[1], "GET");
		req.then(function(response){
			$scope.appointmentCount = response.length;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.reloadQueue = function(){
		$rootScope.$broadcast('reloadQueue');
	}

	$scope.reloadAppointments = function(){
		$rootScope.$broadcast('reloadAppointments');		
	}

	$scope.$on("reloadQueue", function(){
		loadQueue();
	});

	$scope.$on("reloadAppointments", function(){
		loadTodayAppointment([
			(new Date()).toLocaleDateString(),
			(new Date()).toLocaleDateString()
		]);
	})
	$scope.reloadQueue();
	$scope.reloadAppointments();
})