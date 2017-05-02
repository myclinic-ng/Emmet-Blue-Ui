angular.module("EmmetBlue")

.directive('ngPharmacyPrescriptionRequest', function(){
	return {
		restrict: 'AE',
		scope: {
			patient: "=patient"
		},
		templateUrl: "plugins/consultancy/assets/includes/pharmacy-prescription-template.html",
		controller: function($scope, utils, $rootScope){
			var modules = {};
			$scope.currentDiagnosis = "";

			modules.conclusion = {
				loadPrescriptionTemplates: function(){
					var req = utils.serverRequest("/consultancy/prescription-template/view", "GET");
					req.then(function(response){
						$scope.conclusion.prescriptionTemplates = response;
					}, function(error){
						utils.errorHandler(error);
					})
				},
				loadTemplateForPrescription: function(template){
					var req = utils.serverRequest("/consultancy/prescription-template/view-template-items?resourceId="+template, "GET");
					req.then(function(response){
						angular.forEach(response, function(value, key){
							modules.conclusion.addPrescriptionToList(value.Item, value.Note);
						});
					}, function(error){
						utils.errorHandler(error);
					})
				},
				addDrugsToPrescriptionToList: function(){
					$("#modal-drugs").modal("hide");
					// utils.notify("Operation in progress", "Drugs are being added to the prescription list, please note that this might take a few seconds to complete", "info");
					angular.forEach($scope.conclusion.searchDrugGroups.conceptGroup, function(value){
						if (typeof value.conceptProperties != "undefined"){
							for(var i = 0; i < value.conceptProperties.length; i++){
								if (typeof value.conceptProperties[i].selected != "undefined" && value.conceptProperties[i].selected == true){
									modules.conclusion.addPrescriptionToList(value.conceptProperties[i].name);
								}
							}
						}
					})
				},
				addPrescriptionToList: function(item, duration = ""){
					if (item !== ""){
						var prescription = {
							item: item,
							duration: duration
						};

						var duplicationDetected = false;
						for (var i = 0; i < $scope.conclusion.prescriptionList.length; i++){
							if ($scope.conclusion.prescriptionList[i].item == prescription.item){
								duplicationDetected = true;
								break;
							}
						}
						if (duplicationDetected){
							utils.notify("Duplicate items are not allowed", item+" has already been added to the prescription list", "warning");
						}
						else {
							$scope.conclusion.prescriptionList.push(prescription);
						}
					}
				},
				removePrescriptionFromList: function(index){
					$scope.conclusion.prescriptionList.splice(index, 1);
				},
				sendToPharmacy: function(){
					if ($scope.currentDiagnosis != ""){
						var data = {
							request: $scope.conclusion.prescriptionList,
							patientId: $scope.patient.profile.patientid,
							requestedBy: utils.userSession.getID()
						}

						if (data.request.length < 1){
							utils.notify("Request Denied", "You are not allowed to send an empty prescription list", "warning");
						}
						else {
							var req = utils.serverRequest("/pharmacy/pharmacy-request/new", "POST", data);

							req.then(function(response){
								utils.notify("Operation Successful", "The dispensory has been notified", "success");
								$rootScope.$broadcast("addPrescriptionToList", $scope.conclusion.prescriptionList);
								$scope.conclusion = {};
								$("#modal-send-to-pharmacy").modal("hide");
							}, function(error){
								utils.errorHandler(error);
							});
						}
					}
					else {
						utils.notify("No diagnosis has been provided", "Please fill in a diagnosis to continue sending this list to the appropriate unit", "warning");
					}
				},
				drugSearchAutoSuggestInit: function(){
					$(".drug-search").typeahead({
			            hint: true,
			            highlight: true
			        },
			        {
			        	displayKey: 'BillingTypeItemName',
			        	source: function(query, process){
			        		utils.serverRequest("/consultancy/drug-names/search?phrase="+query+"&staff="+utils.userSession.getUUID(), "GET").then(function(response){
				    			var data = [];
				        		angular.forEach(response, function(value){
				        			data.push(value);
				        		})

				        		data = $.map(data, function (string) { return string; });
					        		process(data);
					    		}, function(error){
				    		})
			        	},
			        	templates: {
			        		suggestion: function(string){
			        			var quant = "";
			        			var stores = string._meta.StoreCount + " store";
			        			var icon = "";
			        			if (string._meta.TotalQuantity > 0){
			        				quant = "<span class='text-success'>"+string._meta.TotalQuantity+"</span>";
			        				icon = "<i class='icon-checkmark4 text-success'></i>";
			        			}
			        			else {
			        				quant = "<span class='text-danger'>0</span>";
			        				icon = "<i class='icon-warning text-warning'></i>"
			        			}

			        			if (string._meta.StoreCount > 1){
			        				stores += "s";
			        			}

		        				return	"<div class='row'>"+
		        							"<div class='col-xs-9'>"+
		        								"<div class='col-xs-2 center-block valign-middle mt-20'>"+
		        									icon+
		        								"</div>"+
			        							"<div class='col-xs-10'>"+
					        						"<p class='text-bold'>"+string.BillingTypeItemName+"</p>"+
					        						"<p class='text-muted'>"+string.BillingTypeName+"</p>"+
				        						"</div>"+
			        						"</div>"+
			        							"<div class='col-xs-3 text-center'>"+
			        							"<h6 class='no-margin'>"+quant+" <small class='display-block text-size-small no-margin'>available in<br/> "+stores+"</small></h6>"+
		        							"</div>"+

			        					"</div>";
			        		}
			        	}
			        })
				},
				catchSearchDrugEnterPress: function(e){
					if (e.which == 13){
						modules.conclusion.searchDrug();
					}
				},
				searchDrug: function(){
					var drug = $("#conclusion-drug").val();

					$scope.conclusion.addPrescriptionToList(drug);

					$("#conclusion-drug").val("")
				}
			}

			modules.conclusion.drugSearchAutoSuggestInit();
			modules.conclusion.loadPrescriptionTemplates();

			$scope.conclusion = {
				prescriptionList: [],
				prescriptionTemplates: [],
				diagnosis: {},
				addPrescriptionToList: modules.conclusion.addPrescriptionToList,
				removePrescriptionFromList: modules.conclusion.removePrescriptionFromList,
				addDrugsToPrescriptionToList: modules.conclusion.addDrugsToPrescriptionToList,
				searchDrug: modules.conclusion.searchDrug,
				sendToPharmacy: modules.conclusion.sendToPharmacy,
				catchSearchDrugEnterPress: modules.conclusion.catchSearchDrugEnterPress,
				loadTemplateForPrescription: modules.conclusion.loadTemplateForPrescription
			}

			$scope.$on("currentDiagnosis", function(e, data){
				$scope.currentDiagnosis = data;
			})
		}
	}
})