angular.module("EmmetBlue")

.directive('ngManagePatientRepo', function(){
	return {
		restrict: 'AE',
		scope: {
			currentPatient: '=currentPatient'
		},
		templateUrl: "plugins/records/patient/assets/includes/manage-patient-repository-template.html",
		controller: function($scope, utils, patientEventLogger){
			$scope.newRepository  = {};
			$scope.$on("reloadCurrentPatient", function(){
				$scope.dtInstance.reloadData()
			});
			$scope.dtInstance = {};
			$scope.dtOptions = utils.DT.optionsBuilder
			.fromFnPromise(function(){
				var billingTypes = utils.serverRequest('/patients/patient-repository/view-by-patient?resourceId='+$scope.currentPatient.id, 'GET');
				return billingTypes;
			})
			.withPaginationType('full_numbers')
			.withDisplayLength(10)
			.withOption('createdRow', function(row, data, dataIndex){
				utils.compile(angular.element(row).contents())($scope);
			})
			.withOption('headerCallback', function(header) {
		        if (!$scope.headerCompiled) {
		            $scope.headerCompiled = true;
		            utils.compile(angular.element(header).contents())($scope);
		        }
		    })
			.withButtons([
				{
					text: '<i class="icon-file-plus"></i> <u>N</u>ew Repository',
					action: function(){
						$("#new_repository").modal("show");
					},
					key: {
		        		key: 'n',
		        		ctrlKey: false,
		        		altKey: true
		        	}
				}
			]);	

			$scope.dtColumns = [
				utils.DT.columnBuilder.newColumn('RepositoryName').withTitle("Folder Name"),
				utils.DT.columnBuilder.newColumn('RepositoryDescription').withTitle("Description"),
				utils.DT.columnBuilder.newColumn('RepositoryCreator').withTitle("Author"),
				utils.DT.columnBuilder.newColumn('RepositoryCreationDate').withTitle("Date Created"),
				utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(function(data, type, full, meta){
					var button = "<button class='btn btn-info btn-clear' ng-click=\"loadRepo("+data.RepositoryID+")\"> view</button>";
					return button;
				}).withOption('width', '15%').notSortable()
			];

			$scope.submitNewRepository = function(){
				var newRepository = $scope.newRepository;
				newRepository.creator = utils.userSession.getID();
				newRepository.patient = $scope.currentPatient.id;

				var submitRequest = utils.serverRequest("/patients/patient-repository/new", "POST", newRepository);

				submitRequest.then(function(response){
					utils.alert("Operation successful", "New repository created successfully", "success");
					$("#new_repository").modal("hide");
					$scope.dtInstance.reloadData();
					var eventLog = patientEventLogger.records.newRepositoryCreatedEvent($scope.currentPatient.id, $scope.newRepository.name);
					eventLog.then(function(response){
						//patient registered event logged
					}, function(response){
						utils.errorHandler(response);
					});

				}, function(response){
					utils.errorHandler(response);
				})
			}

			$scope.loadRepo = function(repo){
				$scope.currentRepository = repo;
				$("#repository_items").modal("show");
				// utils.alert("Load", repo, "info");
			}
		}
	}
})

.controller("recordsPatientManageArchivesController", function($scope, utils, $rootScope){
	$scope.loadImage = utils.loadImage;
	$scope.searched = {};
	$scope.currentPatient = {
		nameTitle: "Patient",
		id: 0
	};

	$scope.search = function(){
		var query = $scope.searchQuery;

		var request = utils.serverRequest('/patients/patient/search?query='+query+'&size=50&from=0', "GET");

		request.then(function(response){
			$scope.searched.meta= response.hits;
			$scope.searched.patients = response.hits.hits;
		}, function(response){
			utils.errorHandler(response);
		})
	}

	$scope.loadPatient = function(patient){
		$scope.currentPatient.nameTitle = patient["_source"].patientfullname+"'s";
		$scope.currentPatient.picture = $scope.loadImage(patient["_source"].patientpicture);
		$scope.currentPatient.id = patient["_source"].patientid;

		$rootScope.$broadcast("reloadCurrentPatient");
	}
})