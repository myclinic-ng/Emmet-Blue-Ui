angular.module("EmmetBlue")

.directive('ngPatientGrid', function(){
	return {
		restrict: 'AE',
		scope: {
			patientInfo: '=patientInfo'
		},
		templateUrl: "plugins/records/patient/assets/includes/patient-grid-template.html",
		controller: function($scope, utils){
			$scope.loadImage = utils.loadImage;
		}
	}
})