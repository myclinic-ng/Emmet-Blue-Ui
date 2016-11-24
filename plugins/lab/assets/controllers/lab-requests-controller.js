angular.module("EmmetBlue")

.controller('labRequestsController', function($scope, utils){
	var actions = function (data, type, full, meta){
		var deleteButtonAction = "manage('process', "+data.RequestID+")";

		var dataOpt = "data-option-id='"+data.RequestID+"'"+
					  "data-option-patient-uuid='"+data.PatientUUID+"'"+
					  "data-option-lab-id='"+data.LabID+"'"+
					  "data-option-investigation-required='"+data.InvestigationRequired+"'"+
					  "data-option-clinical-diagnosis='"+data.ClinicalDiagnosis+"'"+
					  "data-option-requested-by='"+data.RequestedBy+"'"+
					  "data-option-request-date='"+data.RequestDate+"'";


		var deleteButton = "<button class='btn btn-default process-btn btn-danger' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"><i class='icon-link'></i> Generate Lab Number</button>";
		
		var buttons = "<div class='btn-group'>"+deleteButton+"</button>";
		return buttons;
	}
	
	$scope.currentLab = 0;
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var investigationTypes = utils.serverRequest('/lab/lab-request/view?resourceId='+$scope.currentLab, 'GET');
		return investigationTypes;
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
		utils.DT.columnBuilder.newColumn('PatientFullName').withTitle("Patient"),
		utils.DT.columnBuilder.newColumn('InvestigationRequired').withTitle("Investigation Required"),
		utils.DT.columnBuilder.newColumn('InvestigationTypeName').withTitle("Investigation Type Name"),
		utils.DT.columnBuilder.newColumn('RequestedBy').withTitle("Requested By"),
		utils.DT.columnBuilder.newColumn('RequestDate').withTitle("Date Requested"),
		utils.DT.columnBuilder.newColumn('ClinicalDiagnosis').withTitle("Clinical Diagnosis"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Process").renderWith(actions).notSortable()
	];

	$scope.reloadInvestigationTypesTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.manage = function(type, id){
		switch(type){
			case "process":{
				var data = {
					investigationId: id,
					patientUuid: $(".process-btn[data-option-id='"+id+"']").attr("data-option-patient-uuid"),
					labId: $(".process-btn[data-option-id='"+id+"']").attr("data-option-lab-id"),
					clinicalDiagnosis: $(".process-btn[data-option-id='"+id+"']").attr("data-option-clinical-diagnosis"),
					investigationRequired: $(".process-btn[data-option-id='"+id+"']").attr("data-option-investigation-required")
				}

				utils.storage.processedNewPatient = data;

				$("#_new_patient").modal("show");	
			}
		}
	}

	$scope.saveNewInvestigationType = function(){
		var investigationType = $scope.newInvestigationType;

		var request = utils.serverRequest("/lab/investigation-type/new", "POST", investigationType);
		request.then(function(response){
			utils.notify("Operation Successful", "New Investigation Type created successfully", "success");
			$scope.reloadInvestigationTypesTable();
			$("#new_investigation_type").modal("hide");
			$scope.newInvestigationType = {};
		}, function(response){
			utils.errorHandler(response);
		})
	}

	$scope.saveEditedInvestigationType = function(){
		var investigationType = $scope.tempInvestigationType;

		var request = utils.serverRequest("/lab/investigation-type/edit", "PUT", investigationType);
		request.then(function(response){
			utils.notify("Operation Successful", "New Investigation Type updated successfully", "success");
			$scope.reloadInvestigationTypesTable();
			$("#edit_investigation_type").modal("hide");
			$scope.tempInvestigationType = {};
		}, function(response){
			utils.errorHandler(response);
		})
	}

	function loadLabs(){
		utils.serverRequest('/lab/lab/view', 'GET').then(function(response){
			$scope.labs = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	loadLabs();
});