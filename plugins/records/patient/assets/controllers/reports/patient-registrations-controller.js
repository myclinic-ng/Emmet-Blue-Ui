angular.module("EmmetBlue")

.controller("recordsReportsPatientRegistrationController", function($scope, utils){
	$scope.pageSegment = "";
	$scope.loadPageSegment = function(segment){
		var urlPart = "plugins/records/patient/assets/includes/reports/";
		switch(segment){
			case "new-registration":{
				$scope.pageSegment = urlPart+"patient-registrations-report.html";
				break;
			}
		}
	}

	$scope.loadPageSegment('new-registration');

	$scope.dates = [];
	$scope.$watch(function(){
		return utils.storage.currentReportDateRange;
	}, function(value){
		$scope.dates = value;
		reloadData();
	});

	function reloadData(){
		var req = utils.serverRequest("/patients/reports/get-total-registration?startdate="+$scope.dates[0]+"&enddate="+$scope.dates[1], "GET");
		req.then(function(response){
			$scope.report = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}
})

.controller("recordsReportsPatientRegistrationTabRegController", function($scope, utils){
	$scope.dates = [];
	$scope.$watch(function(){
		return utils.storage.currentReportDateRange;
	}, function(value){
		$scope.dates = value;
		reloadData();
	});

	function reloadData(){
		var req = utils.serverRequest("/patients/reports/get-total-registration-by-categories?startdate="+$scope.dates[0]+"&enddate="+$scope.dates[1], "GET");
		req.then(function(response){
			$scope.categoriesReport = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.loadCategory = function(category){
		$scope.currentCategory = {
			id: category
		};

		var req = utils.serverRequest("/patients/reports/get-total-registration-by-category?startdate="+$scope.dates[0]+"&enddate="+$scope.dates[1]+"&category="+category, "GET");
		req.then(function(response){
			$scope.currentCategory.types = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}
})