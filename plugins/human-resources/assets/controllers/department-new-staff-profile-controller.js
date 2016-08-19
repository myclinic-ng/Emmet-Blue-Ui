angular.module('EmmetBlue')

.controller('humanResourcesStaffManagementNewStaffProfileController', function($scope, utils){
	var functions = {
		loadStaffProfileRecords: function(){
			var sendForprofileRecords = utils.serverRequest('/human-resources/staff-profile-record/view', 'GET');

			sendForprofileRecords.then(function(response){
				$scope.profileRecords = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		},

		submitStaffProfile: function(){
			console.log($scope.staffProfile);
		}
	}

	$scope.profileRecords = {};
	$scope.staffProfile = {};

	functions.loadStaffProfileRecords();
	$scope.submitStaffProfile = function(){
		functions.submitStaffProfile;
	}
})