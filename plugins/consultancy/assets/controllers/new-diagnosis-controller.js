angular.module("EmmetBlue")

.controller("consultancyNewDiagnosisController", function($scope, utils, $http, $rootScope){
	$scope.utils = utils;
	var modules = {};
	
	$scope.exists = function(p, ind){
		return typeof p[ind] != "undefined"
	}

	$scope.bootstrap = function(){
		$scope.showObservationMeta = [];
		$scope.mostRecentObservation = [];

		utils.storage.consultancy = {
		};

		if (typeof utils.storage.consultancy.symptoms == "undefined"){
			modules.globals.symptoms.storeAllSymptomsPersistently();
		}

		if (typeof utils.storage.consultancy.labtests == "undefined"){
			modules.globals.labTests.storeAllLabTestsPersistently();
		}


		$scope.presentingComplaints.searchedSymptoms = {};

		// modules.examination.loadExaminationTypes();

		$scope.examination = {
			examinationTypes: []
		};

		// modules.labTests.testSearchAutoSuggestInit();
		// modules.labTests.loadImagingInvestigations();
		$scope.labTests.searchedTests = {};
		$scope.labTests.imagingTests = {};

		$scope.patient.profile = {};
		$scope.patient.allergies = {};
		$scope.patient.medicalHighlights = [];

		$scope.conclusion = {
			prescriptionList: [],
			diagnosis: {}
		}
	}

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
			if (typeof $('.tagsinput-typeahead').tagsinput('input') !== "undefined"){
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
			}
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
		loadComplaintTemplates: function(){
			var req = utils.serverRequest("/consultancy/complaint-template/view", "GET");
			req.then(function(response){
				$scope.presentingComplaints.complaintTemplates = response;
			}, function(error){
				utils.errorHandler(error);
			})
		},
		loadTemplateForComplaint: function(template){
			var req = utils.serverRequest("/consultancy/complaint-template/view-template-items?resourceId="+template, "GET");
			req.then(function(response){
				angular.forEach(response, function(value, key){
					modules.presentingComplaints.addSymptomToComplaintList(value.Item, value.Note);
				});
			}, function(error){
				utils.errorHandler(error);
			})
		},
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
			modules.presentingComplaints.addSymptomToComplaintList(query);
			// if (query != ""){
			// 	modules.globals.symptoms.search(query, successCallback, errorCallback);
			// }
			// else {
			// 	utils.notify("Invalid search request", "Please make sure you have not submitted an empty search field", "warning");
			// }
		},		
		catchSearchPress: function(e){
			if(e.which == 13){
				modules.presentingComplaints.performSymptomSearch();
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
				$("#presentingComplaints-symptomSearchQuery").val("");
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
		catchLoadProfileEnterPress: function(e){
			if (e.which == 13){
				modules.patient.loadPatientProfile();
			}
		},
		searchAutoSuggestInit: function(){
			$(".patient-search").typeahead({
	            hint: true,
	            highlight: true
	        },
	        {
	        	displayKey: 'patientuuid',
	        	source: function(query, process){
	        		modules.globals.patient.typeAheadSource(query, process);
	        	},
	        	templates: {
	        		suggestion: function(string){
        				return	"<div class='row'>"+
	        						"<div class='col-sm-2'>"+
	        							"<img class='img img-responsive' src='"+utils.loadImage(string.patientpicture)+"'/>"+
	        						"</div>"+
	        						"<div class='col-sm-10'>"+
	        						"<h5 class='text-bold'>"+string["first name"]+ " " + string["last name"]+"</h5>"+
	        						"<p>"+string["patientuuid"]+"</p>"+
	        						"<p class='text-muted'>"+string["patienttypename"]+", "+string["categoryname"]+"</p>"+
	        						"</div>"+
	        					"</div>"
	        		}
	        	}
	        })
		},
		loadPatientProfile: function(){
			var successCallback = function(response){
				$scope.bootstrap();
				var result = response.hits.hits;
				if (result.length != 1){
					// if (typeof $scope.patient != "undefined" && $scope.patient.isProfileReady == false){
					// 	$scope.patient.isProfileReady = true;
					// }
					utils.alert("Unable to load profile", "You have sent an ambiguous request to the server. Please refine your search query and try again. It is recommended to use an actual patient number for search.", "info");
				}
				else {
					$scope.patient.profile = result[0]["_source"];
					$scope.patientInfo = $scope.patient.profile;
					$scope.patient.isProfileReady = true;
					modules.allergies.loadPatientAllergies($scope.patient.profile.patientid);
					utils.notify("Profile loaded successfully", "", "info");
					modules.globals.loadAllSavedDiagnosis();
					$scope.patient.history.displayPage='profile';

					$scope.patient.loadMedicalHighlights();

					if (typeof $scope.patient.profile.auditflags !== "undefined" && $scope.patient.profile.auditflags.length > 0){
						var message = "";
						for (var i = 0; i < $scope.patient.profile.auditflags.length; i++) {
							var count = i+1;
							if (typeof $scope.patient.profile.auditflags[i].StatusNote != "undefined"){
								message += "\r\n"+count+". "+$scope.patient.profile.auditflags[i].StatusNote;
							}
						}
						utils.alert("This Profile Has Been Flagged", message, "warning");
					}

					var req = utils.serverRequest("/patients/patient-repository/view-most-recent-json-by-patient?resourceId="+$scope.patient.profile.patientid, 'GET');
					req.then(function(response){
						$scope.mostRecentObservation.push(response)
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
		},
		loadAdmissionHistory: function(){
			$scope.patient.history.displayPage = "admissionHistory";

			// var request = utils.serverRequest("/patients/patient-repository/view-by-patient?resourceId="+$scope.patient.profile.patientid, "GET");

			// request.then(function(response){
			// 	$scope.patient.history.repositories = response;				
			// }, function(error){
			// 	utils.errorHandler(error);
			// });
		},
		loadMedicalHighlights: function(){
			var request = utils.serverRequest("/patients/patient-medical-highlight/view?resourceId="+$scope.patient.profile.patientid, "GET");

			request.then(function(response){
				$scope.patient.medicalHighlights = response;			
			}, function(error){
				utils.errorHandler(error);
			});
		},
		loadPendingInvestigations: function(){
			var req = utils.serverRequest("/lab/patient/view?resourceId=0&patient="+$scope.patient.profile.patientid, "GET");

			req.then(function(response){
				$scope.patient.history.pendingInvestigations = response;
			}, function(error){
				utils.errorHandler(error);
			})
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
        diagnosisSuggestInit: function(){
        	$(".diagnosis-suggest").typeahead({
	            hint: true,
	            highlight: true
	        },
	        {
	        	source: function(query, process){
	        		utils.serverRequest('/consultancy/diagnosis-search/search?query='+query, "GET").then(function(response){
		    			var data = [];
		        		angular.forEach(response, function(value){
		        			data.push(value.DiagnosisTitle);
		        		})

		        		data = $.map(data, function (string) { return { value: string }; });
		        		process(data);
		    		}, function(error){
		    			utils.errorHandler(error);
		    		})
	        	}
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
	    			if (typeof response.hits != "undefined"){
		        		angular.forEach(response.hits.hits, function(value){
		        			value = value["_source"];
		        			data[value.id] = value;
		        		})
	    			}

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
	    			if (typeof response.hits != "undefined"){
		        		angular.forEach(response.hits.hits, function(value){
		        			value = value["_source"];
		        			data[value.id] = value;
		        		})
	    			}

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
	        			data.push(value["_source"]);
	        		})

	        		data = $.map(data, function (string) {
	        			return string; 
	        		});
	        		process(data);
	    		}, function(error){
	    			utils.errorHandler(error);
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
				staff: utils.userSession.getID(),
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
		loadAllSavedDiagnosis: function(){
			var patient = $scope.patient.profile.patientid;
			var errorCallback = function(error){
				utils.errorHandler(error);
			}
			utils.serverRequest("/consultancy/saved-diagnosis/view-all-saved-diagnosis?resourceId="+patient, "GET").then(function(response){
				if (response.length == 0){
					//continue;
				}
				else if (response.length == 1 && response[0].Consultant  == utils.userSession.getID()){
				}
				else {
					$scope.allSavedDiagnoses = response;
					$("#show-saved-diag-selector").modal("show");
				}
				
				modules.globals.loadSavedDiagnosis();
			}, errorCallback);
		},
		loadSavedDiagnosis: function(patient=0, consultant=0){
			var patient = (patient == 0) ? $scope.patient.profile.patientid : patient; 
			var consultant = (consultant == 0) ? utils.userSession.getID() : consultant;

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

					// modules.examination.loadExaminationTypes();
				}
			}

			var errorCallback = function(error){
				utils.errorHandler(error);
			}
			utils.serverRequest("/consultancy/saved-diagnosis/view?resourceId="+consultant+"&patient="+patient, "GET").then(successCallback, errorCallback);
		},
		showFlagNote: function(){
			$("#flag-note-modal").modal("show");
		},
		addProvisionalDiagnosis: function(){
			$("#provisional-diagnosis-modal").modal("show");
		},
		flagPatient: function(noteData){
			var patient = $scope.patient.profile.patientid;
			var note = noteData.message;
			var title = noteData.title;
			var category = noteData.category;
			var staff = utils.userSession.getID();

			if (category == 0){
				var req = utils.serverRequest("/audit/flags/flag-patient?resourceId="+patient+"&note="+note+"&staff="+staff, "GET");
				req.then(function(response){
					if (response){
						utils.notify("Operation Successful", "This patients profile has been flagged", "success");
						$("#flag-note-modal").modal("hide");
					}
					else {
						$("#flag-note-modal").modal("hide");
						utils.notify("An error occurred", "Unable to flag this profile possibly because patient has not been logged", "error");
					}
				}, function(error){
					utils.errorHandler(error);
				});
			}
			else if (category == 1){
				var req = utils.serverRequest("/patients/patient-medical-highlight/new", "POST", {
					patient:patient,
					title:title,
					message:note,
					staff:staff
				});
				req.then(function(response){
					if (response){
						$scope.patient.loadMedicalHighlights();
						utils.notify("Operation Successful", "This patients profile has been flagged", "success");
						$("#flag-note-modal").modal("hide");
					}
					else {
						$("#flag-note-modal").modal("hide");
						utils.notify("An error occurred", "Unable to flag this profile possibly because patient has not been logged", "error");
					}
				}, function(error){
					utils.errorHandler(error);
				});
			}
		},
		setProvisionalDiagnosis: function(){
			var diagnosis = $scope.provisionalDiagnosis;
			$("#conclusionTitle").val(diagnosis+" (PROVISIONAL DIAGNOSIS)");
			$scope.conclusion.diagnosis.title = $("#conclusionTitle").val();
			if (typeof $scope.conclusion.diagnosis.description == "undefined"){
				$scope.conclusion.diagnosis.description = "";
			}
			$scope.conclusion.diagnosis.description = $scope.conclusion.diagnosis.description+"\nPROVISIONAL DIAGNOSIS: "+diagnosis;
			$("#provisional-diagnosis-modal").modal("hide");
			$scope.provisionalDiagnosis = {};
		}
	}

	var bootstrap = function(){
		if (typeof utils.storage.currentPatientNumberDiagnosis != "undefined" && utils.storage.currentPatientNumberDiagnosis != null){
			$("#patient-patientSearchQuery").val(utils.storage.currentPatientNumberDiagnosis);
			modules.patient.loadPatientProfile();
		}

		$scope.globals = {
			today: function(){
				var date = new Date();
				return date.toDateString();
			},
			todayInIso: function(){
				var date = new Date();
				return date.toISOString().split('T')[0];
			},
			save: modules.globals.saveDiagnosis,
			submit: modules.globals.submitDiagnosis,
			registeredLabs: [],
			registeredInvestigationTypes: [],
			currentSavedDiagnosisID: 0,
			flag: modules.globals.showFlagNote,
			completeFlagging: modules.globals.flagPatient,
			addProvisionalDiagnosis: modules.globals.addProvisionalDiagnosis,
			setProvisionalDiagnosis: modules.globals.setProvisionalDiagnosis,
		};

		// modules.globals.loadRegisteredLabs();

		// $scope.$watch(function(){ if (typeof $scope.labTests !== "undefined"){ return $scope.labTests.sendVariables.lab;} }, function(nv){
		// 	modules.globals.loadRegisteredInvestigationTypes(nv);
		// })


		$scope.allergies = {
			newAllergy: {},
			saveNewAllergy: modules.allergies.saveNewAllergy
		};

		$scope.presentingComplaints = {
			symptomSearchQuery: "",
			complaintTemplates: [],
			performSymptomSearch: modules.presentingComplaints.performSymptomSearch,
			loadSymptom: modules.presentingComplaints.loadSymptom,
			complaints: [],
			addToList: modules.presentingComplaints.addSymptomToComplaintList,
			removeFromList: modules.presentingComplaints.removeSymptomFromComplaintList,
			catchSearchPress: modules.presentingComplaints.catchSearchPress,
			loadTemplateForComplaint: modules.presentingComplaints.loadTemplateForComplaint
		};

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

		$scope.patient = {
			catchLoadProfileEnterPress: modules.patient.catchLoadProfileEnterPress,
			loadPatientProfile: modules.patient.loadPatientProfile,
			loadMedicalHighlights: modules.patient.loadMedicalHighlights,
			isProfileReady: false,
			history: {
				displayPage: 'profile',
				loadRepositories: modules.patient.loadRepositories,
				loadPendingInvestigations: modules.patient.loadPendingInvestigations,
				loadAdmissionHistory: modules.patient.loadAdmissionHistory,
				repositories: {},
				pendingInvestigations: {},
				loadRepo: function(repo){
					$scope.patient.history.repositories.currentRepository = repo;
					$("#repository-items").modal("show");
				}
			}
		}

		// modules.allergies.loadAllergyTypes();
		// modules.allergies.populateSymptomsTagsInput();

		// $scope.$watch(function(){
		// 	return $scope.allergies.newAllergy.type;
		// }, function(newValue){
		// 	if (typeof newValue != "undefined"){
		// 		modules.allergies.loadAllergyTypeTriggers(newValue);				
		// 	}
		// });

		modules.presentingComplaints.symptomSearchAutoSuggestInit();
		modules.globals.diagnosisSuggestInit();

		$("#conclusionTitle").on("change", function(e){
			$scope.conclusion.diagnosis.title = $(this).val();
		});

		modules.patient.searchAutoSuggestInit();

		$scope.bootstrap();
	}();


	function dtAction(data, full, meta, type){
		selectButtonAction = "manage('select',"+data.StaffID+")";

		var dataOpts = "data-option-id = '"+data.StaffID+"' "+
					   "data-option-name = '"+data.StaffFullName+"' "+
					   "data-option-role = '"+data.StaffRole+"'";

		select = "<button class='btn btn-success bg-white no-border-radius selectBtn' ng-click=\""+selectButtonAction+"\""+dataOpts+" ><i class='fa fa-user-sm'></i> Select</button>";
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
			utils.notify("Patient Referred Successfully", $scope.referral.specialist.name+" has been notified about this referral", "success");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.toDateString = function(date){
		return (new Date(date)).toDateString()+", "+(new Date(date)).toLocaleTimeString();
	}

	$scope.newAppointment = {};
	$scope.saveAppointment = function(){
		$scope.newAppointment.patient = $scope.patient.profile.patientid;
		$scope.newAppointment.staff = utils.userSession.getID();

		var req = utils.serverRequest("/patients/patient-appointment/new", "POST", $scope.newAppointment);

		req.then(function(success){
			$("#new-appointment").modal("hide");
			$scope.newAppointment = {};
			utils.notify("Appointment Created Successfully", "Reminder broadcasting is in progress", "success");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.staffNames = {};
	function loadStaffName(staffId){
		if (typeof $scope.staffNames[staffId] == 'undefined'){
			$scope.staffNames[staffId] = staffId;
			utils.getStaffFullName(staffId).then(function(response){
				$scope.staffNames[staffId] = response.StaffFullName;
			}, function(error){
				$scope.staffNames[staffId] = staffId;
			})
		}
	}
	$scope.loadStaffName = loadStaffName;

	$scope.$on("addSentLabInvestigationsToList", function(e, data){
		angular.forEach(data, function(value){
			$scope.labTests.addToLabList(value);
		});
	})

	$scope.$on("addPrescriptionToList", function(e, data){
		$scope.conclusion.prescriptionList = data;
	});

	$scope.$on("examinationObservationConducted", function(e, data){
		var req = utils.serverRequest("/patients/patient-repository/view-most-recent-json-by-patient?resourceId="+$scope.patient.profile.patientid, 'GET');
		req.then(function(response){
			$scope.mostRecentObservation.push(response)
		}, function(error){
			utils.errorHandler(error);
		});
		// $scope.examination.examinationTypes.push(data);
	})

	$scope.$watch(function(){ return $scope.conclusion.diagnosis.title; }, function(nv, ov){
		$rootScope.$broadcast("currentDiagnosis", nv);
	})

	$scope.loadSavedDiagnosis = function(patient, consultant){
		$("#show-saved-diag-selector").modal("hide");
		modules.globals.loadSavedDiagnosis(patient, consultant);
	}

	$scope.admit = function(){
		var patient = $scope.patient.profile.patientuuid;
		$rootScope.$broadcast("prepareNewAdmission", patient);
		$("#_patient-admission-form").modal("show");	
	}

});