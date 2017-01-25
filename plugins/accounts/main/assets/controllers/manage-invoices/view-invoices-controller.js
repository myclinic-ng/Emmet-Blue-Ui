angular.module("EmmetBlue")

.controller("accountsBillingManageInvoicesViewInvoicesController", function($scope, utils){
	// GLOBALS
	$scope.transactionStatuses = {};
	$scope.invoices = [];

	var statusesRequest = utils.serverRequest("/accounts-biller/transaction-status/view", "GET");
	statusesRequest.then(function(response){
		$scope.transactionStatuses = response;
	}, function(responseObject){
		utils.errorHandler(responseObject);
	});

	$scope.filter = {};
	$scope.pages = {
		from: 1,
		to: 50
	};

	function loadInvoices(){
		var url = "/accounts-biller/transaction-meta/view?resourceId=0&";
		if ($scope.filter.type == "date"){
			url += "filtertype=date&startdate="+$scope.filter.dates[0]+"&enddate="+$scope.filter.dates[1];
		}

		url += "&from="+$scope.pages.from+"&to="+$scope.pages.to;

		var sendInvoicesRequest = utils.serverRequest(url, "GET");

		sendInvoicesRequest.then(function(response){
			$scope.invoices = response;
		}, function(response){
			utils.errorHandler(response);
		})
	}



	$scope.getDateRange = function(selector){
		var today = new Date();
		switch(selector){
			case "today":{
				return today.toLocaleDateString() + " - " + today.toLocaleDateString();
			}
			case "yesterday":{
				var yesterday = new Date(new Date(new Date()).setDate(new Date().getDate() - 1));
				return yesterday
				break;
			}
			case "week":{
				var d = new Date(today);
			  	var day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1);

			  	return new Date(d.setDate(diff));
			  	break;
			}
			case "month":{
				var year = today.getFullYear();
				var month = today.getMonth() + 1;

				return month+'/1/'+year;
				break;
			}
		}
	}

	$scope.filterInvoices = function(type){
		switch(type){
			case "daterange":{
				$scope.filter.type = "date";
				var dates = ($scope.dateRangeFilter).split(" - ");
				$scope.filter.label = "Date Range: "+(new Date(dates[0])).toDateString()+" To "+ (new Date(dates[1])).toDateString();
				$scope.filter.dates = dates;
				break;
			}
			case "today":{
				$scope.filter.type = "date";
				$scope.filter.label = "Today, "+(new Date()).toDateString();
				$scope.filter.dates = [(new Date()).toLocaleDateString(), (new Date()).toLocaleDateString()];
				break;
			}
			case "yesterday":{
				$scope.filter.type = "date";
				$scope.filter.label = "Yesterday, "+($scope.getDateRange("yesterday")).toDateString();
				$scope.filter.dates = [($scope.getDateRange("yesterday")).toLocaleDateString(), ($scope.getDateRange("yesterday")).toLocaleDateString()];
				break;
			}
			case "week":{
				$scope.filter.type = "date";
				$scope.filter.label = "Since This Week, "+($scope.getDateRange("week")).toDateString()+" To "+ (new Date()).toDateString();
				$scope.filter.dates = [($scope.getDateRange("week")).toLocaleDateString(), (new Date()).toLocaleDateString()];
				break;
			}
		}

		loadInvoices();
	}

	$scope.filterInvoices("today");
})