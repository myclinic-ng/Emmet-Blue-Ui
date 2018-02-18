angular.module("EmmetBlue")

.controller('accountsAccountReportsController', function($scope, $rootScope, utils){
	$scope.currentReport = 'balancesheet';

	var loadAccountingPeriods = function(){
		var req = utils.serverRequest('/financial-accounts/accounting-period/view-alias', 'GET');
		req.then(function(result){
			$scope.accountingPeriods = result;
		}, function(error){
			utils.errorHandler(error);
		});
	}();

	var init = function(){
		var today = new Date();
		$scope.journalFilter = {
			type: 'date',
			description: 'Today, '+today.toDateString(),
			value: today.toLocaleDateString() + " - " + today.toLocaleDateString()
		}

		$("option[status='disabled']").attr("disabled", "disabled");

		$scope.journalEntries = {};
	}();

	$scope.toLocaleDateString = function(date){
		return new Date(date).toLocaleDateString();
	}

	$scope.getDateRange = function(selector){
		var today = new Date();
		switch(selector){
			case "today":{
				return today.toLocaleDateString() + " - " + today.toLocaleDateString();
			}
			case "yesterday":{
				var yesterday = new Date(new Date(new Date()).setDate(new Date().getDate() - 1)).toLocaleDateString();
				return yesterday + " - " + yesterday;
				break;
			}
			case "week":{
				var d = new Date(today);
			  	var day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1);

			  	return new Date(d.setDate(diff)).toLocaleDateString() + " - " + today.toLocaleDateString();
			  	break;
			}
			case "month":{
				var year = today.getFullYear();
				var month = today.getMonth() + 1;

				return month+'/1/'+year + ' - ' + today.toLocaleDateString();
				break;
			}
		}
	}

	$scope.activateFilter = function(){
		var selector = $scope.filterSelector;
		switch(selector.type){
			case "period":{
				$scope.journalFilter.type = "date";
				var value = selector.value.split("<seprator>");
				$scope.journalFilter.value = value[1];
				$scope.journalFilter.description = value[0];
				break;
			}
			case "dateRange":{
				$scope.journalFilter.type = "date";
				var value = selector.value.split(" - ");
				$scope.journalFilter.value= selector.value;
				$scope.journalFilter.description = "Date Ranges Between: "+ new Date(value[0]).toDateString()+" And "+ new Date(value[1]).toDateString();
				break;
			}
			case "search":{
				$scope.journalFilter.type = "query";
				$scope.journalFilter.value= selector.value;
				$scope.journalFilter.description = "Search Query For '"+selector.value+"'";
				break;
			}
			default:{
				$scope.journalFilter.type = "date";
				var value = selector.type.split("<seprator>");
				$scope.journalFilter.value = value[1];
				$scope.journalFilter.description = value[0];
			}
		}

		$rootScope.$broadcast("reloadFinReport", $scope.journalFilter);
	}
});
