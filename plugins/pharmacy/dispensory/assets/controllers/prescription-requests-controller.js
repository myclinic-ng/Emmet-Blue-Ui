angular.module("EmmetBlue")

.controller('pharmacyDispensationPrescriptionRequestsController', function($scope, utils, patientEventLogger, $rootScope){
	var actions = function (data, type, full, meta){
		var viewButtonAction = "manage('view', "+data.RequestID+")";
		var dispenseButtonAction = "manage('dispense', "+data.RequestID+")";
		
		var dataOpt = "data-option-id='"+data.RequestID+"' data-option-request='"+JSON.stringify(data.Request)+"' data-option-patient='"+data.patientInfo.patientfullname+"' data-option-patient-id='"+data.patientInfo.patientid+"' data-option-patient-uuid='"+data.patientInfo.patientuuid+"'";

		var viewButton = "<button class='btn btn-xs no-border pharmacy-ack-btn' ng-click=\""+viewButtonAction+"\" "+dataOpt+"><i class='icon-eye'></i> </button>";
		var dispenseButton = "<button class='btn btn-xs btn-danger no-border pharmacy-ack-btn' ng-click=\""+dispenseButtonAction+"\" "+dataOpt+"><i class='icon-check'></i></button>";
		
		var buttons = "<div class='btn-group'>"+viewButton+dispenseButton+"</button>";
		return buttons;
	}
	
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
		var draw = data[0].value;
        var order = data[2].value;
        var start = data[3].value;
        var length = data[4].value;

        var url = '/pharmacy/pharmacy-request/view?resourceId=0&paginate&from='+start+'&size='+length;
		if (typeof data[5] !== "undefined" && data[5].value.value != ""){
			url += "&keywordsearch="+data[5].value.value;
		}

		var dispensations = utils.serverRequest(url, 'GET');
		dispensations.then(function(response){
			var records = {
				data: response.data,
				draw: draw,
				recordsTotal: response.total,
				recordsFiltered: response.filtered
			};

			callback(records);
		}, function(error){
			utils.errorHandler(error);
		});
	})
	.withDataProp('data')
	.withOption('processing', true)
	.withOption('serverSide', true)
	.withOption('paging', true)
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
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient Number").renderWith(function(data){
			return "<span class='text-bold'>"+data.patientInfo.patientfullname+"</span> <br/>"+data.patientInfo.patientuuid+"";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient Type").renderWith(function(data){
			return data.patientInfo.patienttypename+" ("+data.patientInfo.categoryname+")";
		}),
		utils.DT.columnBuilder.newColumn('RequestedByFullName').withTitle("Dispensation Request Sent By"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Requested Date &amp; Time").renderWith(function(data, a, b){
			return (new Date(data.RequestDate)).toDateString()+" "+(new Date(data.RequestDate)).toLocaleTimeString();
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(actions).notSortable()
	];

	$scope.reloadDispensationsTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.$on("reloadRequests", function(){
		$scope.reloadDispensationsTable();
	})

	$scope.currentRequest = {};
	$scope.manage = function(event, id){
		switch(event){
			case "view":{
				var patientname = $(".pharmacy-ack-btn[data-option-id='"+id+"'").attr("data-option-patient");
				var request = $(".pharmacy-ack-btn[data-option-id='"+id+"'").attr("data-option-request");
				$("#ack_modal").modal("show");
				$scope.currentRequest.Request = $.parseJSON(request);
				$scope.currentRequest.PatientName = patientname;
				$scope.currentRequest.PatientID =  $(".pharmacy-ack-btn[data-option-id='"+id+"'").attr("data-option-patient-id");

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
				$scope.currentRequest.RequestID = id;
				$scope.currentRequest.PatientID =  $(".pharmacy-ack-btn[data-option-id='"+id+"'").attr("data-option-patient-id");

				utils.storage.patientNumberForDispensation = $(".pharmacy-ack-btn[data-option-id='"+id+"'").attr("data-option-patient-uuid");
				utils.storage.currentRequest = $scope.currentRequest;
				$rootScope.$broadcast("loadPatientNumberForDispensation");
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
		var request = utils.serverRequest("/accounts-biller/hmo-sales-verification/get-status?uuid="+id+"&staff="+utils.userSession.getID(), "GET");

		request.then(function(response){
			if (typeof response[0] !== "undefined" && typeof response[0].ProceedStatus !== "undefined" && response[0].ProceedStatus != false && response[0].ProceedStatus != null){
				utils.alert("Verification successful", "Proceed status confirmed", "success");
				if (response[0].SignComment !== null && response[0].SignComment !== ""){
					utils.notify("HMO Proceed Message", response[0].SignComment, "info");
				}
			}
			else if (typeof response[0] !== "undefined" && response[0].ProceedStatus == null){
				utils.notify("Request unconfirmed", "The specified request has not been processed, please refer patient to HMO", "info");
			}
			else{
				utils.alert("Verification Denied", "The specified request has been denied, please refer patient to HMO", "error");
				if (typeof response[0] !== "undefined" && response[0].SignComment !== null && response[0].SignComment !== ""){
					utils.notify("HMO Proceed Message", response[0].SignComment, "info");
				}
			}
			
			$("#verifyHmoProceed").modal("hide");
		}, function(error){
			utils.errorHandler(error);
		})
	}
});