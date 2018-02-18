angular.module("EmmetBlue")

.controller('accountsAccountAccountController', function($scope, utils){
	var loadAccountTypes = function(){
		var req = utils.serverRequest('/financial-accounts/account-type-category/view-with-types', 'GET');

		req.then(function(response){
			$scope.accountTypes = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadAccountTypes();
	var functions = {
		actionMarkups: {
			accountActionMarkup: function (data, full, meta){
				var editButtonAction = "manageAccount('edit', "+data.AccountID+")";
				var changeTypeButtonAction = "manageAccount('changeAccountType', "+data.AccountID+")";
				var deactivateButtonAction = "manageAccount('toggleAccountStatus', "+data.AccountID+")";

				var deactivateString = (data.AccountStatus.toLowerCase() == "active") ? "<i class='fa fa-toggle-off'></i> Deactivate Account" : "<i class='fa fa-toggle-on'></i> Activate Account";

				var dataOpt = "data-option-id='"+data.AccountID+"' data-option-name='"+data.AccountName+"' data-option-description='"+data.AccountDescription+"' data-option-current-type='"+data.TypeName+"' data-option-current-status='"+data.AccountStatus+"'";

				var manageButton  = "<div class='btn-group'>"+
					                	"<button type='button' class='btn bg-active btn-labeled dropdown-toggle' data-toggle='dropdown'><b><i class='icon-cog3'></i></b> manage <span class='caret'></span></button>"+
					                	"<ul class='dropdown-menu dropdown-menu-right'>"+
										"	<li><a href='#' class='account-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='icon-pencil5'></i> Edit</a></li>"+
										"	<li><a href='#' class='account-btn' ng-click=\""+changeTypeButtonAction+"\" "+dataOpt+"><i class='fa fa-unlink'></i> Change Account Type</a></li>"+
										"	<li><a href='#'><i class='fa fa-file-text-o'></i> View Ledger</a></li>"+
										"	<li class='divider'></li>"+
										"	<li><a href='#' class='account-btn' ng-click=\""+deactivateButtonAction+"\" "+dataOpt+">"+deactivateString+"</a></li>"+
										"</ul>"+
									"</div>";
				var buttons = manageButton;
				return buttons;
			}
		},
		newAccountCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new account", "success", "notify");
			$scope.newAccount = {};
			$("#new_account").modal("hide");

			$scope.reloadAccountTable();
		},
		accountEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$("#edit_account").modal("hide");
			$("#change_account_type").modal("hide");

			$scope.reloadAccountTable();
		},
		manageAccount: {
			newAccount: function(){
				$("#new_account").modal("show");
				$("#new_account").modal({"backdrop":"static"});
			},
			editAccount: function(id){
				$scope.tempHolder.AccountName = $(".account-btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.AccountDescription = $(".account-btn[data-option-id='"+id+"']").attr('data-option-description');
				$scope.tempHolder.resourceId = id;

				$("#edit_account").modal("show");
			},
			changeAccountType: function(id){
				$scope.tempHolder = {};
				$scope.tempHolder.resourceId = id;
				$scope.tempHolder.currentType = $(".account-btn[data-option-id='"+id+"']").attr('data-option-current-type');

				$("#change_account_type").modal("show");
			},
			toggleAccountStatus: function(id){
				var title = "Please Confirm";
				var text = "Do you really want to toggle the status of this account?"
				var close = true;
				var type = "warning";
				var btnText = "Yes, please continue";

				var process = function(){
					$scope.tempHolder = {
						resourceId: id
					};
					var currentStatus = $(".account-btn[data-option-id='"+id+"']").attr('data-option-current-status');	

					if (currentStatus.toLowerCase() == "active"){
						$scope.tempHolder.AccountStatus = "Inactive";
					}
					else {
						$scope.tempHolder.AccountStatus = "Active";
					}

					$scope.saveEditAccount();
				}

				utils.confirm(title, text, close, process, type, btnText);
			}
		}
	}

	$scope.tempHolder = {};

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var accounts = utils.serverRequest('/financial-accounts/account/view-all-accounts', 'GET');
		return accounts;
	})
	// .withPagination('full_numbers')
	.withDisplayLength(10)
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
			text: '<i class="icon-file-plus"></i> <u>N</u>ew account',
			action: function(){
				functions.manageAccount.newAccount();
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
        	},
        	exportOptions:{
        		columns: [0, 1, 2, 3, 4, 5]
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
        		columns: [0, 1, 2, 3, 4, 5]
        	},
        	exportData: {
        		decodeEntities: true
        	}
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('AccountID').withTitle("Account Code"),
		utils.DT.columnBuilder.newColumn('AccountName').withTitle("Account Name"),
		utils.DT.columnBuilder.newColumn('TypeName').withTitle("Account Type"),
		utils.DT.columnBuilder.newColumn('DateCreated').withTitle("Date Created"),
		utils.DT.columnBuilder.newColumn('AccountDescription').withTitle("Account Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Status").renderWith(function(data){
			var labelCode = (data.AccountStatus.toLowerCase() == "active") ? "success" : "danger";
			
			return "<span class='label label-"+labelCode+"'>"+data.AccountStatus+"</span>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle(" ").renderWith(functions.actionMarkups.accountActionMarkup).notSortable()
	];

	$scope.reloadAccountTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.saveNewAccount = function(){
		var newAccount = $scope.newAccount;
		$('.loader').addClass('show');
		var saveNewAccount = utils.serverRequest('/financial-accounts/account/new', 'POST', newAccount);

		saveNewAccount.then(function(response){
			$('.loader').removeClass('show');
			functions.newAccountCreated();
		}, function(response){
			$('.loader').removeClass('show');
			utils.errorHandler(response);
		});
	}

	$scope.saveEditAccount = function(){
		var edits = $scope.tempHolder;
			$('.loader').addClass('show');
		var saveEdits = utils.serverRequest('/financial-accounts/account/edit', 'PUT', edits);
		saveEdits.then(function(response){
			$('.loader').removeClass('show');
			functions.accountEdited();
		}, function(responseObject){
			$('.loader').removeClass('show');
			utils.errorHandler(responseObject);
		})

	}

	$scope.saveChangeAccountType = function(){
		var edits = {
			resourceId: $scope.tempHolder.resourceId,
			AccountTypeID: $scope.tempHolder.type
		};
		$('.loader').addClass('show');
		var saveEdits = utils.serverRequest('/financial-accounts/account/edit', 'PUT', edits);
		saveEdits.then(function(response){
			$('.loader').removeClass('show');
			functions.accountEdited();
		}, function(responseObject){
			$('.loader').removeClass('show');
			utils.errorHandler(responseObject);
		})

	}

	$scope.manageAccount = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				functions.manageAccount.editAccount(id);
				break;
			}
			case "changeaccounttype":{
				functions.manageAccount.changeAccountType(id);
				break;
			}
			case "toggleaccountstatus":{
				functions.manageAccount.toggleAccountStatus(id);
				break;
			}
		}
	}
});
