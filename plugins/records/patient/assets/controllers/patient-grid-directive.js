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
			$scope.unlockData = {};
			$scope.patients = {};
			$scope.patients[$scope.patientInfo.patientid] = $scope.patientInfo;

			$scope.viewItems = {
				card: true,
				profile:false,
				editProfile: false
			}

			$scope.toggleView = function(view){
				angular.forEach($scope.viewItems, function(val, key){
					$scope.viewItems[key] = false;
				});
				$scope.viewItems[view] = true;
			}

			$scope.retrieveLockStatus = function(){
				var req = utils.serverRequest("/patients/patient/retrieve-lock-status?resourceId="+$scope.patientInfo.patientid, "GET");
				req.then(function(response){
					$scope.patientInfo.patientprofilelockstatus = response.status;
				});
			};

			$scope.toggleProfileLockState = function(status, patient){
				if (status){
					var request = utils.serverRequest("/patients/patient/lock-profile", "POST", {"patient":patient});

					request.then(function(response){
						$scope.patientInfo.patientprofilelockstatus = !$scope.patientInfo.patientprofilelockstatus;
						utils.alert('Operation successful', "Profile status changed successfully", "info", "notify");
					}, function(error){
						utils.errorHandler(error);
					})
				}
				else {
					$("#paymentRequestLocker-"+patient).modal("show");
				}
			}

			$scope.unlockProfile = function(patient){
				var unlockData = {
					patient: $scope.patientInfo.patientid,
					staff: utils.userSession.getID(),
					department: utils.storage.currentStaffDepartmentID
				};

				if (typeof $scope.requestNumberForLocker !== "undefined" && $scope.requestNumberForLocker != ""){
					unlockData.paymentRequest = $scope.requestNumberForLocker;
				}
				var request = utils.serverRequest("/patients/patient/unlock-profile", "POST", unlockData);

				request.then(function(response){
					$scope.requestNumberForLocker = "";
					$("#paymentRequestLocker-"+unlockData.patient).modal("hide");
					$scope.patientInfo.patientprofilelockstatus = !$scope.patientInfo.patientprofilelockstatus;
					utils.alert('Operation successful', "Profile status changed successfully", "info", "notify");
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
})