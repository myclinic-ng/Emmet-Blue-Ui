angular.module("EmmetBlue")

.directive('ngPatientMedicalSummary', function(){
	return {
		restrict: 'AE',
		scope: {
			patientId: '=patientId'
		},
		templateUrl: "plugins/consultancy/assets/includes/medical-summary-template.html",
		controller: function($scope, utils){
			$scope.newSummary = {};
			function reloadTable(){
				var req = utils.serverRequest("/patients/medical-summary/view?resourceId="+$scope.patientId, "GET");

				req.then(function(response){
					$scope.medicalSummary = response;
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

			$scope.loadFields = function(){
				var req = utils.serverRequest("/patients/medical-summary/view-field", "GET");
				req.then(function(response){
					$scope.summaryFields = response;
				}, function(error){
					utils.errorHandler(error);
				});
			}

			$scope.submitNewSummary = function(){
				var summ = $scope.newSummary;
				summ.patient = $scope.patientId;
				summ.staff = utils.userSession.getID();

				var req = utils.serverRequest("/patients/medical-summary/new", "POST", [summ]);
				req.then(function(response){
					$("#newField").modal("hide");
					reloadTable();
					$scope.newSummary = {};
				}, function(error){
					utils.errorHandler(error);
				});
			}

			$scope.editSummary = function(summ){
				$scope.newSummary = summ;

				// $("#editField").modal("show");
			}

			$scope.submitUpdateSummary = function(){
				var summ = {
					SummaryText: $scope.newSummary.SummaryText,
					resourceId: $scope.newSummary.SummaryID,
					LastModifiedBy: utils.userSession.getID()
				};

				var req = utils.serverRequest("/patients/medical-summary/edit", "PUT", [summ]);
				req.then(function(response){
					$("#editField").modal("hide");
					reloadTable();
					$scope.newSummary = {};
				}, function(error){
					utils.errorHandler(error);
				});

			}
		}
	}
})