angular.module("EmmetBlue")

.directive('ngTimelineItem', function(){
	return {
		restrict: 'AE',
		scope: {
			eventData: '=eventData'
		},
		templateUrl: "plugins/records/patient/assets/includes/patient-timeline-item-template.html",
		controller: function($scope, utils){
			$scope.dateObject = utils.dateObject;
		}
	}
})