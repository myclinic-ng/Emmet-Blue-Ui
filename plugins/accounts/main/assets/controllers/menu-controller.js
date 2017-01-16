angular.module("EmmetBlue")

.controller("accountsBillingMenuController", function($scope, utils){
	$scope.$on("journalSavedSuccessfully", function(){
		$("#newGeneralJournal").modal("hide");
	})
})