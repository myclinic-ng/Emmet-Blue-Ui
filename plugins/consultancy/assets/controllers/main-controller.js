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

	$scope.reloadQueue = function(){
		$rootScope.$broadcast('reloadQueue');
	}

	$scope.$on("reloadQueue", function(){
		loadQueue();
	});

	$scope.reloadQueue();
})