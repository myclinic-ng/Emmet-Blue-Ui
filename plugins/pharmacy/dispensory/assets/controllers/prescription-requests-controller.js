angular.module("EmmetBlue")

.controller('pharmacyDispensationPrescriptionRequestsController', function($scope, utils, patientEventLogger){
	var actions = function (data, type, full, meta){
		var viewButtonAction = "manage('view', "+data.RequestID+")";
		
		var dataOpt = "data-option-id='"+data.RequestID+"' data-option-request='"+data.Request+"' data-option-patient='"+data.patientInfo.patientfullname+"'";

		var viewButton = "<button class='btn btn-danger pharmacy-ack-btn' ng-click=\""+viewButtonAction+"\" "+dataOpt+"><i class='icon-eye'></i> View Prescription</button>";
		
		var buttons = "<div class='btn-group'>"+viewButton+"</button>";
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
				$scope.currentRequest.Request = request;
				$scope.currentRequest.PatientName = patientname;

				console.log($scope.currentRequest);

				// utils.serverRequest("/read-resource", "POST", {data: request}).then(function(response){
				// 	$("#ack_modal").modal("show");
				// 	$scope.currentRequest.Request = response;
				// 	$scope.currentRequest.PatientName = patientname;
				// }, function(error){
				// 	utils.errorHandler(error);
				// });
				break;
			}
		}
	}
});