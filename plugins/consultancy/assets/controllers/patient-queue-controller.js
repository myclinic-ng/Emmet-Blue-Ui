angular.module("EmmetBlue")

.controller("patientQueueController", function($scope, utils){
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
})