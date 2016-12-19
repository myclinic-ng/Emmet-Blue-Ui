angular.module("EmmetBlue")

.controller("patientQueueController", function($scope, utils){
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

	$scope.removeFromQueue = function(id){
		var req = utils.serverRequest("/consultancy/patient-queue/delete?resourceId="+id, "DELETE");

		req.then(function(response){
			var patientsLeft = $scope.queuedPatients.length-1;
			utils.alert("Profile processed successfully", "This patient has been removed from the queue successfully, there are now "+ patientsLeft +" patients left to process", "success");
			$scope.$broadcast("reloadQueue");
		}, function(error){
			utils.errorHandler(error);
		});
	}
})