angular.module("EmmetBlue")

.controller("dummyAboutController", function($scope, utils){
	var sendRequest = utils.serverRequest("/patients/patient/view", "GET");


	sendRequest.then(function(response){
		$scope.result = response;
	}, function(errorObject){

	})
})