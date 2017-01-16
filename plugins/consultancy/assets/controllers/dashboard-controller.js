angular.module("EmmetBlue")

.controller("consultancyDashboardController", function($scope, utils){
	$scope.loadImage = utils.loadImage;
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/consultancy/";
		switch(segment){
			case "admission-register":{
				$scope.pageSegment = "plugins/nursing/ward/patient-admission-template.html";
				$scope.pageTitle = "List of Patients Currently On Admission";
				$scope.pageLink = "consultancy/patient-admission";
				break;
			}
			case "admission-workspace":{
				$scope.pageSegment = urlPart+"patient-workspace.html";
				$scope.pageTitle = "Admitted Patients Workspace";
				$scope.pageLink = "consultancy/patient-workspace";
				break;
			}
			case "show-info":{
				utils.alert("We haven't gathered enough information", "To be able to utilize this feature, we need to gather more information about your use of the software. Usually this takes a week.", "info");
				break;
			}
		}
	}

	$scope.loadPageSegment('admission-register');

	$scope.queuedPatients = {};
	$scope.queueCount = 0;
	$scope.savedDiagnosis = {};

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

	$scope.$on("reloadQueue", function(){
		loadQueue();
	});

	loadQueue();

	function loadSavedDiagnosis(){
		var consultant = utils.userSession.getID();
		var req = utils.serverRequest("/consultancy/saved-diagnosis/view-patients?resourceId="+consultant, "GET");

		req.then(function(response){
			$scope.savedDiagnosis = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadSavedDiagnosis();

	$scope.deleteDiagnosis = function(diagId){
		var req = utils.serverRequest("/consultancy/saved-diagnosis/delete?resourceId="+diagId, "GET");

		req.then(function(response){
			loadSavedDiagnosis();
		}, function(error){
			utils.errorHandler(error);
		})
	}
})