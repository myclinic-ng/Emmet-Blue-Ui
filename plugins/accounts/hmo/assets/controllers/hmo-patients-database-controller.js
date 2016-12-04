angular.module("EmmetBlue")

.controller("accountsHMOPatientsDatabaseController", function($scope, utils){
	$scope.patientTypes = {};
	$scope.loadImage = utils.loadImage;
	$scope.loadPatientTypes = function(){
		var requestData = utils.serverRequest("/accounts-biller/department-patient-types-report-link/view-by-staff?resourceId="+utils.userSession.getID(), "GET");
		requestData.then(function(response){
			$scope.patientTypes = response;
		}, function(responseObject){
			utils.errorHandler(responseObject);
		});
	}

	$scope.loadPatientTypes();

	function tableAction(data, type, full, meta){
		var verifyButtonAction = "manageField('verify', "+data.patientid+")";
		var deleteButtonAction = "manageField('delete', "+data.patientid+")";

		var dataOpt = "data-option-id='"+data.patientid+"' data-option-uuid='"+data.patientuuid+"'";

		var verifyButton = "<button class='btn btn-danger btn-hmo-profile' ng-click=\""+verifyButtonAction+"\" "+dataOpt+"> <i class='fa fa-eyes'></i> View HMO Information</button>";
		var deleteButton = "<button class='btn btn-default btn-hmo-profile' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash'></i> Delete</button>";
		var viewButton = "<button class='btn btn-default btn-hmo-profile'> View</button>";

		var buttons = "<div class='btn-group'>"+verifyButton+"</button>";
		return buttons;
	}

	$scope.settingsDtInstance = {};
	$scope.settingsDtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var request = utils.serverRequest('/patients/patient/view-by-patient-type?resourceId='+$scope.currentPatientType, 'GET');
		return request;
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

	$scope.settingsDtColumns = [
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient Full Name").renderWith(function(data){
			var image = $scope.loadImage(data.patientpicture);
			var val ='<span class="pull-left"> <a href="#"> <img src="'+image+'" class="img-circle img" width="50" height="50" alt=""> </a> </span> '+data.patientfullname;
			return "<div class='media'>"+val+"</div>";
		}),
		utils.DT.columnBuilder.newColumn('patientuuid').withTitle("Patient Hospital Number"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(tableAction).notSortable()
	];

	$scope.reloadTable = function(){
		$scope.settingsDtInstance.reloadData();
	}

	$scope.$watch('currentPatientType', function(newValue, oldValue){
		if (typeof $scope.currentPatientType !== 'undefined'){
			$scope.reloadTable();
		}
	})

	$scope.manageField = function(manageGroup, id, isId=true){
		switch(manageGroup.toLowerCase()){
			case "verify":{
				if (isId){
					var req = utils.serverRequest("/accounts-biller/hmo-field-value/view-profile?resourceId="+id, "GET");
				}
				else {
					var req = utils.serverRequest("/accounts-biller/hmo-field-value/view-profile-by-uuid?resourceId=0&uuid="+id, "GET");
				}

				req.then(function(response){
					if (typeof response[0] == 'undefined'){
						utils.alert("HMO Profile Not Found", "Seems like this patient has not been registered into the HMO Database", "error");
					}
					else {
						$scope.currentHmoProfile = {
							document: response[0].PatientIdentificationDocument,
							profile: response[0].ProfileID
						}
						delete response[0].PatientIdentificationDocument;
						delete response[0].ProfileID;
						delete response[0].PatientID;
						$scope.currentHmoProfile.info = response[0];
				
						$("#hmoInfo").modal("show");
					}
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
});