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
			$scope.getAge = utils.getAge;

			var loadDiagnosis = function(id){
				utils.serverRequest("/patients/patient-diagnosis/view?resourceId="+id, "GET")
				.then(function(response){
					$scope.diagnoses = response;
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.loadDiagnosis = loadDiagnosis;

			// $scope.$watch(function(){
			// 	return $scope.patientInfo.patientid
			// }, function(nv){
			// 	loadDiagnosis();
			// })

			$scope.setCurrentDiagnosis = function(index){
				$scope.diagnosis = $scope.diagnoses[index];
			}

			$scope.toLocaleDate = function(date){
				return new Date(date).toLocaleDateString();
			}

			$scope.toDateString = function(date){
				return new Date(date).toDateString();
			}
		}
	}
})