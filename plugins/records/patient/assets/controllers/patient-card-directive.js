angular.module("EmmetBlue")

.directive('ngPatientCard', function(){
	return {
		restrict: 'AE',
		scope: {
			patientInfo: '=patientInfo'
		},
		templateUrl: "plugins/records/patient/assets/includes/patient-card-template.html",
		controller: function($scope, utils){
			$scope.loadImage = utils.loadImage;
		}
	}
})