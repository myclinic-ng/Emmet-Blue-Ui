angular.module("EmmetBlue")

.controller("accountsMainNewGeneralJournalController", function($rootScope, $scope, utils){
	var entryTemplate = {
		account:null,
		description:null,
		debit: null,
		credit: null
	}

	$scope.entryTotals = {
		debit: 0.0,
		credit: 0.0
	}

	var initJournal = function(){
		$scope.generalJournal = {};
		$scope.journalEntries = [];
		for (i = 0; i < 1; i++){
			$scope.addNewRow();
		}
	}

	var addNewRow = function(){
		$scope.journalEntries.push(angular.copy(entryTemplate));
	}

	var newRowAdded = function(){
		$('select.select').select2({
			placeholder: "Select an option",
			allowClear: true
		});
	}

	$scope.addNewRow = function(){
		addNewRow();
		setTimeout(function(){
			newRowAdded();
		}, 1000);
	}

	$scope.removeRow = function(index){
		$scope.journalEntries.splice(index, 1);
	}

	var loadAccounts = function(){
		var req = utils.serverRequest("/financial-accounts/account/view", "GET");
		req.then(function(result){
			$scope.glAccounts = result;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.calcTotal = function(){
		var debit = 0, credit = 0;
		angular.forEach($scope.journalEntries, function(val){
			debit += val.debit;
			credit += val.credit;
		});
		$scope.entryTotals = { debit: debit, credit: credit };
	}

	$scope.processJournal = function(){
		// if ($scope.entryTotals.debit != $scope.entryTotals.credit){
		// 	utils.alert("Out of Balance", "The General Journal Cannot Be Posted Because It Is Out Of Balance", "warning");
		// }
		// else
		// {
		var journal = [];
		var containsError = true;
		for (var i = 0; i < $scope.journalEntries.length; i++){
			var val = $scope.journalEntries[i];
			// if (val.debit != null && val.credit != null){
			// 	utils.notify("Cannot enter values for both credit and debit sides", "Seems like you've supplied a value for both the debit and credit sides of one or more of your entries. Please specify only one side", "warning");
			// 	containsError = true;
			// 	break;
			// }
			// else if (val.debit == null && val.credit == null){
			// 	utils.notify("Account entries cannot be blank", "Seems like you've  not supplied a value for both the debit and credit sides of one or more of your entries. Please specify only one side", "warning");
			// 	containsError = true;
			// 	break;
			// }
			// else if (val.account == null){
			// 	utils.notify("Empty account value", "Seems like you've not selected a GL Account for one of your entries.", "warning");
			// 	containsError = true;
			// 	break;
			// }
			// else {
			// 	containsError = false;
			// 	var type = (val.debit == null) ? 'credit' : 'debit';
			// 	var value = val[type];
			// 	var entry = {
			// 		account: val.account,
			// 		description: val.description,
			// 		type: type,
			// 		value: value
			// 	};

			// 	journal.push(entry);
			// 	}

			containsError = false;
			var type = (val.debit == null) ? 'credit' : 'debit';
			var value = val[type];
			var entry = {
				account: val.account,
				description: val.description,
				type: type,
				value: value
			};

			journal.push(entry);
		};

		if (containsError){
			utils.notify("An error has occurred", "Journal cannot be saved due to one or more errors. Please see previous errors", "error");
		}
		else {
			$scope.generalJournal.date = new Date($scope.generalJournal.date).toLocaleDateString();
			$scope.generalJournal.entries = journal;
			$scope.generalJournal.staff = utils.userSession.getID();

			var req = utils.serverRequest("/financial-accounts/general-journal/new", "POST", $scope.generalJournal);
			req.then(function(result){
				initJournal();
				$rootScope.$broadcast("journalSavedSuccessfully");
				utils.notify("Your journal entries have been posted successful", "", "success");
			}, function(e){
				utils.errorHandler(e);
			});
		}
	}

	loadAccounts();
	initJournal();
})