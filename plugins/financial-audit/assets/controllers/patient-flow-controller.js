angular.module("EmmetBlue")

.controller("AuditPatientFlowController", function($scope, utils){
	$scope.loadImage = utils.loadImage;
	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
		var draw = data[0].value;
        var order = data[2].value;
        var start = data[3].value;
        var length = data[4].value;
        var search= data[5].value.value;

		var url = '/audit/unlock-log/view-unlocked?paginate&from='+start+'&size='+length+'&keywordsearch='+search+'&';
		var filter = $scope.requestFilter;
		var _filter = "";
		if (filter.type == 'date'){
			var dates = filter.value.split(" - ");
			_filter += 'filtertype=date&startdate='+dates[0]+'&enddate='+dates[1];
		}

		var requests = utils.serverRequest(url+_filter, 'GET');
		requests.then(function(response){
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
	.withDisplayLength(100)
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
		utils.DT.columnBuilder.newColumn(null).withTitle("").notSortable().renderWith(function(data, full, meta){
			switch(data.Status){
				case "1":{
					var html = "<i class='icon-checkmark3 text-success'></i>";
					break;
				}
				case "-1":{
					var html = "<i class='icon-flag3 text-danger-400'></i>";
					break;
				}
				default:{
					var html = "<span class='label text-grey-400 status-mark'></span>";
				}
			}
			
			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient").renderWith(function(data, full, meta){
			var image = $scope.loadImage(data.PatientInfo.patientpicture);
			var html = "<div class='media-left media-middle'>"+
							"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
						"</div>"+
						"<div class='media-left'>"+
							"<div class=''><a href='#' class='text-default text-bold'>"+data.PatientInfo.patientfullname+"</a></div>"+
							"<div class='text-muted text-size-small'>"+
								"<span class='status-mark border-blue position-left'></span>"+
								data.PatientInfo.patientuuid+
							"</div>"+
						"</div>";
			var _html = "";
			if (typeof data.PatientInfo["phone number"] !== "undefined" && data.PatientInfo["phone number"] !== null){
				_html = "<div><span class='position-left text-info'><i class='icon-mobile'></i>:</span> <span class='text-semibold'>"+data.PatientInfo["phone number"]+"</span></div>";
			}

			if (typeof data.PatientInfo["gender"] !== "undefined"){
				_html += "<span class='label bg-teal-800'>"+data.PatientInfo["gender"]+"</span>";
			}
			if (typeof data.PatientInfo["date of birth"] !== "undefined"){
				var age = utils.getAge(data.PatientInfo["date of birth"]);
				_html += "<span class='ml-10 label bg-teal-800'>"+age+" years old</span>";
			}
			// var html = "<div class=''><a href='#' class='text-default text-semibold'>"+data.PatientInfo["phone number"]+"</a></div>";
			if (typeof data.PatientInfo["email address"] !== "undefined" && data.PatientInfo["email address"] !== null){
				_html += "<div class='text-muted text-size-small'>"+
							"<span class='position-left'>"+data.PatientInfo["email address"]+"</span>"+
						"</div>";
			}

			if (typeof data.PatientInfo["home address"] !== "undefined" && data.PatientInfo["home address"] !== null){
				_html += "<div><span class='position-left text-info'>Addr:</span> <span class='text-semibold'>"+data.PatientInfo["home address"]+"</span></div>";
			}
			
			if (_html == ""){
				_html += "<span class='text-muted'>N/A</span>";
			}

			return html+"<br/>"+_html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient Type").renderWith(function(data, full, meta){
			var html = "<div class=''><a href='#' class='text-default text-bold'>"+data.PatientInfo.patienttypename+"</a></div>";
						
			html += 	"<div class='text-muted text-size-small'>"+
							"<span class='position-left'>"+data.PatientInfo.categoryname+"</span>"+
						"</div>";

			if (typeof data.PatientInfo["hmo number"] !== "undefined"){
				html += "<div><span class='position-left text-info'>HMO #:</span> <span class='text-semibold'>"+data.PatientInfo["hmo number"]+"</span></div>";
			}

			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Date Logged").renderWith(function(data, full, meta){
			var html = (new Date(data.DateLogged)).toDateString();
						
			html += 	"<div class='text-muted text-size-small'>"+
							"<span class='position-left'>"+(new Date(data.DateLogged)).toLocaleTimeString()+"</span>"+
						"</div>";
			
			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Status").renderWith(function(data, full, meta){
			switch(data.Status){
				case "1":{
					var image = $scope.loadImage(data.StatusStaffPicture);
					var html = "<td>"+
									"<div class='media-left media-middle'>"+
										"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
									"</div>"+
									"<div class='media-left'>"+
										"<div class=''><span class='label bg-success-400'>Closed</span></div>"+
										"<div class='text-muted text-size-small'>"+
											"<span class='fa fa-user border-success position-left'></span>"+
											data.StatusStaffFullName+
										"</div>"+
									"</div>"+
								"</td>";
					break;
				}
				case "-1":{
					var image = $scope.loadImage(data.StatusStaffPicture);
					var note = "";
					if(typeof data.StatusNote !== "undefined" && data.StatusNote != "" && data.StatusNote != null){
						note = "<p class='text-danger'><i class='fa fa-quote-left position-left'></i>"+data.StatusNote+"</p>"
					}
					else {
						note = "<p class='text-muted text-center text-danger'><br/><small>No Flag Note</small></p>"
					}
					var html = "<td>"+
									"<div class='media-left media-middle'>"+
										"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
									"</div>"+
									"<div class='media-left'>"+
										"<div class=''><span class='label bg-danger-400'>Flagged</span></div>"+
										"<div class='text-muted text-size-small'>"+
											"<span class='fa fa-user border-danger position-left'></span>"+
											data.StatusStaffFullName+
										"</div>"+
									"</div>"+
									note+
								"</td>";
					break;
				}
				default:{
					var html = "<td>"+
									"<div class='media-left media-middle'>"+
										"<a href='#' class='btn bg-grey-400 btn-rounded btn-icon btn-xs'><span class='letter-icon'>?</span></a>"+
									"</div>"+
									"<div class='media-left'>"+
										"<div class=''><span class='label bg-grey-400'>Pending</span></div>"+
										"<div class='text-muted text-size-small'>"+
											"<span class='status-mark border-grey position-left'></span>"+
											"Awaiting Review"+
										"</div>"+
									"</div>"+
								"</td>";
				}
			}
			
			return html;
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(function(data, full, meta){
			var html = "<ul class='icons-list'>"+
								"<li class='dropdown'>"+
									"<a href='#' class='dropdown-toggle' data-toggle='dropdown'><i class='icon-menu7'></i></a>"+
									"<ul class='dropdown-menu dropdown-menu-right'>"+
										"<li><a href='#' ng-click='loadMedicalLog("+data.PatientInfo.patientid+")'><i class='icon-file-locked'></i> View medical log</a></li>"+
										"<li><a href='#' ng-click='loadDepartmentalLog("+data.PatientInfo.patientid+")'><i class='icon-file-text2'></i> View departmental requests</a></li>"+
										"<li><a href='#' ng-click='loadInvoiceLog("+data.PatientInfo.patientid+")'><i class='icon-file-stats'></i> View payment requests &amp; Invoices</a></li>"+
										"<li class='divider'></li>"+
										"<li><a href='#' ng-click='setStatus("+data.LogID+", true)'><i class='text-success icon-check'></i> Close Log</a></li>"+
										"<li><a href='#' ng-click='enableFlagNote("+data.LogID+")'><i class='text-danger fa fa-flag'></i> Flag This Log</a></li>"+
									"</ul>"+
								"</li>"+
							"</ul>";
			return html;
		})
	];

	$scope.currentLog = {};

	$scope.reloadTable = function(){
		$scope.dtInstance.rerender();
	}

	$scope.setStatus = function(id, close, text=""){
		$("#flag-note-modal").modal("hide");
		var data = {
			resourceId: id,
			staff: utils.userSession.getID()
		};
		if (close){
			data.status = 1;
		}
		else {
			data.status = -1;
			data.statusNote = text;
		}

		var req = utils.serverRequest("/audit/unlock-log/set-status", "PUT", data);
		req.then(function(response){
			$scope.reloadTable();
			utils.notify("Operation Successful", "The selected status has been applied successfully", "success");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.enableFlagNote = function(id){
		$scope.currentLogID = id;
		$("#flag-note-modal").modal("show");
	}

	$scope.loadMedicalLog = function(patient){
		$scope.currentLog = {};
		var dates = $scope.requestFilter.value.split(" - ");
		var _filter = 'filtertype=date&startdate='+dates[0]+'&enddate='+dates[1]+'&patient='+patient;

		var req = utils.serverRequest("/audit/unlock-log/get-medical-log?"+_filter, "GET");
		req.then(function(response){
			$scope.currentLog.diagnosis = response;
			$("#medical-log-modal").modal("show");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.loadDepartmentalLog = function(patient){
		$scope.currentLog = {};
		var dates = $scope.requestFilter.value.split(" - ");
		var _filter = 'filtertype=date&startdate='+dates[0]+'&enddate='+dates[1]+'&patient='+patient;

		var req = utils.serverRequest("/audit/unlock-log/get-departmental-log?"+_filter, "GET");
		req.then(function(response){
			$scope.currentLog.departmental = response;
			$("#departmental-log-modal").modal("show");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.loadInvoiceLog = function(patient){
		$scope.currentLog = {};
		var dates = $scope.requestFilter.value.split(" - ");
		var url = "/accounts-biller/transaction-meta/view?resourceId=0&";
		var _filter = "filtertype=patient-date&startdate="+dates[0]+"&enddate="+dates[1]+"&query="+patient+"&from=1&to=100";

		var req = utils.serverRequest(url+_filter, "GET");
		req.then(function(response){
			$scope.currentLog.invoices = response;
			$("#invoices-log-modal").modal("show");
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.loadDiagnosisInfo = function(diagnosisId){
		var req = utils.serverRequest("/patients/patient-diagnosis/view-by-id?resourceId="+diagnosisId, "GET");
		req.then(function(response){
			$scope.currentLog.diagnosisInfo = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}

	var date = (new Date()).toLocaleDateString();
	$scope.dateRange = date+" - "+date;

	$scope.requestFilter = {
		type: "date",
		value: $scope.dateRange
	}

	$scope.$watch("dateRange", function(nv){
		if (typeof nv !== "undefined"){
			$scope.requestFilter.value = nv;
			$scope.reloadTable();
		}
	})

	$scope.toDateString = function(date){
		return new Date(date).toDateString();
	}

	$scope.getTime = function(date){
		return new Date(date).toLocaleTimeString();
	}

	$scope.exists = function(p, ind){
		return typeof p[ind] != "undefined"
	}

})