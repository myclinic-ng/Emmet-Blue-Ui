angular.module("EmmetBlue")

.controller('userPharmacySetupIndexController', function($scope, $http, utils, $location){
	var req = utils.serverRequest("/setup/init-departments/run-all", "GET");
	req.then(function(response){
		console.log(response);
	}, function(error){
		utils.errorHandler(error);
	})
});