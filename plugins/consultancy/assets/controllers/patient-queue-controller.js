angular.module("EmmetBlue")

.controller("patientQueueController", function($rootScope, $scope, utils, $location){
	$scope.loadImage = utils.loadImage;
	$scope.queuedPatients = {};
	var loadQueue = function(consultant){
		var req = utils.serverRequest("/consultancy/patient-queue/view?resourceId="+consultant, "GET");

		req.then(function(response){
			$scope.queuedPatients = response;
		});
	}

	$scope.$on('reloadQueue', function(){
		var consultant = utils.userSession.getID();
		loadQueue(consultant);
		countQueue();
	});

	function countQueue(){
		var req = utils.serverRequest('/patients/patient/view-unlocked-profiles', 'GET');
		req.then(function(response){
			$scope.gQueueCount = response.length;
			$scope.gQueue = response;
		})
	};

	$scope.$on("recountQueue", function(){
		countQueue();
	})

	countQueue();

	$scope.removeFromQueue = function(id, uuid){
		$("#_patient-queue").modal("hide");
		var req = utils.serverRequest("/consultancy/patient-queue/delete?resourceId="+id, "DELETE");

		req.then(function(response){
			var patientsLeft = $scope.queuedPatients.length-1;
			utils.notify("", "The selected patient has been removed from queue, there are now "+ patientsLeft +" patients left to process", "success");
			utils.storage.currentPatientNumberDiagnosis = uuid;
			$rootScope.$broadcast("reloadQueue");
			// window.location.href = "consultancy/diagnosis";
			$location.path("consultancy/diagnosis");
		}, function(error){
			utils.errorHandler(error);
		});
	}
})