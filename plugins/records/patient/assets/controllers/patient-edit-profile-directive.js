angular.module("EmmetBlue")

.directive('ngEditProfile', function(){
	return {
		restrict: 'AE',
		scope: {
			patientInfo: '=patientInfo'
		},
		templateUrl: "plugins/records/patient/assets/includes/edit-profile-template.html",
		controller: function($scope, utils){
			$scope.loadPatientTypes = function(categoryId){
				var requestData = utils.serverRequest("/patients/patient-type/view-by-category?resourceId="+categoryId, "GET");
				requestData.then(function(response){
					$scope.patientTypes = response;
				}, function(responseObject){
					utils.errorHandler(responseObject);
				});
			}


			$scope.loadPatientCategories = function(){
				var requestData = utils.serverRequest("/patients/patient-type-category/view", "GET");
				requestData.then(function(response){
					$scope.patientCategories = response;
				}, function(responseObject){
					utils.errorHandler(responseObject);
				});
			}

			$scope.$watch("patientCategory", function(newValue, oldValue){
				$scope.loadPatientTypes(newValue);
			})

			$scope.loadPatientCategories();
			$scope.loadPatientTypes();
			
			$scope.disablers = {
				enable_camera: true,
				take_snapshot: false,
				snapshot_taken: false
			};

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
			var loadFields = function(){
				var req = utils.serverRequest("/patients/patient/view-record-fields?resourceId="+$scope.patientInfo.patientid, "GET");

				req.then(function(response){
					$scope.fields = response;
					$(".edit-profile-field").on("focus", function(e){
						$(this).select();
					});

				}, function(error){
					utils.errorHandler(error);
				})
			}

			loadFields();

			$scope.saveEditedFields = function(){
				var data = [];

				for(var i = 0; i < $scope.fields.length; i++){
					if (typeof $scope.fields[i].edited !== "undefined" && $scope.fields[i].edited == true){
						data.push({
							resourceId: $scope.fields[i].FieldValueID,
							FieldValue: $scope.fields[i].FieldValue
						});
					}
				}

				var req = utils.serverRequest("/patients/patient/edit-patient-records-field-value", "PUT", {"patient": $scope.patientInfo.patientid, "data": data});

				req.then(function(response){
					loadFields();
					utils.notify("Operation Successful", "Selected profile has been updated successfully. You need to reload your browser for changes to take effect", "success");
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.saveChangeType = function(){
				var data = {
					type: $scope.patientType,
					patient: $scope.patientInfo.patientid,
					staff: utils.userSession.getID()
				}

				var req = utils.serverRequest("/patients/patient/change-type", "PUT", data);

				req.then(function(response){
					utils.notify("Operation Successful", "Selected profile has been updated successfully. You need to reload your browser for changes to take effect", "success");
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.saveNewPassport = function(){
	        	$scope.patientPassport = $("#passport").attr("src");

	        	var data = {
	        		photo: $scope.patientPassport,
	        		patient: $scope.patientInfo.patientid
	        	}

	        	var req = utils.serverRequest("/patients/patient/update-photo", "PUT", data);

	        	req.then(function(response){
					utils.notify("Operation Successful", "Selected profile has been updated successfully. You need to reload your browser for changes to take effect", "success");
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
})