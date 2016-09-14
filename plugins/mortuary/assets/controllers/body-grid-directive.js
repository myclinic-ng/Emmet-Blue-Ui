angular.module("EmmetBlue")

.directive("ngBodyGrid", function(){
	return {
		restrict: "E",
		scope:{
			"gridData": "="
		},
		templateUrl: "plugins/mortuary/assets/includes/view-body-grid.html",
		controller: function($scope, utils){
			
		}
	}
});