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
			$scope.getGenderAvatar = utils.getGenderAvatar;
			$scope.userClient = utils.globalConstants.USER_CLIENT;

			$scope.toLocaleDate = function(date){
				return new Date(date).toLocaleDateString();
			}

			$scope.toDateString = function(date){
				return new Date(date).toDateString();
			}
		}
	}
})