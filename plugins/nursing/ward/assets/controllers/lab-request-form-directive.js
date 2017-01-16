angular.module("EmmetBlue")

.directive("ngLabRequestForm", function(){
	return {
		restrict: 'AE',
		scope: {
			patientId: '=patientId'
		},
		templateUrl: "plugins/nursing/ward/assets/includes/lab-request-form-template.html",
		controller: function($scope, utils, $rootScope){
			$scope.registeredLabs = {};
			$scope.request = {};
			var loadRegisteredLabs = function(){
				utils.serverRequest('/lab/lab/view', 'GET').then(function(response){
					$scope.registeredLabs = response;
				}, function(error){
					utils.errorHandler(error);
				})
			}


			var loadRegisteredInvestigationTypes = function(lab){
				utils.serverRequest('/lab/investigation-type/view-by-lab?resourceId='+lab, 'GET').then(function(response){
					$scope.registeredInvestigationTypes = response;
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.$watch(function(){ return $scope.request.lab; }, function(nv){
				loadRegisteredInvestigationTypes(nv);
			});

			loadRegisteredLabs();

			$scope.sendForInvestigation = function(){
				var data = {
					investigationType: $scope.request.investigationType,
					patientID: $scope.patientId,
					clinicalDiagnosis: $scope.request.description,
					investigationRequired: null,
					requestedBy: utils.userSession.getID()
				}

				utils.serverRequest('/lab/lab-request/new', 'POST', data).then(function(response){
					$rootScope.$broadcast("labRequestSent");
					$scope.request = {};
					utils.notify("Operation Successful", "The specified lab has been notified and result will be published to the patient's archive as soon as it is ready", "success");
				}, function(error){
					utils.errorHandler(error);
				})
			}

		}
	}
})