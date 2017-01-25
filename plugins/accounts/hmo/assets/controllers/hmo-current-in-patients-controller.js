angular.module("EmmetBlue")

.controller("accountsHMOCurrentInPatientsController", function($scope, utils){
	$scope.loadImage = utils.loadImage;

	function tableAction(data, type, full, meta){
		var verifyButtonAction = "manageField('load', "+data.SalesID+")";

		var dataOpt = "data-option-id='"+data.patientid+"' data-option-uuid='"+data.patientuuid+"'";

		var verifyButton = "<button class='btn btn-danger btn-labeled bg-white no-border-radius btn-hmo-profile' ng-click=\""+verifyButtonAction+"\" "+dataOpt+"> <b><i class='icon-user-block'></i></b> Load Request</button>";
		
		var buttons = "<div class='btn-group'>"+verifyButton+"</button>";
		return buttons;
	}

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/hmo-in-patients/view?resourceId='+utils.userSession.getID(), 'GET');
		return request;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(50)
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
		utils.DT.columnBuilder.newColumn("PatientAdmissionID").withTitle("Admission Reference No."),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient").renderWith(function(data){
			var image = $scope.loadImage(data.PatientInformation.patientpicture);
			var val = "<div class='media'>"+
						"<div class='media-left'>"+
							"<a href='#'>"+
								"<img src='"+image+"' class='img-circle img-lg' alt=''>"+
							"</a>"+
						"</div>"+

						"<div class='media-body' style='width: auto !important;'>"+
							"<h6 class='media-heading'>"+data.PatientInformation.patientfullname+"</h6>"+
							"<span class='text-muted'> "+data.PatientInformation.patienttypename+", "+data.PatientInformation.categoryname+"</span>"+
						"</div>"+
					"</div>";

			return "<div class='content-group'>"+val+"</div>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Admission Date").renderWith(function(data, x, y){
			return "<p title='"+data.AdmissionDate+"'>"+new Date(data.AdmissionDate).toDateString()+"</p>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Ward").renderWith(function(data){
			var val = data.WardName+"<span>";

			val += "&nbsp;<span class='label label-info mb-5'> "+data.WardSectionName+"</span>"
			if (data.ReceivedInWard == 0){
				val += "<span class='label label-danger display-block text-muted' title='The selected ward has not admitted the patient yet'> Admission In Progress</span>"
			}
			else if (data.ReceivedInWard == 1){
				val += "<span class='label label-success display-block text-muted' title='The patient has been assigned a bed'> Admission process completed</span>"
			}

			return val+"</span>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(tableAction).notSortable()
	];

	$scope.reloadTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.manageField = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "load":{
				var req = utils.serverRequest("/accounts-biller/hmo-sales-verification/view?resourceId="+id, "GET");

				req.then(function(response){
					if (typeof response[0] == 'undefined'){
						utils.notify("Unable to load Request", "", "error");
					}
					else {
						$scope.currentRequest = response[0];
				
						$("#verificationRequestInfo").modal("show");
					}
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
});