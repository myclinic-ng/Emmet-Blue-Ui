angular.module("EmmetBlue")

.directive('ngPatientEncounters', function(){
	return {
		restrict: 'AE',
		scope: {
			patientInfo: '=patientInfo'
		},
		templateUrl: "plugins/records/patient/assets/includes/patient-encounter-template.html",
		controller: function($scope, utils){
			$scope.loadImage = utils.loadImage;
			$scope.getGenderAvatar = utils.getGenderAvatar;
			$scope.getAge = utils.getAge;

			$scope.repositories = [];
			$scope.vitalSigns = {};
			$scope.labStatus = {};

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

			$scope.$watch(function(){
				return $scope.patientInfo.patientid;
			}, function(nv){
				if (typeof nv != "undefined"){
					$scope.loadDiagnosis(nv);	
				}
			})

			$scope.setCurrentDiagnosis = function(index){
				$scope.diagnosis = $scope.diagnoses[index];

				utils.serverRequest("/patients/patient-diagnosis/get-diagnosis-data?resourceId="+$scope.diagnosis.DiagnosisID, "GET")
				.then(function(response){
					$scope.labStatus = response.labs;
					$scope.loadRepoItems(response.observations);
				}, function(error){
					utils.errorHandler(response);
				});
			}

			$scope.loadRepoItems = function(labs){
				for (var i = 0; i < labs.length; i++) {
					obs = labs[i]
					repoId = obs["RepositoryID"];

					utils.serverRequest("/patients/patient-repository/view?resourceId="+repoId, "GET")
					.then(function(response){
						const url = response.RepositoryUrl+response.items[0].RepositoryItemNumber;
						const name = response.items[0].RepositoryItemName;
						const repo = response;

						utils.serverRequest("/read-resource?url="+url, "GET").then(function(response){
							if (name == "Vital Signs"){
								$scope.vitalSigns = {
									data: response,
									name: name,
									repo: repo
								}
							}
							else {
								$scope.repositories.push({
									data: response,
									name: name,
									repo: repo
								});
							}
						}, function(error){
							utils.notify("An error occurred", "Unable to load document", "error");
						});
					}, function(error){
						utils.errorHandler(error);
					})
				}
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