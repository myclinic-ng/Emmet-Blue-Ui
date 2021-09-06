angular.module("EmmetBlue")

.controller("accountsBillingPatientTypeDepositsAccountController", function($scope, utils){
	$scope.patientTypeID = 0;
	$scope.patientCategory = 0;
	$scope.patientTypes = {};
	$scope.patientCategories = {};
	$scope.info = {};

	$scope.loadPatientTypes = function(categoryId){
		if (typeof categoryId !== "undefined"){
			var requestData = utils.serverRequest("/patients/patient-type/view-by-category?resourceId="+categoryId, "GET");
			requestData.then(function(response){
				$scope.patientTypes = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			});
		}
	}


	$scope.loadPatientCategories = function(){
		var requestData = utils.serverRequest("/patients/patient-type-category/view", "GET");
		requestData.then(function(response){
			$scope.patientCategories = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}

	$scope.loadPatientCategories();

	$scope.$watch("patientCategory", function(newValue, oldValue){
		if (typeof newValue !== "undefined"){
			$scope.loadPatientTypes(newValue);	
		}
	})

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var url = '/accounts-biller/deposit-account/view-transactions-by-patient-type?filtertype=patientType&query=';
		var requests = utils.serverRequest(url+$scope.patientTypeID, 'GET');
		return requests;
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
        	//extend: 'new',
        	text: '<i class="icon-wallet"></i> <u>N</u>ew Transaction',
        	action: function(){
				$("#new_deposit_transaction").modal("show");
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
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('TransactionID').withTitle("Transaction ID"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Transaction Amount").renderWith(function(data, full, meta){
			if (data.TransactionAmount < 0){
				var val = "<span><span ng-currency ng-currency-symbol='naira'></span> "+data.TransactionAmount+" <i class='text-danger icon-arrow-up5'></i> </span>"
			}
			else {
				var val = "<span><span ng-currency ng-currency-symbol='naira'></span> "+data.TransactionAmount+" <i class='text-success icon-arrow-down5'></i> </span>"
			}

			return val;
		}),,
		utils.DT.columnBuilder.newColumn(null).withTitle("Transaction Date").renderWith(function(data, full, meta){
			var date = new Date(data.TransactionDate);

			var val ='<span class="display-block">'+date.toDateString()+'</span><span class="text-muted"> '+date.toLocaleTimeString()+'</span>';

			return val;
		}),
		utils.DT.columnBuilder.newColumn("TransactionComment").withTitle('Comment'),
		utils.DT.columnBuilder.newColumn("StaffName").withTitle('Processed By')
	];

	$scope.reloadTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.loadAccountDetails = function(){
		var req = utils.serverRequest("/accounts-biller/deposit-account/view-account-info-by-patient-type?resourceId="+$scope.patientTypeID, "GET");

		req.then(function(response){
			if (typeof response !== "undefined"){
				$scope.info.accountID = response.AccountID;
				$scope.info.accountBalance = response.AccountBalance;
				$scope.info.createdBy = response.StaffName;
				$scope.info.dateCreated = (new Date(response.DateCreated)).toDateString();

				$scope.reloadTable();
			}
			else {
				utils.notify("Deposit Account Not Found", "Seems like this patient does not have an associated deposit financial repository. Please create one by creating a new transaction");
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.saveTx = function(){
		var tx = {
			amount: $scope.newTx.amount,
			comment: ($scope.newTx.comment).join(", "),
			staff: utils.userSession.getID(),
			patientType: $scope.patientTypeID
		};

		var req = utils.serverRequest("/accounts-biller/deposit-account/new-transaction-by-patient-type", "POST", tx);

		req.then(function(response){
			if (response){
				$("#new_deposit_transaction").modal("hide");
				$scope.loadAccountDetails();
				$scope.newTx = {};
				utils.notify("Transaction Posted Successfully", "The deposit account has been updated and the necessary adjustments have been made", "success");
			}
			else {
				utils.alert("Unable to post transaction", "An error occurred, your changes were not effected. Please try again or contact an administrator if this error persists", "error");
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}
})