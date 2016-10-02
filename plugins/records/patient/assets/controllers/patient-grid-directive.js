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
		}
	}
})