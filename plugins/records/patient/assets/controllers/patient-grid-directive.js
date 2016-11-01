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

			$scope.viewItems = {
				card: true,
				profile:false
			}

			$scope.toggleView = function(view){
				angular.forEach($scope.viewItems, function(val, key){
					$scope.viewItems[key] = false;
				});
				$scope.viewItems[view] = true;
			}

			$scope.toggleProfileLockState = function(status, patient){
				if (status){
					var request = utils.serverRequest("/patients/patient/lock-profile", "POST", {"patient":patient});
				}
				else {
					var request = utils.serverRequest("/patients/patient/unlock-profile", "POST", {"patient":patient});
				}

				request.then(function(response){
					$scope.patientInfo.patientprofilelockstatus = !$scope.patientInfo.patientprofilelockstatus;
					utils.alert('Operation successful', "Profile status changed successfully", "info", "notify");
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
})