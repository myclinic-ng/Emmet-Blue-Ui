angular.module("EmmetBlue")

.controller("patientAppointmentsController", function($rootScope, $scope, utils){
	$scope.loadImage = utils.loadImage;
	$scope.todayAppointmentCount = 0;
	$scope.loadAppointments = function(dates = []){
		if (dates.length > 0){
			var req = utils.serverRequest("/patients/patient-appointment/view-by-staff?staff="+utils.userSession.getID()+"&daterange&sdate="+dates[0]+"&edate="+dates[1], "GET");
		}
		else {
			var req = utils.serverRequest("/patients/patient-appointment/view-by-staff?staff="+utils.userSession.getID(), "GET");
		}
		req.then(function(response){
			$scope.appointments = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.deleteAppointment = function(id){
		var req = utils.serverRequest("/patients/patient-appointment/delete?resourceId="+id, "DELETE");
		req.then(function(response){
			utils.notify("Operation Successful", "The selected appointment has been deleted successfully", "success");
			$scope.loadAppointments();
			$scope.loadTodayAppointments();
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadTodayAppointment = function(dates){
		var req = utils.serverRequest("/patients/patient-appointment/view-by-staff?staff="+utils.userSession.getID()+"&daterange&sdate="+dates[0]+"&edate="+dates[1], "GET");
		req.then(function(response){
			$scope.todayAppointments = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.$on('reloadAppointments', function(){
		loadTodayAppointment([
			(new Date()).toLocaleDateString(),
			(new Date()).toLocaleDateString()
		]);
	});

	$scope.loadTodayAppointments = function(){
		$rootScope.$broadcast('reloadAppointments');
	}

	$scope.toDateString = function(date){
		var date = new Date(date);
		return date.toDateString();
	}
})