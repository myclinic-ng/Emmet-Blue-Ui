angular.module("EmmetBlue")

.controller('pharmacyDispensationPrescriptionRequestsController', function($scope, utils, patientEventLogger){
	var actions = function (data, type, full, meta){
		var viewButtonAction = "manage('view', "+data.RequestID+")";
		var dispenseButtonAction = "manage('dispense', "+data.RequestID+")";

		console.log(JSON.stringify);
		
		var dataOpt = "data-option-id='"+data.RequestID+"' data-option-request='"+JSON.stringify(data.Request)+"' data-option-patient='"+data.patientInfo.patientfullname+"' data-option-patient-id='"+data.patientInfo.patientid+"'";

		var viewButton = "<button class='btn btn-info no-border pharmacy-ack-btn' ng-click=\""+viewButtonAction+"\" "+dataOpt+"><i class='icon-eye'></i> View </button>";
		var dispenseButton = "<button class='btn btn-danger no-border pharmacy-ack-btn' ng-click=\""+dispenseButtonAction+"\" "+dataOpt+">Dispense Items </button>";
		
		var buttons = "<div class='btn-group'>"+viewButton+dispenseButton+"</button>";
		return buttons;
	}
	
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var dispensations = utils.serverRequest('/pharmacy/pharmacy-request/view', 'GET');
		return dispensations;
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
	.withButtons([
		{
			text: '<i class="icon-printer"></i> <u>V</u>erify HMO Proceed Status',
			action: function(){
				$("#verifyHmoProceed").modal("show");
			},
			key: {
        		key: 'v',
        		ctrlKey: true,
        		altKey: true
        	}
		},
        {
        	extend: 'print',
        	text: '<i class="icon-printer"></i> <u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	}
        },
        {
        	extend: 'copy',
        	text: '<i class="icon-copy"></i> <u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: false,
        		altKey: true
        	}
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('patientInfo.patientuuid').withTitle("Patient Number"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient Type").renderWith(function(data){
			return data.patientInfo.patienttypename+" ("+data.patientInfo.categoryname+")";
		}),
		utils.DT.columnBuilder.newColumn('RequestedBy').withTitle("Dispensation Request Sent By"),
		utils.DT.columnBuilder.newColumn('RequestDate').withTitle("Requested Date &amp; Time"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(actions).notSortable()
	];

	$scope.reloadDispensationsTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.currentRequest = {};
	$scope.manage = function(event, id){
		switch(event){
			case "view":{
				var patientname = $(".pharmacy-ack-btn[data-option-id='"+id+"'").attr("data-option-patient");
				var request = $(".pharmacy-ack-btn[data-option-id='"+id+"'").attr("data-option-request");
				$("#ack_modal").modal("show");
				$scope.currentRequest.Request = $.parseJSON(request);
				$scope.currentRequest.PatientName = patientname;

				// utils.serverRequest("/read-resource", "POST", {data: request}).then(function(response){
				// 	$("#ack_modal").modal("show");
				// 	$scope.currentRequest.Request = response;
				// 	$scope.currentRequest.PatientName = patientname;
				// }, function(error){
				// 	utils.errorHandler(error);
				// });
				break;
			}
			case "dispense":{
				var patientname = $(".pharmacy-ack-btn[data-option-id='"+id+"'").attr("data-option-patient");
				var request = $(".pharmacy-ack-btn[data-option-id='"+id+"'").attr("data-option-request");
				$scope.currentRequest.Request = $.parseJSON(request);
				$scope.currentRequest.PatientName = patientname;
				$scope.currentRequest.PatientID =  $(".pharmacy-ack-btn[data-option-id='"+id+"'").attr("data-option-patient-id");

				$("#new_dispensation").modal({
					backdrop: "static"
				});
			}
		}
	}

	$scope.hmoVerifier = function(){
		var data = {
			items: $scope.currentRequest.Request,
			patient: $scope.currentRequest.PatientID,
			requestBy: utils.userSession.getID()
		};

		var req = utils.serverRequest("/accounts-biller/hmo-sales-verification/new", "POST", data);

		req.then(function(response){
			$("#ack_modal").modal("hide");
			utils.alert("Request Sent Successfully", "This patient's HMO has been notified successfully. Please refer him/her to their respective departments", "success");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.getHmoProceedStatus = function(id){
		var request = utils.serverRequest("/accounts-biller/hmo-sales-verification/get-status?uuid="+id+"&department=1", "GET");

		request.then(function(response){
			console.log(typeof response[0].ProceedStatus != "undefined", response[0].ProceedStatus != false, response[0].ProceedStatus);
			if (typeof response[0].ProceedStatus != "undefined" && response[0].ProceedStatus != false && response[0].ProceedStatus != null){
				utils.alert("Verification successful", "Proceed status confirmed", "success");
			}
			else if ( response[0].ProceedStatus == null){
				utils.alert("Request unconfirmed", "The specified request has not been processed, please refer patient to HMO", "warning");
			}
			else{
				utils.alert("Verification Denied", "The specified has been denied, please refer patient to HMO", "error");
			}
			
			$("#verifyHmoProceed").modal("hide");
		}, function(error){
			utils.errorHandler(error);
		})
	}
});