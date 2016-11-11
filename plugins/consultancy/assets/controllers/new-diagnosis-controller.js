angular.module("EmmetBlue")

.controller("consultancyNewDiagnosisController", function($scope, utils){
	var modules = {};

	modules.allergies = {
		loadAllergyTypes: function(){
			utils.serverRequest("/consultancy/allergy/view", "GET").then(function(response){
				$scope.allergies.allergyTypes = response;
			}, function(error){
				utils.errorHandler(error);
			});
		},
		loadAllergyTypeTriggers: function(allergyID){
			utils.serverRequest("/consultancy/allergy-trigger/view-by-allergy?resourceId="+allergyID, "GET").then(function(response){
				$scope.allergies.allergyTypeTriggers = response;
			}, function(error){
				utils.errorHandler(error);
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
				$scope.presentingComplaints.searchedSymptoms = response.hits.hits;
			}

			var errorCallback = function(error){
				utils.errorHandler(error);
			}

			var query = $("#presentingComplaints-symptomSearchQuery").val();
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

	modules.globals = {
		symptoms: {
			search: function(query, successCallback, errorCallback){
				utils.serverRequest('/consultancy/infermedica/search-symptoms?phrase='+query, 'GET')
				.then(function(response){
            		successCallback(response);
            	}, function(error){
            		errorCallback(error);
            	})
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
		}
	}

	var bootstrap = function(){
		utils.storage.consultancy = {
		};

		if (typeof utils.storage.consultancy.symptoms == "undefined"){
			modules.globals.symptoms.storeAllSymptomsPersistently();
		}

		$scope.allergies = {
			newAllergy: {}
		};

		modules.allergies.loadAllergyTypes();
		modules.allergies.populateSymptomsTagsInput();

		$scope.$watch(function(){
			return $scope.allergies.newAllergy.allergyType;
		}, function(newValue){
			modules.allergies.loadAllergyTypeTriggers(newValue);
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
	}


	bootstrap();
});