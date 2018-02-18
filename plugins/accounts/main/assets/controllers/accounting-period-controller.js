angular.module("EmmetBlue")

.controller('accountsAccountingPeriodsController', function($scope, utils){
	var functions = {
		actionMarkups: {
			accountActionMarkup: function (data, full, meta){
				var editButtonAction = "managePeriod('edit', "+data.PeriodID+")";
				var deleteButtonAction = "managePeriod('delete', "+data.PeriodID+")";
				var begBalButtonAction = "managePeriod('beginningBalances', "+data.PeriodID+")";
				var deactivateButtonAction = "managePeriod('toggleAccountStatus', "+data.PeriodID+")";

				var dataOpt = "data-option-id='"+data.PeriodID+"' data-option-name='"+data.PeriodAlias+"'";

				var begBal = "	<li><a href='#' class='account-btn'><i class='fa fa-money'><strike></i> Beginning Balances</strike></a></li>";
				if (data.PeriodEditable == 1){
					var begBal = "	<li><a href='#' class='account-btn' ng-click=\""+begBalButtonAction+"\" "+dataOpt+"><i class='fa fa-money'></i> Beginning Balances</a></li>";
				}

				var manageButton  = "<div class='btn-group'>"+
					                	"<button type='button' class='btn bg-info btn-labeled dropdown-toggle' data-toggle='dropdown'><b><i class='icon-cog3'></i></b> manage <span class='caret'></span></button>"+
					                	"<ul class='dropdown-menu dropdown-menu-right'>"+
										"	<li><a href='#' class='account-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='icon-pencil5'></i> Change Alias</a></li>"+
											begBal+
										"	<li><a href='#'><i class='fa fa-file-text-o'></i> View Period Ledgers</a></li>"+
										"	<li class='divider'></li>"+
										"	<li><a href='#' class='account-btn' ng-click=\""+deactivateButtonAction+"\" "+dataOpt+"><i class='fa fa-area-chart'></i> Generate Reports</a></li>"+
										"	<li class='divider'></li>"+
										"	<li><a href='#' class='account-btn' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"><i class='icon-cross text-danger'></i> Delete Alias</a></li>"+
										"</ul>"+
									"</div>";
				var buttons = manageButton;
				return buttons;
			}
		},
		newPeriodCreated: function(){
			utils.alert("Operation Successful", "You have successfully registered a new accounting period", "success", "notify");
			$scope.newPeriod = {};
			$("#new_period").modal("hide");

			$scope.reloadPeriodTable();
		},
		periodEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$("#edit_period").modal("hide");
			$("#change_period_type").modal("hide");

			$scope.reloadPeriodTable();
		},
		managePeriod: {
			newPeriod: function(){
				$("#new_period").modal({"backdrop":"static"});
			},
			editPeriod: function(id){
				$scope.tempHolder.PeriodAlias = $(".account-btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.resourceId = id;

				$("#edit_period").modal("show");
			},
			deletePeriod: function(id){
				var title = "Please Confirm";
				var text = "Do you really want to delete this accounting period?"
				var close = true;
				var type = "warning";
				var btnText = "Yes, please continue";

				var process = function(){
					var req = utils.serverRequest("/financial-accounts/accounting-period/delete-alias?resourceId="+id, "DELETE");

					req.then(function(response){
						utils.notify("Operation successful", "The selected period has been deleted successfully", "success");
						$scope.reloadPeriodTable();
					}, function(error){
						utils.errorHandler(error);
					})
				}

				utils.confirm(title, text, close, process, type, btnText);
			},
			beginningBalances: function(id){
				var data = {
					id: id,
					name: $(".account-btn[data-option-id='"+id+"']").attr('data-option-name')
				};

				utils.storage.currentAccountingPeriod = data;
				$("#new_beginning_balance").modal("show");
			}
		}
	}

	$scope.tempHolder = {};

	$scope.dttInstance = {};
	$scope.dttOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var periods = utils.serverRequest('/financial-accounts/accounting-period/view-alias', 'GET');
		return periods;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(100)
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
			text: '<i class="icon-file-plus"></i> <u>N</u>ew accounting period',
			action: function(){
				functions.managePeriod.newPeriod();
			},
			key: {
        		key: 'n',
        		ctrlKey: false,
        		altKey: true
        	}
		},
        {
        	extend: 'print',
        	text: '<i class="icon-printer"></i> <u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	}
        },
        {
        	extend: 'copy',
        	text: '<i class="icon-copy"></i> <u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: false,
        		altKey: true
        	}
        }
	]);	

	$scope.dttColumns = [
		utils.DT.columnBuilder.newColumn('PeriodID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('PeriodAlias').withTitle("Period Alias"),
		utils.DT.columnBuilder.newColumn('PeriodStartDate').withTitle("Start Date"),
		utils.DT.columnBuilder.newColumn('PeriodEndDate').withTitle("End Date"),
		utils.DT.columnBuilder.newColumn(null).withTitle(" ").renderWith(function(data){
			if (data.PeriodEditable == "0"){
				var val = "<span class='text-success'><i class='icon-lock2'></i></span> &nbsp;<button class='btn btn-xs'>View Beg/Bals</button>";

			}
			else {
				var val = "<center><span class='text-danger'><i class='icon-unlocked'></i></span></center>";
			}

			return val;
		}).notSortable(),
		utils.DT.columnBuilder.newColumn('NetBeginningBalance').withTitle("Beg/Bal Net Total"),
		utils.DT.columnBuilder.newColumn(null).withTitle(" ").renderWith(functions.actionMarkups.accountActionMarkup).notSortable()
	];

	$scope.reloadPeriodTable = function(){
		$scope.dttInstance.reloadData();
	}

	$scope.saveNewPeriod = function(){
		var newPeriod = {
			alias: $scope.newPeriod.name
		};

		var dates = $scope.newPeriod.dates.split(" - ");
		newPeriod.startDate = dates[0];
		newPeriod.endDate = dates[1];

		$('.loader').addClass('show');
		var saveNewPeriod = utils.serverRequest('/financial-accounts/accounting-period/new-alias', 'POST', newPeriod);

		saveNewPeriod.then(function(response){
			$('.loader').removeClass('show');
			functions.newPeriodCreated();
		}, function(response){
			$('.loader').removeClass('show');
			utils.errorHandler(response);
		});
	}

	$scope.saveEditPeriod = function(){
		var edits = $scope.tempHolder;
			$('.loader').addClass('show');
		var saveEdits = utils.serverRequest('/financial-accounts/accounting-period/edit-alias', 'PUT', edits);
		saveEdits.then(function(response){
			$('.loader').removeClass('show');
			functions.periodEdited();
		}, function(responseObject){
			$('.loader').removeClass('show');
			utils.errorHandler(responseObject);
		})

	}

	$scope.managePeriod = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				functions.managePeriod.editPeriod(id);
				break;
			}
			case "delete":{
				functions.managePeriod.deletePeriod(id);
				break;
			}
			case "beginningbalances":{
				functions.managePeriod.beginningBalances(id);
				break;
			}
			case "toggleaccountstatus":{
				functions.managePeriod.toggleAccountStatus(id);
				break;
			}
		}
	}

	$scope.$on("beginningBalanceCreated", function(){
		$("#new_beginning_balance").modal("hide");
		$scope.reloadPeriodTable();
	})

	var currentPeriod = function(){
		utils.serverRequest("/financial-accounts/accounting-period/get-current-period", "GET").then(function(response){
			$scope.currentPeriod = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}();
});
