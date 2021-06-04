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
			$scope.getGenderAvatar = utils.getGenderAvatar;
			$scope.getAge = utils.getAge;

			// $scope.$watch(function(){
			// 	return $scope.patientInfo.patientid
			// }, function(nv){
			// 	loadDiagnosis();
			// })

			$scope.toLocaleDate = function(date){
				return new Date(date).toLocaleDateString();
			}

			$scope.toDateString = function(date){
				return new Date(date).toDateString()+ " " + new Date(date).toLocaleTimeString();
			}

			$scope.getTime = function(date){
				return new Date(date).toLocaleTimeString();
			}
	
			$scope.exists = function(p, ind){
				return typeof p[ind] != "undefined"
			}

		}
	}
})