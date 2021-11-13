angular.module("EmmetBlue")

.directive('ngLabRequestFormDesign', function(){
	return {
		restrict: 'AE',
		scope: {
			patientInfo: '=patientInfo'
		},
		templateUrl: "plugins/consultancy/assets/includes/lab-request-form-template.html",
		controller: function($scope, utils, $rootScope){
			$scope.showSubmitLoader = false;
			$scope.investigationLists = {};
			$scope.today = utils.today()+ " " + (new Date()).toLocaleTimeString();
			$scope.getAge = utils.getAge;

			// var table = $(".lab-table tr");

			// $("#lab-form > div > .table-responsive").css("border", "1px solid #000");

			// table.each(function(){
			// 	var th = $(this).children("th").first();
			// 	var td = $(this).children("td").first();

			// 	th.html("<div class='checkbox'><label><input type='checkbox' class='control-primary'/> "+th.html()+"</label></div>").addClass("bg-danger")
			// 	td.html("<div class='checkbox'><label><input type='checkbox' class='control-primary'/> "+td.html()+"</label></div>")
			// });

			$scope.module = {
				loadRegisteredLabs: function(){
					utils.serverRequest('/lab/lab/view?resourceId='+$scope.module.lab, 'GET').then(function(response){
						$scope.module.registeredLabs = response;
					}, function(error){
						utils.errorHandler(error);
					})
				},
				loadRegisteredInvestigationTypes: function(lab){
					utils.serverRequest('/lab/investigation-type/view-by-lab?resourceId='+lab, 'GET').then(function(response){
						$scope.module.registeredInvestigationTypes = response;
						$scope.investigationLists = {};
					}, function(error){
						utils.errorHandler(error);
					})
				},
				lab: ''
			}

			$scope.module.loadRegisteredLabs();
			$scope.$watch(function(){ if (typeof $scope.module.lab !== "undefined"){ return $scope.module.lab;} }, function(nv){
				$scope.module.loadRegisteredInvestigationTypes(nv);
			})

			var showLabForwarder = function(response){
				$scope.pushToLab = {
					investigations: []
				};
				if ($scope.investigationLists.length !== 0){
					$scope.requestId = response.lastInsertId;
					$("#labForwarderModal").modal("show");
					var req = utils.serverRequest("/patients/patient/view/"+$scope.patientInfo.patientid, "GET");
					req.then(function(response){
						$scope.pushToLab.gender = response["_source"].gender;
						$scope.pushToLab.picture = response["_source"].patientpicture;
						$scope.pushToLab.phoneNumber = response["_source"]["phone number"];
						$scope.pushToLab.firstName = response["_source"]["first name"];
						$scope.pushToLab.lastName = response["_source"]["last name"];
						$scope.pushToLab.address = response["_source"]["home address"];
						$scope.pushToLab.dateOfBirth = response["_source"]["date of birth"];


						var req = utils.serverRequest("/lab/lab-request/view/"+$scope.requestId, "GET");
						req.then(function(response){
							$scope.pushToLab.clinicalDiagnosis = response.ClinicalDiagnosis;
							$scope.pushToLab.dateRequested = response.RequestDate;
							$scope.pushToLab.investigationRequired = response.InvestigationRequired;
							$scope.pushToLab.request = response.RequestID;
							$scope.pushToLab.requestedBy = response.RequestedBy;
							$scope.pushToLab.patientID = response.PatientID;

							angular.forEach($scope.investigationLists, function(value, key){
								if (value){
									var req = utils.serverRequest("/lab/investigation-type/view/"+key, "GET");
									req.then(function(response){
										response = response[0];
										$scope.pushToLab.investigations.push({
											iName: response.InvestigationTypeName,
											investigation: response.InvestigationTypeID,
											lName: response.LabName,
											lab: response.LabID
										});
									}, function(error){
										utils.errorHandler(error);
									})
								}
							});
						}, function(error){
							utils.errorHandler(error);
						});

					}, function(error){
						utils.errorHandler(error);
					})
				}
			}

			$scope.forwardPushToLab = function(){
				var req = utils.serverRequest("/lab/patient/new", "POST", $scope.pushToLab);
				req.then(function(response){
					if (response){
						utils.notify("Operation successful", "This patient can go to the lab", "success");
						$("#labForwarderModal").modal("hide");
						utils.serverRequest("/lab/lab-request/close-request", "POST", {"request": $scope.pushToLab.request, "staff": utils.userSession.getID()})
						.then(function(response){
							$rootScope.$broadcast("ReloadQueue");
							utils.serverRequest("/lab/lab-request/close-request", "POST", {"request": $scope.pushToLab.request, "staff": utils.userSession.getID()})
							.then(function(response){
								$rootScope.$broadcast("ReloadQueue");
								$rootScope.$broadcast("reloadLabPatients", {});
							}, function(error){
								utils.errorHandler(error);
							});
						}, function(error){
							utils.errorHandler(error);
						});
					}
				}, function(error){
					utils.errorHandler(error);
				});
			}

			$scope.submit = function(){
				$scope.filterLab = "";
				setTimeout(function(){
					$scope.showSubmitLoader = true;
					var reqs = [];

					$(".invCheck").each(function(){
						var checked = $(this).prop("checked");

						if (checked){
							reqs.push($.trim($(this).parent().text()));
							$(this).attr("checked", "checked");
							$(this).attr("style", "outline: 1px solid #0f0;width: 20px; height: 20px");
						}
					})

					if (typeof $scope.investigations !== "undefined"){
						reqs.push($scope.investigations);
					}

					$rootScope.$broadcast("addSentLabInvestigationsToList", reqs);
					$scope.investigations = [];
					angular.forEach(reqs, function(value, key){
						$scope.investigations.push({
							"investigationRequired":value,
							"labId":$scope.module.lab
						});
					})

					var data = {
						patientID: $scope.patientInfo.patientid,
						clinicalDiagnosis: '',
						requestNote: $scope.diagnoses,
						investigations: $scope.investigations,
						requestedBy: utils.userSession.getID()
					}

					utils.serverRequest('/lab/lab-request/new', 'POST', data).then(function(response){
						$scope.showSubmitLoader = false;
						window.scrollTo(0, 0);
						utils.notify("Operation Successful", "Request sent successfully", "success");
						$scope.investigations = "";
						reqs = [];
						$scope.module.loadRegisteredInvestigationTypes($scope.module.lab);
						// showLabForwarder(response); -> Disable until feature is requested
					}, function(error){
						utils.errorHandler(error);
					})
				}, 200)
			}
		}
	}
})