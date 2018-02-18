angular.module("EmmetBlue")

.controller('labPatientManagementController', function($scope, utils, $rootScope){
	$scope.loadImage = utils.loadImage;
	var actions = function (data, type, full, meta){
		var editButtonAction = "managePatient('edit', "+data.PatientLabNumber+")";
		var deleteButtonAction = "managePatient('delete', "+data.PatientLabNumber+")";
		var viewButtonAction = "managePatient('paymentRequest', "+data.PatientLabNumber+")";

		var dataOpt = "data-option-id='"+data.PatientLabNumber+"' data-option-name='"+data.FullName+"'";

		var editButton = "<button class='btn btn-default billing-type-btn' ng-click=\""+editButtonAction+"\" "+dataOpt+"><i class='icon-pencil5'></i> </button>";
		var deleteButton = "<button class='btn btn-default billing-type-btn' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"><i class='icon-bin'></i> </button>";
		var viewButton = "<button class='btn btn-xs btn-danger' ng-click=\""+viewButtonAction+"\" "+dataOpt+"><i class='icon-link'> </i> Generate Payment Request</button>";
		
		var buttons = "<div class='btn-group'>"+viewButton+"</button>";
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

        var url = '/lab/patient/view?resourceId=0&paginate&from='+start+'&size='+length;
		if (typeof data[5] !== "undefined" && data[5].value.value != ""){
			url += "&keywordsearch="+data[5].value.value;
		}

		var patients = utils.serverRequest(url, 'GET');
		patients.then(function(response){
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

	$scope.currentRequestsUris = {};

	$scope.dtColumns = [
		// utils.DT.columnBuilder.newColumn('PatientLabNumber').withTitle("Lab Number"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Lab Number").renderWith(function(data, full, meta){
			var admissionString = (data.PatientInfo.admissionStatus) ? "In-Patient" : "" ;
			var wardString = (data.PatientInfo.admissionStatus) ? data.PatientInfo.admissionStatus.WardName + " (" + data.PatientInfo.admissionStatus.WardSectionName + ")" : "" ;
			var html = "<td>"+
							"<div>"+
								"<div class=''><a href='#' class='text-default'>"+data.PatientLabNumber+"</a></div>"+
								"<div class='label label-danger text-size-small'>"+
									admissionString+
								"</div>"+
								"<div class='text-bold text-size-small'>"+
									wardString+
								"</div>"+
							"</div>"+
						"</td>";
			return html;
		}),
		utils.DT.columnBuilder.newColumn('LabName').withTitle("Required Lab"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient").renderWith(function(data, full, meta){
			var image = $scope.loadImage(data.PatientInfo.patientpicture);
			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
							"</div>"+
							"<div class='media-left'>"+
								"<div class=''><a href='#' class='text-default text-bold'>"+data.PatientInfo.patientfullname+"</a></div>"+
								"<div class='text-info text-size-small'>"+
									data.PatientInfo.patientuuid+
								"</div>"+
								"<div class='text-muted'>"+
									data.PatientInfo.patienttypename+", "+data.PatientInfo.categoryname+
								"</div>"+
							"</div>"+
						"</td>";
			return html;
		}),
		utils.DT.columnBuilder.newColumn('InvestigationTypeName').withTitle("Investigation Required"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Registration Date").renderWith(function(data, b, c){
			return (new Date(data.RegistrationDate)).toDateString()+ "<br/><span class='text-muted'>"+ (new Date(data.RegistrationDate)).toLocaleTimeString()+"</span>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Requested By").renderWith(function(data){
			var image = $scope.loadImage(data.RequestedByDetails.StaffPicture);
			var html = "<td>"+
							"<div class='media-left media-middle'>"+
								"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
							"</div>"+
							"<div class='media-left'>"+
								"<div class=''><a href='#' class='text-default text-bold'>"+data.RequestedByDetails.StaffFullName+"</a></div>"+
								"<div class='text-muted text-size-small'>"+
									"<span class='fa fa-clock-o border-blue position-left'></span>"+
									(new Date(data.DateRequested)).toLocaleDateString()+" "+(new Date(data.DateRequested)).toLocaleTimeString()+
								"</div>"+
							"</div>"+
						"</td>";
			return html;
		})
		// ,
		// utils.DT.columnBuilder.newColumn(null).withTitle("Associated Request").renderWith(function(data, a , b){
		// 	var image = data.ClinicalDiagnosis;

		// 	$scope.currentRequestsUris[data.RequestID] = image;

		// 	var btn = "<button class='btn btn-default' ng-click='loadRequestUri("+data.RequestID+")'> Load Request</button>";

		// 	return btn;
		// }),
	];

	$scope.loadRequestUri = function(id){
		$scope.currentRequestUri = $scope.currentRequestsUris[id];

		$("#request-uri").modal("show");
	}

	$scope.reloadPatientsTable = function(){
		$scope.dtInstance.reloadData();
	}

	$rootScope.$on("reloadLabPatients", function(){
		$scope.reloadPatientsTable();
	})

	$scope.managePatient = function(type, id){
		switch(type){
			case "paymentRequest":{
				// utils.storage.currentPaymentRequest = id;
				// $("#_payment_request").modal("show");
				break;
			}
		}
	}
});