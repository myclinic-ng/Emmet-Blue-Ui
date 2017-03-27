angular.module("EmmetBlue")

.controller("consultancyNewDiagnosisController", function($scope, utils, $http){
	var modules = {};

	modules.allergies = {
		loadAllergyTypes: function(){
			utils.serverRequest("/consultancy/allergy/view", "GET").then(function(response){
				$scope.allergies.allergyTypes = response;
			}, function(error){
				// utils.errorHandler(error);
			});
		},
		loadAllergyTypeTriggers: function(allergyID){
			utils.serverRequest("/consultancy/allergy-trigger/view-by-allergy?resourceId="+allergyID, "GET").then(function(response){
				$scope.allergies.allergyTypeTriggers = response;
			}, function(error){
				// utils.errorHandler(error);
			});
		},
		populateSymptomsTagsInput: function(){
		    $('.tagsinput-typeahead').tagsinput('input').typeahead({
	            hint: true,
	            highlight: true,
	            minLength: 1
	        },
	        {
	        	source: function(query, process){
	        		modules.globals.symptoms.typeAheadSource(query, process);
	        	}
	        })
		},
		loadPatientAllergies: function(patient){
			utils.serverRequest("/patients/patient-allergy/view?resourceId="+patient, "GET")
			.then(function(response){
				$scope.patient.allergies = response;
				// modules.allergies.loadPatientAllergies($scope.patient.profile.patientid);
			}, function(error){
				// utils.errorHandler(error);
			});
		},
		saveNewAllergy: function(){
			$scope.allergies.newAllergy.patient = $scope.patient.profile.patientid;
			utils.serverRequest("/patients/patient-allergy/new", "POST", $scope.allergies.newAllergy)
			.then(function(response){
				utils.alert("Operation Successful", "New allergy registered successfully", "success");
				$scope.allergies.newAllergy = {};
			}, function(error){
				utils.errorHandler(error);
			});
		}
	}

	modules.presentingComplaints = {
		symptomSearchAutoSuggestInit: function(){
			$(".symptom-search").typeahead({
	            hint: true,
	            highlight: true
	        },
	        {
	        	source: function(query, process){
	        		modules.globals.symptoms.typeAheadSource(query, process);
	        	}
	        })
		},
		performSymptomSearch: function(){
			var successCallback = function(response){
				if (response.hits.hits.length > 0){
					$scope.presentingComplaints.searchedSymptoms = response.hits.hits;
				}
				else {
					modules.presentingComplaints.addSymptomToComplaintList($scope.currentGlobalQuery);
				}
			}

			var errorCallback = function(error){
				utils.errorHandler(error);
			}

			var query = $("#presentingComplaints-symptomSearchQuery").val();
			$scope.currentGlobalQuery = query;
			if (query != ""){
				modules.globals.symptoms.search(query, successCallback, errorCallback);
			}
			else {
				utils.notify("Invalid search request", "Please make sure you have not submitted an empty search field", "warning");
			}
		},
		loadSymptom: function(id){
			return utils.storage.consultancy.symptoms[id];
		},
		addSymptomToComplaintList: function(symptomName, symptomDescription=""){
			var symptom = {
				title: symptomName,
				description: symptomDescription
			}
			var duplicationDetected = false;
			for (var i = 0; i < $scope.presentingComplaints.complaints.length; i++){
				if ($scope.presentingComplaints.complaints[i].title == symptom.title){
					duplicationDetected = true;
					break;
				}
			}
			if (duplicationDetected){
				utils.notify("Duplicate symptoms are not allowed", "The selected symptom has already been added to the complaints list, please select a new symptom", "warning");
			}
			else {
				$scope.presentingComplaints.complaints.push(symptom);
			}
		},
		removeSymptomFromComplaintList: function(index){
			$scope.presentingComplaints.complaints.splice(index, 1);
		}
	}

	modules.examination = {
		loadExaminationTypes: function(){
			utils.serverRequest("/consultancy/examination-type/view", "GET").then(function(response){
				$scope.examination.examinationTypes = response;
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}

	modules.labTests = {
		testSearchAutoSuggestInit: function(){
			$(".lab-tests-search").typeahead({
	            hint: true,
	            highlight: true
	        },
	        {
	        	source: function(query, process){
	        		modules.globals.labTests.typeAheadSource(query, process);
	        	}
	        })
		},
		performLabTestSearch: function(){
			var successCallback = function(response){
				$scope.labTests.searchPerformed = true;
				$scope.labTests.searchedTests = response.hits.hits;
			}

			var errorCallback = function(error){
				utils.errorHandler(error);
			}

			var query = $("#labTests-testSearchQuery").val();
			if (query != ""){
				modules.globals.labTests.search(query, successCallback, errorCallback);
			}
			else {
				utils.notify("Invalid search request", "Please make sure you have not submitted an empty search field", "warning");
			}
		},
		loadImagingInvestigations: function(){
			utils.serverRequest('/consultancy/medical-imaging/view', 'GET').then(function(response){
				$scope.labTests.imagingTests = response;
			}, function(error){
				utils.errorHandler(error);
			})
		},
		loadTest: function(id){
			return utils.storage.consultancy.labtests[id];
		},
		addToLabList: function(testName, testDescription=""){
			var test = {
				title: testName,
				description: testDescription,
				status: 0
			}
			var duplicationDetected = false;
			for (var i = 0; i < $scope.labTests.investigations.lab.length; i++){
				if ($scope.labTests.investigations.lab[i].title == test.title){
					duplicationDetected = true;
					break;
				}
			}
			if (duplicationDetected){
				utils.notify("Duplicate lab tests are not allowed", "The selected test has already been added to the lab investigations list, please select a new test", "warning");
			}
			else {
				$scope.labTests.investigations.lab.push(test);
			}
		},
		removeFromLabList: function(index){
			$scope.labTests.investigations.lab.splice(index, 1);
		},
		addToImagingList: function(testName, testDescription=""){
			var test = {
				title: testName,
				description: testDescription,
				status: 0
			}
			var duplicationDetected = false;
			for (var i = 0; i < $scope.labTests.investigations.imaging.length; i++){
				if ($scope.labTests.investigations.imaging[i].title == test.title){
					duplicationDetected = true;
					break;
				}
			}
			if (duplicationDetected){
				utils.notify("Duplicate investigations are not allowed", "The selected test has already been added to the investigations list, please select a new one", "warning");
			}
			else {
				$scope.labTests.investigations.imaging.push(test);
			}
		},
		removeFromImagingList: function(index){
			$scope.labTests.investigations.imaging.splice(index, 1);
		},
		sendForInvestigation: function(){
			var data = {
				investigationType: $scope.labTests.sendVariables.investigationType,
				patientID: $scope.patient.profile.patientid,
				clinicalDiagnosis: $scope.labTests.investigations.lab[$scope.labTests.investigations.lab.currentInvestigation].description,
				investigationRequired: $scope.labTests.investigations.lab[$scope.labTests.investigations.lab.currentInvestigation].title,
				requestedBy: utils.userSession.getID()
			}

			utils.serverRequest('/lab/lab-request/new', 'POST', data).then(function(response){
				$("#modal-send-to-lab").modal("hide");
				utils.notify("Operation Successful", "Request sent successfully", "success");
				$scope.labTests.investigations.lab[$scope.labTests.investigations.lab.currentInvestigation].status = -1;
			}, function(error){
				utils.errorHandler(error);
			})
		},
		sendForImagingInvestigation: function(){
			var data = {
				investigationType: $scope.labTests.sendVariables.investigationType,
				patientID: $scope.patient.profile.patientid,
				clinicalDiagnosis: $scope.labTests.investigations.imaging[$scope.labTests.investigations.imaging.currentInvestigation].description,
				investigationRequired: $scope.labTests.investigations.imaging[$scope.labTests.investigations.imaging.currentInvestigation].title,
				requestedBy: utils.userSession.getID()
			}

			utils.serverRequest('/lab/lab-request/new', 'POST', data).then(function(response){
				$("#modal-send-to-imaging").modal("hide");
				utils.notify("Operation Successful", "Request sent successfully", "success");
				$scope.labTests.investigations.imaging[$scope.labTests.investigations.imaging.currentInvestigation].status = -1;
			}, function(error){
				utils.errorHandler(error);
			})
		}
	}

	modules.patient = {
		searchAutoSuggestInit: function(){
			$(".patient-search").typeahead({
	            hint: true,
	            highlight: true
	        },
	        {
	        	source: function(query, process){
	        		modules.globals.patient.typeAheadSource(query, process);
	        	}
	        })
		},
		loadPatientProfile: function(){
			var successCallback = function(response){
				var result = response.hits.hits;
				if (result.length != 1){
					if (typeof $scope.patient != "undefined" && $scope.patient.isProfileReady == false){
						$scope.patient.isProfileReady = true;
					}
					utils.alert("Unable to load profile", "You have sent an ambiguous request to the server. Please refine your search query and try again. It is recommended to use an actual patient number for search.", "info");
				}
				else {
					$scope.patient.profile = result[0]["_source"];
					$scope.patient.isProfileReady = true;
					modules.allergies.loadPatientAllergies($scope.patient.profile.patientid);
					utils.notify("Profile loaded successfully", "", "info");
					modules.globals.loadSavedDiagnosis();
					$scope.patient.history.displayPage='profile';

					var req = utils.serverRequest("/patients/patient-repository/view-most-recent-json-by-patient?resourceId="+$scope.patient.profile.patientid, 'GET');
					req.then(function(response){
						$scope.mostRecentObservation = response
					}, function(error){
						utils.errorHandler(error);
						utils.notify("Unable to load most recent observation", "", "warning");
					});
				}
			}

			var errorCallback = function(error){
				if (typeof $scope.patient != "undefined" && $scope.patient.isProfileReady == false){
					$scope.patient.isProfileReady = true;
				}
				utils.errorHandler(error);
			}

			var query = $("#patient-patientSearchQuery").val();
			if (query != ""){
				if (typeof $scope.patient != "undefined" && $scope.patient.isProfileReady == true){
					$scope.patient.isProfileReady = false;
					$scope.patient.profileLoading = true;
				}
				modules.globals.patient.search(query, successCallback, errorCallback);
			}
			else {
				if (typeof $scope.patient != "undefined" && $scope.patient.isProfileReady == false){
					$scope.patient.isProfileReady = true;
				}
				utils.notify("Invalid search request", "Please make sure you have not submitted an empty search field", "warning");
			}
		},
		loadRepositories: function(){
			$scope.patient.history.displayPage = "repositories";

			var request = utils.serverRequest("/patients/patient-repository/view-by-patient?resourceId="+$scope.patient.profile.patientid, "GET");

			request.then(function(response){
				$scope.patient.history.repositories = response;				
			}, function(error){
				utils.errorHandler(error);
			});
		}
	}

	modules.conclusion = {
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

			console.log($scope.conclusion.prescriptionList);
		},
		removePrescriptionFromList: function(index){
			$scope.conclusion.prescriptionList.splice(index, 1);
		},
		sendToPharmacy: function(){
			var data = {
				request: $scope.conclusion.prescriptionList,
				patientId: $scope.patient.profile.patientid,
				requestedBy: utils.userSession.getID()
			}

			var req = utils.serverRequest("/pharmacy/pharmacy-request/new", "POST", data);

			req.then(function(response){
				utils.notify("Operation Successful", "The dispensory has been notified", "success");
				$("#modal-send-to-pharmacy").modal("hide");
			}, function(error){
				utils.errorHandler(error);
			});
		},
		drugSearchAutoSuggestInit: function(){
			$(".drug-search").typeahead({
	            hint: true,
	            highlight: true
	        },
	        {
	        	source: function(query, process){
	        		modules.globals.conclusion.drugTypeAheadSource(query, process);
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

			$("#conclusion-drug").val("");


			// $scope.conclusion.searchDrugGroups = {
			// 	name: drug
			// }

			// var successCallback = function(response){
			// 	$scope.conclusion.searchDrugGroups = response.data.drugGroup;
			// }

			// var errorCallback = function(error){
			// 	utils.notify("Unable to reach drugs server", "This is probably due to unavailability of internet access or some general error. Please contact an administrator if this error persists", "warning");
			// 	$("#modal-drugs").modal("hide");
			// }

			// $http.get(modules.globals.rxNormEndpoint+"/drugs?name="+drug).then(successCallback, errorCallback);
		}
	}

	modules.globals = {
		rxNormEndpoint: "https://rxnav.nlm.nih.gov/REST",
		loadRegisteredLabs: function(){
			utils.serverRequest('/lab/lab/view', 'GET').then(function(response){
				$scope.globals.registeredLabs = response;
			}, function(error){
				utils.errorHandler(error);
			})
		},
		loadRegisteredInvestigationTypes: function(lab){
			utils.serverRequest('/lab/investigation-type/view-by-lab?resourceId='+lab, 'GET').then(function(response){
				$scope.globals.registeredInvestigationTypes = response;
			}, function(error){
				utils.errorHandler(error);
			})
		},
		httpGetRequest: function(url, successCallback, errorCallback){
			utils.serverRequest(url, 'GET')
			.then(function(response){
        		successCallback(response);
        	}, function(error){
        		// errorCallback(error);
        	})
        },
        httpPostRequest: function(url, data, successCallback, errorCallback){
			utils.serverRequest(url, 'POST', data)
			.then(function(response){
        		successCallback(response);
        	}, function(error){
        		// errorCallback(error);
        	})
        },
		symptoms: {
			search: function(query, successCallback, errorCallback){
				modules.globals.httpGetRequest('/consultancy/infermedica/search-symptoms?phrase='+query, successCallback, errorCallback);
            },
			typeAheadSource: function(query, process){
	    		modules.globals.symptoms.search(query, function(response){
	    			var data = [];
	        		angular.forEach(response.hits.hits, function(value){
	        			data.push(value["_source"].name);
	        		})

	        		data = $.map(data, function (string) { return { value: string }; });
	        		process(data);
	    		}, function(error){
	    			utils.errorHandler(error);
	    		})
	    	},
	    	storeAllSymptomsPersistently: function(){
	    		modules.globals.symptoms.search("*", function(response){
	    			var data = {};
	        		angular.forEach(response.hits.hits, function(value){
	        			value = value["_source"];
	        			data[value.id] = value;
	        		})

	        		utils.storage.consultancy.symptoms = data;
	    		}, function(error){
	    			utils.errorHandler(error);
	    		})
	    	}
		},
		labTests: {
			search: function(query, successCallback, errorCallback){
				modules.globals.httpGetRequest('/consultancy/infermedica/search-lab-tests?phrase='+query, successCallback, errorCallback);
            },
			typeAheadSource: function(query, process){
	    		modules.globals.labTests.search(query, function(response){
	    			var data = [];
	        		angular.forEach(response.hits.hits, function(value){
	        			data.push(value["_source"].name);
	        		})

	        		data = $.map(data, function (string) { return { value: string }; });
	        		process(data);
	    		}, function(error){
	    			utils.errorHandler(error);
	    		})
	    	},
	    	storeAllLabTestsPersistently: function(){
	    		modules.globals.labTests.search("*", function(response){
	    			var data = {};
	        		angular.forEach(response.hits.hits, function(value){
	        			value = value["_source"];
	        			data[value.id] = value;
	        		})

	        		utils.storage.consultancy.labtests = data;
	    		}, function(error){
	    			utils.errorHandler(error);
	    		})
	    	}
		},
		patient: {
			search: function(query, successCallback, errorCallback){
				query = {
					query: query,
					from: 0,
					size: 5
				};

				modules.globals.httpPostRequest('/patients/patient/search', query, successCallback, errorCallback);
            },
			typeAheadSource: function(query, process){
	    		modules.globals.patient.search(query, function(response){
	    			var data = [];
	        		angular.forEach(response.hits.hits, function(value){
	        			data.push(value["_source"]["first name"]+ " " + value["_source"]["last name"]);
	        		})

	        		data = $.map(data, function (string) { return { value: string }; });
	        		process(data);
	    		}, function(error){
	    			utils.errorHandler(error);
	    		})
	    	}
		},
		conclusion:{
			drugTypeAheadSource: function(query, process){
	    		utils.serverRequest("/consultancy/drug-names/search?phrase="+query+"&staff="+utils.userSession.getUUID(), "GET").then(function(response){
	    			var data = [];
	        		angular.forEach(response, function(value){
	        			data.push(value);
	        		})

	        		data = $.map(data, function (string) { return { value: string }; });
	        		process(data);
	    		}, function(error){
	    			// utils.errorHandler(error);
	    		})
	    	}
		},
		saveDiagnosis: function(){
			var complaints = $scope.presentingComplaints.complaints;
			var examination = $scope.examination.examinationTypes;
			var lab = $scope.labTests.investigations.lab;
			var imaging = $scope.labTests.investigations.imaging;
			var diagnosis = $scope.conclusion.diagnosis;
			var prescription = $scope.conclusion.prescriptionList;

			var data = {
				patient: $scope.patient.profile.patientid,
				consultant: utils.userSession.getID(),
				diagnosis:{
					complaints: complaints,
					examination: examination,
					investigations: {
						lab: lab,
						imaging: imaging
					},
					conclusion: {
						diagnosis: diagnosis,
						prescription: prescription
					}
				}
			}

			var successCallback = function(response){
				utils.notify("Operation Successful", "Diagnosis progress has been saved successfully", "success");
			}

			var errorCallback = function(error){
				utils.errorHandler(error);
			}

			utils.serverRequest("/consultancy/saved-diagnosis/new", "POST", data).then(successCallback, errorCallback);
		},
		submitDiagnosis: function(){
			var complaints = $scope.presentingComplaints.complaints;
			var examination = $scope.examination.examinationTypes;
			var lab = $scope.labTests.investigations.lab;
			var imaging = $scope.labTests.investigations.imaging;
			var diagnosis = $scope.conclusion.diagnosis;
			var prescription = $scope.conclusion.prescriptionList;

			var data = {
				patient: $scope.patient.profile.patientid,
				diagnosisBy: utils.userSession.getUUID(),
				diagnosisTitle: diagnosis.title,
				diagnosis:{
					complaints: complaints,
					examination: examination,
					investigations: {
						lab: lab,
						imaging: imaging
					},
					conclusion: {
						diagnosis: diagnosis,
						prescription: prescription
					}
				}
			}

			var successCallback = function(response){
				utils.notify("Operation Successful", "Diagnosis has been submitted", "success");

				utils.storage.currentPatientNumberDiagnosis = null;
				var req = utils.serverRequest('/consultancy/saved-diagnosis/delete?resourceId='+$scope.globals.currentSavedDiagnosisID, 'DELETE');
				req.then(function(response){}, function(error){});
			}

			var errorCallback = function(error){
				utils.errorHandler(error);
			}

			utils.serverRequest("/patients/patient-diagnosis/new", "POST", data).then(successCallback, errorCallback);
		},
		loadSavedDiagnosis: function(){
			var patient = $scope.patient.profile.patientid;
			var consultant = utils.userSession.getID();

			var successCallback = function(response){
				if (response.length > 0){
					for(var i = 0; i < response.length; i++){
						var diagnosis = response[i].Diagnosis;
						$scope.presentingComplaints.complaints = diagnosis.complaints;
						$scope.examination.examinationTypes = diagnosis.examination;
						$scope.labTests.investigations.lab = diagnosis.investigations.lab;
						$scope.labTests.investigations.imaging = diagnosis.investigations.imaging;
						$scope.conclusion.diagnosis = diagnosis.conclusion.diagnosis;
						$scope.conclusion.prescriptionList = diagnosis.conclusion.prescription;
						$scope.globals.currentSavedDiagnosisID = response[i].SavedDiagnosisID;
						utils.notify("Info", "Please note that the last saved diagnosis for this profile has been loaded", "info");
					}
				}
				else {
					$scope.presentingComplaints.complaints = [];
					$scope.examination.examinationTypes = [];
					$scope.labTests.investigations.lab = [];
					$scope.labTests.investigations.imaging = [];
					$scope.conclusion.diagnosis = {};
					$scope.conclusion.prescriptionList = [];

					modules.examination.loadExaminationTypes();
				}
			}

			var errorCallback = function(error){
				utils.errorHandler(error);
			}
			utils.serverRequest("/consultancy/saved-diagnosis/view?resourceId="+consultant+"&patient="+patient, "GET").then(successCallback, errorCallback);
		}
	}

	var bootstrap = function(){
		if (typeof utils.storage.currentPatientNumberDiagnosis != "undefined" && utils.storage.currentPatientNumberDiagnosis != null){
			$("#patient-patientSearchQuery").val(utils.storage.currentPatientNumberDiagnosis);
			modules.patient.loadPatientProfile();
		}

		$scope.mostRecentObservation = {};

		$scope.globals = {
			today: function(){
				var date = new Date();
				return date.toDateString();
			},
			save: modules.globals.saveDiagnosis,
			submit: modules.globals.submitDiagnosis,
			registeredLabs: [],
			registeredInvestigationTypes: [],
			currentSavedDiagnosisID: 0
		};

		modules.globals.loadRegisteredLabs();

		$scope.$watch(function(){ return $scope.labTests.sendVariables.lab; }, function(nv){
			modules.globals.loadRegisteredInvestigationTypes(nv);
		})

		utils.storage.consultancy = {
		};

		if (typeof utils.storage.consultancy.symptoms == "undefined"){
			modules.globals.symptoms.storeAllSymptomsPersistently();
		}

		if (typeof utils.storage.consultancy.labtests == "undefined"){
			modules.globals.labTests.storeAllLabTestsPersistently();
		}

		$scope.allergies = {
			newAllergy: {},
			saveNewAllergy: modules.allergies.saveNewAllergy
		};

		modules.allergies.loadAllergyTypes();
		modules.allergies.populateSymptomsTagsInput();

		$scope.$watch(function(){
			return $scope.allergies.newAllergy.type;
		}, function(newValue){
			if (typeof newValue != "undefined"){
				modules.allergies.loadAllergyTypeTriggers(newValue);				
			}
		});


		$scope.presentingComplaints = {
			symptomSearchQuery: "",
			performSymptomSearch: modules.presentingComplaints.performSymptomSearch,
			loadSymptom: modules.presentingComplaints.loadSymptom,
			complaints: [],
			addToList: modules.presentingComplaints.addSymptomToComplaintList,
			removeFromList: modules.presentingComplaints.removeSymptomFromComplaintList
		};

		modules.presentingComplaints.symptomSearchAutoSuggestInit();
		$scope.presentingComplaints.searchedSymptoms = {};

		$scope.examination = {
			examinationTypes: []
		};

		modules.examination.loadExaminationTypes();

		$scope.labTests = {
			performLabTestSearch: modules.labTests.performLabTestSearch,
			loadTest: modules.labTests.loadTest,
			investigations: {
				lab: [],
				imaging: []
			},
			addToLabList: modules.labTests.addToLabList,
			removeFromLabList: modules.labTests.removeFromLabList,
			addToImagingList: modules.labTests.addToImagingList,
			removeFromImagingList: modules.labTests.removeFromImagingList,
			searchPerformed: false,
			sendVariables: {},
			sendForInvestigation: modules.labTests.sendForInvestigation,
			sendForImagingInvestigation: modules.labTests.sendForImagingInvestigation
		}

		modules.labTests.testSearchAutoSuggestInit();
		modules.labTests.loadImagingInvestigations();
		$scope.labTests.searchedTests = {};
		$scope.labTests.imagingTests = {};

		$scope.patient = {
			loadPatientProfile: modules.patient.loadPatientProfile,
			isProfileReady: false,
			history: {
				displayPage: 'profile',
				loadRepositories: modules.patient.loadRepositories,
				repositories: {},
				loadRepo: function(repo){
					$scope.patient.history.repositories.currentRepository = repo;
					$("#repository-items").modal("show");
				}
			}
		}

		modules.patient.searchAutoSuggestInit();
		$scope.patient.profile = {};
		$scope.patient.allergies = {};

		modules.conclusion.drugSearchAutoSuggestInit();

		$scope.conclusion = {
			prescriptionList: [],
			diagnosis: {},
			addPrescriptionToList: modules.conclusion.addPrescriptionToList,
			removePrescriptionFromList: modules.conclusion.removePrescriptionFromList,
			addDrugsToPrescriptionToList: modules.conclusion.addDrugsToPrescriptionToList,
			searchDrug: modules.conclusion.searchDrug,
			sendToPharmacy: modules.conclusion.sendToPharmacy,
			catchSearchDrugEnterPress: modules.conclusion.catchSearchDrugEnterPress
		}
	}();


	function dtAction(data, full, meta, type){
		selectButtonAction = "manage('select',"+data.StaffID+")";

		var dataOpts = "data-option-id = '"+data.StaffID+"' "+
					   "data-option-name = '"+data.StaffFullName+"' "+
					   "data-option-role = '"+data.StaffRole+"'";

		select = "<button class='btn btn-success bg-white no-border-radius selectBtn' ng-click=\""+selectButtonAction+"\""+dataOpts+" ><i class='fa fa-user-md'></i> Select</button>";
		return "<div class='btn-group'>"+select+"</div>";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/nursing/load-doctors/view', 'GET');
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
	.withFixedHeader()
	.withOption('createdRow', function(row, data, dataIndex){
		utils.compile(angular.element(row).contents())($scope);
	})
	.withOption('headerCallback', function(header) {
        if (!$scope.headerCompiled) {
            $scope.headerCompiled = true;
            utils.compile(angular.element(header).contents())($scope);
        }
    })

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn(null).withTitle("S/N").renderWith(function(data, type, full, meta){
			return meta.row + 1;
		}),
		utils.DT.columnBuilder.newColumn('StaffFullName').withTitle("Medical Specialist"),
		utils.DT.columnBuilder.newColumn('StaffRole').withTitle("Specialty"),
		utils.DT.columnBuilder.newColumn(null).withTitle("").renderWith(dtAction).notSortable()
	];

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}

	$scope.referral = {};
	$scope.manage = function(option, id){
		switch (option){
			case "select":{
				var referralSpecialist = {
					id: id,
					name: $(".selectBtn[data-option-id='"+id+"']").attr("data-option-name"),
					role: $(".selectBtn[data-option-id='"+id+"']").attr("data-option-role")
				}
				$scope.referral.specialist = referralSpecialist;
				break;
			}
		}
	}

	$scope.newReferral = {};
	$scope.completeReferral = function(){
		$scope.newReferral.patient = $scope.patient.profile.patientid;
		$scope.newReferral.referredTo = $scope.referral.specialist.id;
		$scope.newReferral.referrer = utils.userSession.getID();

		var req = utils.serverRequest("/consultancy/patient-referral/new", "POST", $scope.newReferral);

		req.then(function(success){
			$("#refer-patient").modal("hide");
			$scope.newReferral = {};
			$scope.referral = {};
			utils.notify("Patient Referred Successful", $scope.referral.specialist.name+" has been notified about this referral", "success");
		}, function(error){
			utils.errorHandler(error);
		})
	}
});