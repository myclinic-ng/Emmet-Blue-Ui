angular.module("EmmetBlue")

.controller("mainController", function($rootScope, $scope, utils){
	$scope.reloadQueue = function(){
		$rootScope.$broadcast('reloadQueue');
	}
})