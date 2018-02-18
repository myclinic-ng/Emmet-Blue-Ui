angular.module("EmmetBlue")

.controller("accountsMainViewGeneralJournalController", function($rootScope, $scope, utils){
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

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var url = '/financial-accounts/general-journal/view?resourceId=0';
		var filter = $scope.journalFilter;
		if (filter.type == 'date'){
			var dates = filter.value.split(" - ");
			url += '&startdate='+dates[0]+'&enddate='+dates[1];
		}
		else if (filter.type == 'query'){
			url += '&query='+filter.value;
		}

		var periods = utils.serverRequest(url, 'GET');
		return periods;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(50)
	.withOption('createdRow', function(row, data, dataIndex){
		utils.compile(angular.element(row).contents())($scope);
	})
	.withOption('headerCallback', function(header) {
        if (!$scope.headerCompiled) {
            $scope.headerCompiled = true;
            utils.compile(angular.element(header).contents())($scope);
        }
    })
	.withButtons([
        {
        	text: '<i class="icon-file-plus"></i> <u>N</u>ew journal entry',
        	key: {
        		key: 'n',
        		ctrlKey: false,
        		altKey: true
        	},
        	action: function(){
        		$("#newGeneralJournal").modal("show");
        	}
        },
        {
        	extend: 'print',
        	text: '<i class="icon-printer"></i> <u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	},
        	exportOptions:{
        		columns: [0, 1, 2, 3]
        	}
        },
        {
        	extend: 'copy',
        	text: '<i class="icon-copy"></i> <u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: false,
        		altKey: true
        	},
        	exportOptions:{
        		columns: [0, 1, 2, 3]
        	},
        	exportData: {
        		decodeEntities: true
        	}
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('GeneralJournalID').withTitle("Transaction ID"),
		utils.DT.columnBuilder.newColumn('GeneralJournalDescription').withTitle("Reference Information"),
		utils.DT.columnBuilder.newColumn('GeneralJournalDate').withTitle("Transaction Date"),
		utils.DT.columnBuilder.newColumn('GeneralJournalTotalAmount').withTitle("Amount (<ng-currency currency-symbol='naira'></ng-currency>)"),
		utils.DT.columnBuilder.newColumn(null).withTitle('').renderWith(function(data, full, meta){
			var viewButtonAction = "manageJournal('view', "+data.GeneralJournalID+")";
			var delButtonAction = "manageJournal('delete', "+data.GeneralJournalID+")";
			var begBalButtonAction = "manageJournal('beginningBalances', "+data.GeneralJournalID+")";
			var viewMetadataButtonAction = "manageJournal('viewmetadata', "+data.GeneralJournalID+")";

			var dataOpt = "data-option-id='"+data.GeneralJournalID+"' data-option-amount='"+data.GeneralJournalTotalAmount+"'";

			var manageButton  = "<div class='btn-group'>"+
				                	"<button type='button' class='btn btn-info bg-white btn-icon dropdown-toggle no-border-radius btn-xs' data-toggle='dropdown'><i class='icon-three-bars'></i></button>"+
				                	"<ul class='dropdown-menu dropdown-menu-right'>"+
									"	<li><a href='#' class='account-btn' ng-click=\""+viewButtonAction+"\" "+dataOpt+"><i class='icon-file-eye'></i> View</a></li>"+
									"	<li><a href='#' class='account-btn text-danger' ng-click=\""+begBalButtonAction+"\" "+dataOpt+"><i class='icon-pencil7'></i> <strike>Adjust Entry</strike></a></li>"+
									"	<li class='divider'></li>"+
									"	<li><a href='#' class='account-btn text-danger' ng-click=\""+delButtonAction+"\" "+dataOpt+"><i class='fa fa-times'></i> Delete</a></li>"+
									"	<li><a href='#' class='account-btn' ng-click=\""+viewMetadataButtonAction+"\" "+dataOpt+"><i class='icon-database-diff'></i> View Metadata</a></li>"+
									"</ul>"+
								"</div>";
			var buttons = manageButton;

			$scope.journalEntries[data.GeneralJournalID] = data;
			return buttons;
		}).notSortable()
	];

	$scope.reloadTable = function(){
		$scope.dtInstance.reloadData();
	}

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
				$scope.journalFilter.description = "Accounting Period as at: "+value[0];
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

		$scope.reloadTable();
	}

	$scope.$on("journalSavedSuccessfully", function(){
		$scope.reloadTable();
	})

	$scope.manageJournal = function(type, id){
		switch(type){
			case "view":{
				$scope.currentJournalEntry = $scope.journalEntries[id];
				$("#view-current-journal-entries").modal("show");
				break;
			}
			case "viewmetadata":{
				$scope.currentJournalEntry = $scope.journalEntries[id];

				$scope.currentJournalEntry.DateCreated = (new Date($scope.currentJournalEntry.DateCreated)).toDateString()+" at "+(new Date($scope.currentJournalEntry.DateCreated)).toLocaleTimeString()
				$scope.currentJournalEntry.DateModified = (new Date($scope.currentJournalEntry.DateModified)).toDateString()+" at "+(new Date($scope.currentJournalEntry.DateModified)).toLocaleTimeString()
				$("#view-current-journal-metadata").modal("show");
				break;
			}
			case "delete":{
				var title = "Please Confirm";
				var text = "Do you really want to delete this transaction. Please note that you have to manually balance any affected account(s)"
				var close = true;
				var type = "warning";
				var btnText = "Yes, please continue";

				var process = function(){
					var req = utils.serverRequest("/financial-accounts/general-journal/delete?resourceId="+id, "DELETE");

					req.then(function(response){
						utils.notify("Operation successful", "The selected transaction has been deleted successfully", "success");
						$scope.reloadTable();
					}, function(error){
						utils.errorHandler(error);
					})
				}

				utils.confirm(title, text, close, process, type, btnText);
				break;
			}
		}
	}

	$scope.loadRunningBalances = function(){
		$rootScope.$broadcast("load-running-balances");
	}
})