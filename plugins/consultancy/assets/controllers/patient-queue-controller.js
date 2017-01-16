angular.module("EmmetBlue")

.controller("patientQueueController", function($rootScope, $scope, utils){
	$scope.loadImage = utils.loadImage;
	$scope.queuedPatients = {};
	var loadQueue = function(consultant){
		var req = utils.serverRequest("/consultancy/patient-queue/view?resourceId="+consultant, "GET");

		req.then(function(response){
			$scope.queuedPatients = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.$on('reloadQueue', function(){
		var consultant = utils.userSession.getID();
		loadQueue(consultant);
	});

	$scope.removeFromQueue = function(id, uuid){
		var req = utils.serverRequest("/consultancy/patient-queue/delete?resourceId="+id, "DELETE");

		req.then(function(response){
			var patientsLeft = $scope.queuedPatients.length-1;
			utils.notify("", "The selected patient has been removed from queue, there are now "+ patientsLeft +" patients left to process", "success");
			//$rootScope.$broadcast("reloadQueue");
			utils.storage.currentPatientNumberDiagnosis = uuid;
			window.location.href = "consultancy/diagnosis";
		}, function(error){
			utils.errorHandler(error);
		});
	}
})