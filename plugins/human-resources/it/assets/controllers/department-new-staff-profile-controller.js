angular.module('EmmetBlue')

.controller('humanResourcesStaffManagementNewStaffProfileController', function($scope, $rootScope, utils){
	$scope.utils = utils;
	$scope.disablers = {
		enable_camera: true,
		take_snapshot: false,
		snapshot_taken: false
	};

	var functions = {
		loadStaffProfileFieldTitles: function(){
			var sendForprofileFieldTitles = utils.serverRequest('/human-resources/staff-profile-record/view', 'GET');

			sendForprofileFieldTitles.then(function(response){
				$scope.profileFieldTitles = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		},

		submitStaffProfile: function(){
			console.log($scope.staffProfile);
		}
	}

	$scope.profileFieldTitles = {};
	$scope.staffProfile = {};

	functions.loadStaffProfileFieldTitles();
	// $scope.submitStaffProfile = function(){
	// 	functions.submitStaffProfile();
	// }

	$scope.eDisablers = function(option){
		switch(option){
			case "enable":{
				$scope.disablers.take_snapshot = true;
				$scope.disablers.enable_camera = false;
				$scope.disablers.snapshot_taken = false;
				break;
			}
			case "take":{
				$scope.disablers.take_snapshot = false;
				$scope.disablers.enable_camera = false;
				$scope.disablers.snapshot_taken = true;
				break;
			}
			case "retake":{
				$scope.disablers.take_snapshot = true;
				$scope.disablers.enable_camera = false;
				$scope.disablers.snapshot_taken = false;
				break;
			}
		}
	}

	$("#document").on("change", function(){
		$scope.documentUploaded();
	});

	$scope.documentUploaded = function(){
		var file = document.getElementById('document').files[0];
  		var reader = new FileReader();
  		reader.onloadend = function(e){
  			var data = e.target.result;
  			$scope.staffProfile.documents = data;
  		}
  		reader.readAsDataURL(file);
	}
	
	$scope.submit = function(){
  		$scope.staffProfile.staffPassport = $("#passport").attr("src");

  		var data = $scope.staffProfile;
  		if (typeof $scope.staffProfile['First Name'] !== "undefined" || typeof $scope.staffProfile['Last Name'] !== "undefined") {
  			data.staffName = $scope.staffProfile['First Name'] + " " + $scope.staffProfile['Last Name'];
	  		
			$('.loader').addClass('show');
			data.staffId = utils.storage.hr.currentNewStaffID;
	  		var submitData = utils.serverRequest("/human-resources/staff-profile/new", "POST", data);

	  		submitData.then(function(response){
	  			$('.loader').removeClass('show');
	  			utils.alert("Info", "Record Uploaded successfully", "success");
				$scope.staffProfile = {};
				$("#passport").attr("src", "plugins/records/staff/assets/images/passport-placeholder.png");
				$scope.eDisablers("enable");
				$rootScope.$broadcast("new-staff-profile-registered");
				$("#new_staff_profile").modal("hide");
	  		}, function(response){
	  			$('.loader').removeClass('show');
	  			utils.errorHandler(response);
	  		})
  		}
  		else {
  			utils.alert("Incomplete information", "Both the firstname and lastname fields are compulsory fields", "error");
  		}
	}
})