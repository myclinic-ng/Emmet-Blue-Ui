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

			var loadDiagnosis = function(){
				utils.serverRequest("/patients/patient-diagnosis/view?resourceId="+$scope.patientInfo.patientid, "GET")
				.then(function(response){
					$scope.diagnoses = response;
					console.log(response);
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.$watch(function(){
				return $scope.patientInfo.patientid
			}, function(nv){
				loadDiagnosis();
			})

			$scope.setCurrentDiagnosis = function(index){
				$scope.diagnosis = $scope.diagnoses[index];
			}
		}
	}
})