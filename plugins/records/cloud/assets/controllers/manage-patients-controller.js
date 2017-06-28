angular.module("EmmetBlue")

.controller("recordsCloudManagePatientsController", function($scope, utils, patientEventLogger){
	$scope.loadDeps = false;
	$scope.utils = utils;

	$scope.patientProfile = {};
	$scope.patientProfileMeta = {};
	$scope.profileSelected = false;
	$scope.loadPatientProfile = function(id){
		if (!$scope.profileSelected){
			$("#patientTable").removeClass("col-md-12").addClass("col-md-3");
			$scope.profileSelected = true;
		}
		if (typeof(id) !== "undefined"){
			var loadProfile = utils.serverRequest("/patients/patient/view?resourceId="+id, "GET");

			loadProfile.then(function(response){
				$scope.patientProfileMeta = response[0];
				delete response[0];
				$scope.patientProfile = response;
			}, function(response){
				utils.errorHandler(response);
			})
		}
	}

	$scope.searched = {};
	$scope.searched.searchIcon = "icon-search4";

	$scope.searched.pageSize = $scope.searched.pageSizeInc = 10;
	$scope.searched.currentPage = 0;
	$scope.searched.fromCounter = 0;

	function search(url){
		$scope.searched.searchIcon = "fa fa-spinner fa-spin";
		if ($scope.searched.pageSize < 1){
			$scope.searched.pageSize = $scope.searched.pageSizeInc = 10;
		}
		var size = $scope.searched.pageSize;
		var from = $scope.searched.fromCounter;
		var request = utils.serverRequest(url+'&size='+size+'&from='+from, "GET");

		request.then(function(response){
			if (typeof response.hits !== 'undefined'){
				$scope.searched.totalPageCount = response.hits.total;
				$scope.searched.patients = response.hits.hits;
				$scope.searched.searchIcon = "icon-search4";
			}
		}, function(response){
			utils.errorHandler(response);
			$scope.searched.searchIcon = "icon-search4";
		})
	}

	$scope.pageChangeHandler = function(newPageNumber){
		$scope.searched.currentPage = newPageNumber;
		if (newPageNumber != 1)
		{
			$scope.searched.fromCounter = $scope.searched.pageSize * (newPageNumber - 1);
		}
		else
		{
			$scope.searched.fromCounter = 0;
		}
		$scope.search();
	}

	var loadPatients = function(){
		var request = utils.serverRequest("/patients/patient/view", "GET");

		request.then(function(response){
			if (typeof response.hits !== "undefined"){				
				$scope.searched.totalPageCount = response.hits.total;
				$scope.searched.patients = response.hits.hits;	
			}
		}, function(response){
			utils.errorHandler(response);
		})
	}
	
	loadPatients();

	$scope.search = function(newSearch = false){
		var query = $scope.search.query;

		if (newSearch){
			$scope.searched.fromCounter = 0;
		}

		search("/patients/patient/search?query="+query);
	}

	$scope.catchEnterSearch = function(event){
		if (event.which == 13){
			$scope.search(true);
		}
	}
})