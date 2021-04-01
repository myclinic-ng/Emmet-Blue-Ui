angular.module("EmmetBlue")

.controller("accountsMainMenuController", function($scope, utils, $rootScope){
	$scope.$on("journalSavedSuccessfully", function(){
		$("#newGeneralJournal").modal("hide");
	})

	$scope.loadRunningBalances = function(){
		$rootScope.$broadcast("load-running-balances");
	}
})