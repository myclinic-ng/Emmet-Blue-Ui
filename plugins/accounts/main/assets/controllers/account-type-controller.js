angular.module("EmmetBlue")

.controller('accountsAccountAccountTypeController', function($scope, utils){
	var loadAccountTypeCategories = function(){
		var req = utils.serverRequest('/financial-accounts/account-type-category/view', 'GET');

		req.then(function(response){
			$scope.accountTypeCategories = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadAccountTypeCategories();
	var functions = {
		actionMarkups: {
			accountTypeActionMarkup: function (data, type, full, meta){
				var editButtonAction = "manageAccountType('edit', "+data.TypeID+")";

				var dataOpt = "data-option-id='"+data.TypeID+"' data-option-name='"+data.TypeName+"' data-option-description='"+data.TypeDescription+"'";

				var editButton = "<button class='btn btn-link account-type-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='icon-pencil5'></i> edit </button>";
				
				var buttons = "<div class='btn-group'>"+editButton+"</button>";
				return buttons;
			}
		},
		newAccountTypeCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new account type", "success", "notify");
			$scope.newAccountType = {};
			$("#new_accountType").modal("hide");

			$scope.reloadAccountTypeTable();
		},
		accountTypeEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$("#edit_accountType").modal("hide");

			$scope.reloadAccountTypeTable();
		},
		manageAccountType: {
			newAccountType: function(){
				$("#new_accountType").modal("show");
				$("#new_accountType").modal({"backdrop":"static"});
			},
			editAccountType: function(id){
				$scope.tempHolder.TypeName = $(".account-type-btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.TypeDescription = $(".account-type-btn[data-option-id='"+id+"']").attr('data-option-description');
				$scope.tempHolder.resourceId = id;

				$("#edit_accountType").modal("show");
			}
		}
	}

	$scope.tempHolder = {};

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var accountTypes = utils.serverRequest('/financial-accounts/account-type/view', 'GET');
		return accountTypes;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
	.withFixedHeader()
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
			text: '<i class="icon-file-plus"></i> <u>N</u>ew account type',
			action: function(){
				functions.manageAccountType.newAccountType();
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

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('TypeID').withTitle("ID").withOption('width', '0.5%'),
		utils.DT.columnBuilder.newColumn('TypeName').withTitle("Name"),
		utils.DT.columnBuilder.newColumn('CategoryName').withTitle("Category"),
		utils.DT.columnBuilder.newColumn('TypeDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.accountTypeActionMarkup).withOption('width', '25%').notSortable()
	];

	$scope.reloadAccountTypeTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.saveNewAccountType = function(){
		var newAccountType = $scope.newAccountType;
		$('.loader').addClass('show');
		var saveNewAccountType = utils.serverRequest('/financial-accounts/account-type/new', 'POST', newAccountType);

		saveNewAccountType.then(function(response){
			$('.loader').removeClass('show');
			functions.newAccountTypeCreated();
		}, function(response){
			$('.loader').removeClass('show');
			utils.errorHandler(response);
		});
	}

	$scope.saveEditAccountType = function(){
		var edits = $scope.tempHolder;
			$('.loader').addClass('show');
		var saveEdits = utils.serverRequest('/financial-accounts/account-type/edit', 'PUT', edits);
		saveEdits.then(function(response){
			$('.loader').removeClass('show');
			functions.accountTypeEdited();
		}, function(responseObject){
			$('.loader').removeClass('show');
			utils.errorHandler(responseObject);
		})

	}

	$scope.manageAccountType = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				functions.manageAccountType.editAccountType(id);
				break;
			}
		}
	}
});
