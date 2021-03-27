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
				utils.serverRequest("/patients/patient-diagnosis/get-diagnosis-date-group?resourceId="+id, "GET")
				.then(function(response){
					$scope.diagnosesDateGroups = response;
				}, function(error){
					utils.errorHandler(error);
				})

				utils.serverRequest("/patients/patient-diagnosis/view?resourceId="+id, "GET")
				.then(function(response){
					$scope.diagnoses = response;
					// console.log(response);
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.loadDiagnosis = loadDiagnosis;

			$scope.$watch("selectedDateGroup", function(newValue, old){
				var id = $scope.patientInfo.patientid;
				if (newValue == 0){
					utils.serverRequest("/patients/patient-diagnosis/view?resourceId="+id, "GET")
					.then(function(response){
						$scope.diagnoses = response;
					}, function(error){
						utils.errorHandler(error);
					})
				}
				else {
					if (typeof newValue != "undefined"){
						var val = JSON.parse(newValue);
						var year = val.YearDate;
						var month = val.MonthDate;
						utils.serverRequest("/patients/patient-diagnosis/view-diagnosis-in-date-groups?resourceId="+id+"&year="+year+"&month="+month, "GET")
						.then(function(response){
							$scope.diagnoses = response;
						}, function(error){
							utils.errorHandler(error);
						})
					}
				}
			})

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