angular.module("EmmetBlue")

.controller("accountsBillingDepositsAccountController", function($scope, utils){
	$scope.patientID = 0;
	$scope.loadAccount = function(){
		$scope.info = {};
		var req = utils.serverRequest("/patients/patient/search?query="+$scope.patientNumber, "GET");

		req.then(function(response){
			if (response.hits.total != 1){
				utils.alert("Patient profile not found", "This is usually due to supplying an inexistent patient id or using an ambiguous search query. Please try again", "warning");
			}
			else {
				$scope.patientID= response.hits.hits[0]["_source"].patientid;
				$scope.reloadTable();
				$scope.info.patientName = response.hits.hits[0]["_source"].patientfullname;
				$scope.info.patientType = response.hits.hits[0]["_source"].patienttypename+", "+response.hits.hits[0]["_source"].categoryname;
				loadAccountDetails();
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var url = '/accounts-biller/deposit-account/view-transactions?resourceId=';
		var requests = utils.serverRequest(url+$scope.patientID, 'GET');
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

	var loadAccountDetails = function(){
		var req = utils.serverRequest("/accounts-biller/deposit-account/view-account-info?resourceId="+$scope.patientID, "GET");

		req.then(function(response){
			if (typeof response !== "undefined"){
				$scope.info.accountID = response.AccountID;
				$scope.info.accountBalance = response.AccountBalance;
				$scope.info.createdBy = response.StaffName;
				$scope.info.dateCreated = (new Date(response.DateCreated)).toDateString();
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
			patient: $scope.patientID
		};

		var req = utils.serverRequest("/accounts-biller/deposit-account/new-transaction", "POST", tx);

		req.then(function(response){
			if (response){
				$("#new_deposit_transaction").modal("hide");
				$scope.loadAccount();
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