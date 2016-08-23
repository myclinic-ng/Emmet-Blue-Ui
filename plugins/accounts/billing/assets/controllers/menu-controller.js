angular.module("EmmetBlue")

.controller("accountsBillingMenuController", function($scope, utils){
	$scope.billingItems = [
		"Pharmacceuticals", "Admission", "Patient", "Consultation", "Laboratory & Testing",
		"Pharmaceuticals", "Admissiona", "Patienta", "Consultations", "Laboratory",
		"Mortuary", "Accident One Timers"
	];
})