angular.module("EmmetBlue")

.directive('ngPatientGrid', function(){
	return {
		restrict: 'AE',
		scope: {
			patientInfo: '=patientInfo'
		},
		templateUrl: "plugins/records/patient/assets/includes/patient-grid-template.html",
		controller: function($scope, utils, $rootScope){
			$scope.loadImage = utils.loadImage;
			$scope.getGenderAvatar = utils.getGenderAvatar;
			
			$scope.unlockData = {};
			$scope.patients = {};
			$scope.patients[$scope.patientInfo.patientid] = $scope.patientInfo;

			$scope.viewItems = {
				card: true,
				profile:false,
				editProfile: false,
				repos: false
			}

			$scope.toggleView = function(view){
				angular.forEach($scope.viewItems, function(val, key){
					$scope.viewItems[key] = false;
				});
				$scope.viewItems[view] = true;

				if (view == "repos"){
					$scope.currentPatient = {
						nameTitle: "Patient",
						id: 0
					};

					$scope.currentPatient.nameTitle = $scope.patientInfo.patientfullname+"'s";
					$scope.currentPatient.picture = $scope.loadImage($scope.patientInfo.patientpicture);
					$scope.currentPatient.id = $scope.patientInfo.patientid;

					$rootScope.$broadcast("reloadCurrentPatient");
				}
			}

			$scope.retrieveLockStatus = function(){
				var req = utils.serverRequest("/patients/patient/retrieve-lock-status?resourceId="+$scope.patientInfo.patientid, "GET");
				req.then(function(response){
					$scope.patientInfo.patientprofilelockstatus = response.status;
				});
			};

			$scope.getLastVisit = function(){
				var req = utils.serverRequest("/patients/patient/last-visit?resourceId="+$scope.patientInfo.patientid, "GET");
				req.then(function(response){
					$scope.patientInfo.lastVisit = response;
				});
			};
			$scope.getLastVisit();

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

			$scope.broadcastRepoPatient = function(id){
				$rootScope.$broadcast("loadPatientHideSearch", id);
			}

			$scope.toDateString = function(date){
				return (new Date(date)).toDateString()+", "+(new Date(date)).toLocaleTimeString();
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

			$scope.loadAppointments = function(patient){
				var request = utils.serverRequest("/patients/patient-appointment/view/"+patient, "GET");

				request.then(function(response){
					$scope.appointments = response;
					$scope.appointmentsCount = response.length;
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.loadAppointments($scope.patientInfo.patientid);

			function loadDoctors(){
				utils.serverRequest("/nursing/load-doctors/view-queue-count", "GET").then(function(response){
					$scope.doctors = response;
				}, function(error){
					utils.errorHandler(error);
				})
			};
			loadDoctors();

			$scope.selectedDoctor = "";
			$scope.queuePatient = function(){
				var data = {
					consultant: $scope.selectedDoctor,
					patient: $scope.patientInfo.patientid
				};

				utils.serverRequest("/consultancy/patient-queue/new", "POST", data).then(function(response){
					utils.alert("Doctor queue updated successfully", "Patient can go to consulting room", "info", "notify");
					$scope.unlockProfile($scope.patientInfo.patientid);
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
})