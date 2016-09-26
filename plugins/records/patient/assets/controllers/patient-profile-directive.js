angular.module("EmmetBlue")

.directive('ngPatientProfile', function(){
	return {
		restrict: 'AE',
		scope: {
			patientInfo: '=patientInfo'
		},
		templateUrl: "plugins/records/patient/assets/includes/patient-profile-template.html",
		controller: function($scope, utils){
			$scope.loadImage = utils.loadImage;
		}
	}
})