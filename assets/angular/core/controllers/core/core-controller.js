angular.module("EmmetBlue")

.controller('coreController', function($scope, $location, $routeParams, CONSTANTS){
	$scope.$on('$routeChangeSuccess', function(event, current, previous){
		var path = ($location.path()).split('/');
		
		var moduleMenu = CONSTANTS.TEMPLATE_DIR +
						 path[1] + '/' +
						 CONSTANTS.MODULE_MENU_LOCATION;
		var moduleHeader = CONSTANTS.TEMPLATE_DIR +
						 path[1] + '/' +
						 CONSTANTS.MODULE_HEADER_LOCATION;

		$scope.moduleMenu = moduleMenu;
		$scope.moduleHeader = moduleHeader;
	});
});