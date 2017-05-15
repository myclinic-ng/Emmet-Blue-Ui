angular.module("EmmetBlue")

.directive('ngPatientAdmissionHistory', function(){
	return {
		restrict: 'AE',
		scope: {
			patientId: '=patientId'
		},
		templateUrl: "plugins/consultancy/assets/includes/patient-admission-history-template.html",
		controller: function($scope, utils){
			function reloadTable(){
				var req = utils.serverRequest("/consultancy/patient-admission/view-admitted-patients?resourceId=0&ignore=true&patientId="+$scope.patientId, "GET");

				req.then(function(response){
					$scope.admissionDetails = response;
				}, function(error){
					utils.errorHandler(error);
				})

			}

			$scope.toDateString = function(date){
				return (new Date(date)).toDateString()+", "+(new Date(date)).toLocaleTimeString();
			}

			$scope.$watch("patientId", function(nv){
				reloadTable();
			})

			$scope.loadWorkspace = function(id){
				utils.storage.currentWorkspacePatientToLoad = id;
				$("#admissionWorkspace").modal("show");
			}
		}
	}
})