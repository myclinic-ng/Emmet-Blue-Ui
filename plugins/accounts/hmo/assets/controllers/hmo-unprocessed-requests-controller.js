angular.module("EmmetBlue")

.controller("accountsHMOUnprocessedRequestsController", function($scope, utils){
	$scope.patientTypes = {};
	$scope.loadImage = utils.loadImage;
	$scope.loadPatientTypes = function(){
		if (typeof (utils.userSession.getID()) !== "undefined"){
			var requestData = utils.serverRequest("/accounts-biller/department-patient-types-report-link/view-by-staff?resourceId="+utils.userSession.getID(), "GET");
			requestData.then(function(response){
				$scope.patientTypes = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			});
		}
	}
	$scope.currentPatientType = 0;

	$scope.loadPatientTypes();

	$scope.$watch('currentPatientType', function(newValue, oldValue){
		if (typeof $scope.currentPatientType !== 'undefined'){
			$scope.reloadTable();
		}
	})

	function tableAction(data, type, full, meta){
		var verifyButtonAction = "manageField('load', "+data.SalesID+")";
		// var deleteButtonAction = "manageField('delete', "+data.patientid+")";

		var dataOpt = "data-option-id='"+data.patientid+"' data-option-uuid='"+data.patientuuid+"'";

		var verifyButton = "<button class='btn btn-danger bg-white btn-hmo-profile' ng-click=\""+verifyButtonAction+"\" "+dataOpt+"> Load Request</button>";
		// var deleteButton = "<button class='btn btn-default btn-hmo-profile' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash'></i> Delete</button>";
		// var viewButton = "<button class='btn btn-default btn-hmo-profile'> View</button>";

		var buttons = "<div class='btn-group'>"+verifyButton+"</button>";
		return buttons;
	}

	$scope.settingsDtInstance = {};
	$scope.settingsDtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/hmo-sales-verification/load-unprocessed-requests?resourceId='+$scope.currentPatientType, 'GET');
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

	$scope.settingsDtColumns = [
		utils.DT.columnBuilder.newColumn("SalesID").withTitle("Request Number"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient").renderWith(function(data, full, meta){
			var image = $scope.loadImage(data.PatientInfo.patientpicture);
			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
							"</div>"+
							"<div class='media-left'>"+
								"<div class=''><a href='#' class='text-default text-bold'>"+data.PatientInfo.patientfullname+"</a></div>"+
								"<div class='text-muted text-size-small'>"+
									data.PatientInfo.patientuuid+
								"</div>"+
							"</div>"+
						"</td>";

			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("HMO No.").renderWith(function(data){
			var id = "N/A";
			if (typeof data.PatientInfo["hmo number"] !== "undefined"){
				id = data.PatientInfo["hmo number"]
			}

			return id;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Requesting Staff").renderWith(function(data){
			var image = $scope.loadImage(data.StaffDetails.StaffPicture);
			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
							"</div>"+
							"<div class='media-left'>"+
								data.StaffDetails.StaffFullName+
								"<div class='text-muted text-size-small'>"+
									data.DepartmentName+
								"</div>"+
							"</div>"+
						"</td>";
			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Request Date").renderWith(function(data, full, meta){
			var date = new Date(data.RequestDate);

			var val ='<span class="media-body">'+date.toDateString()+'</span><span class="text-muted">'+date.toLocaleTimeString()+'</span>';
			return "<div class='media'>"+val+"</div>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(tableAction).notSortable()
	];

	$scope.reloadTable = function(){
		$scope.settingsDtInstance.reloadData();
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

	$scope.signRequest = function(){
		$("#verificationRequestInfo").modal("hide");
		$("#verificationRequestInfoSigning").modal("show");
	}

	
	var initReqSigning = function(){
		$scope.signedRequest = {
			proceedStatus: 1
		};
	};

	initReqSigning();

	$scope.completeRequestVerification = function(){
		$scope.signedRequest.signedBy = utils.userSession.getID();
		$scope.signedRequest.request = $scope.currentRequest.SalesID;

		var data = $scope.signedRequest;
		var req = utils.serverRequest("/accounts-biller/hmo-sales-verification/verify-request", "POST", data);

		req.then(function(result){
			if (result){
				utils.notify("Operation Successful", "Request verification complete", "success");
				$("#verificationRequestInfoSigning").modal("hide");
				initReqSigning();
				$scope.reloadTable();
			}
			else {
				utils.alert("Unable to complete request", "An error has just occurred, please try again or contact an administrator if this error persist", "warning");
			}
		}, function(error){
			utils.errorHandler(error);
		})
	}
});