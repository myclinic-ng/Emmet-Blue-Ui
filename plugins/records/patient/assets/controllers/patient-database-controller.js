angular.module("EmmetBlue")

.controller('recordsPatientDatabaseController', function($scope, utils, $rootScope){
	$scope.loadImage = utils.loadImage;
	
	$scope.getDateRange = function(selector){
		var today = new Date();
		switch(selector){
			case "today":{
				return today.toLocaleDateString() + " - " + today.toLocaleDateString();
			}
			case "yesterday":{
				var yesterday = new Date(new Date(new Date()).setDate(new Date().getDate() - 1)).toLocaleDateString();
				return yesterday + " - " + yesterday;
				break;
			}
			case "week":{
				var d = new Date(today);
			  	var day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1);

			  	return new Date(d.setDate(diff)).toLocaleDateString() + " - " + today.toLocaleDateString();
			  	break;
			}
			case "month":{
				var year = today.getFullYear();
				var month = today.getMonth() + 1;

				return month+'/1/'+year + ' - ' + today.toLocaleDateString();
				break;
			}
		}
	}

	$scope.requestFilter = {
		type: 'date',
		description: 'Patients Registered Today',
		value: $scope.getDateRange("today")
	}

	$("option[status='disabled']").attr("disabled", "disabled");

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.newOptions()
	.withFnServerData(function(source, data, callback, settings){
		var filter = $scope.requestFilter;
		var _filter = "";
		if (filter.type == 'date'){
			var dates = filter.value.split(" - ");
			_filter += 'startdate='+dates[0]+'&enddate='+dates[1];
		}

		$scope.currentRequestsFilter = _filter;
		var draw = data[0].value;
        var order = data[2].value;
        var start = data[3].value;
        var length = data[4].value;


        var url = '/patients/patient/view-by-registration?'+_filter+'&paginate&from='+start+'&size='+length;
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
		utils.DT.columnBuilder.newColumn('PatientID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient").renderWith(function(data, full, meta){
			if (typeof data.PatientInfo !== "undefined"){
				var image = $scope.loadImage(data.PatientInfo.patientpicture);
				var html = "<td>"+
								"<div class='media-left media-middle'>"+
									"<a href='#'><img src='"+image+"' class='img-circle img-xs' alt=''></a>"+
								"</div>"+
								"<div class='media-left'>"+
									"<div class=''><a href='#' class='text-default text-bold'>"+data.PatientInfo.patientfullname+"</a></div>"+
									"<div class='text-muted text-size-small'>"+
										"<span class='status-mark border-blue position-left'></span>"+
										data.PatientInfo.patientuuid+
									"</div>"+
								"</div>"+
							"</td>";
				return html;
			}
			else {
				return '<em>N/A</em>';
			}
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Patient Type").renderWith(function(data, b, c){
			if (typeof data.PatientInfo !== "undefined"){
				return "<div class='text-bold'>"+
							data.PatientInfo.patienttypename+"<br/><span class='text-info'>"+data.PatientInfo.categoryname+"</span>"+
						"</div>";
			}
			else {
				return '<em>N/A</em>';
			}
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Old Hospital Number").renderWith(function(data, b, c){
			if (typeof data.PatientInfo !== "undefined"){
				return "<div class='text-semibold'>"+
						data.PatientInfo["medical hand card number"];
					"</div>";
			}
			else {
				return '<em>N/A</em>';
			}
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Occupation").renderWith(function(data, b, c){
			if (typeof data.PatientInfo !== "undefined"){
				return "<div class='text-semibold'>"+
						data.PatientInfo["occupation"];
					"</div>";
			}
			else {
				return '<em>N/A</em>';
			}
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Gender").renderWith(function(data, b, c){
			if (typeof data.PatientInfo !== "undefined"){
				return "<div class='text-semibold'>"+
						data.PatientInfo["gender"];
					"</div>";
			}
			else {
				return '<em>N/A</em>';
			}
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Emergency Contact").renderWith(function(data, b, c){
			if (typeof data.PatientInfo !== "undefined"){
				return "<div class='text-semibold'>"+
						"<b>"+data.PatientInfo["reference contact, emergency"]+"</b><br/>"+
						"<span class='text-small'>"+data.PatientInfo["next of kin"]+"</span><br/>"+
					"</div>";
			}
			else {
				return '<em>N/A</em>';
			}
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Registration Date").renderWith(function(data, b, c){
			return (new Date(data.LastModified)).toDateString()+ "<br/><span class='text-muted'>"+ (new Date(data.LastModified)).toLocaleTimeString()+"</span>";
		})
	];


	$scope.reloadDispensationsTable = function(){
		$scope.dtInstance.rerender();
	}

	
	$scope.activateFilter = function(){
		var selector = $scope.filterSelector;
		switch(selector.type){
			case "status":{
				if (selector.value !== null){
				$scope.requestFilter.type = "status";
					var value = selector.value.split("<seprator>");
					$scope.requestFilter.value = value[1];
					$scope.requestFilter.description = "Status: "+value[0];
					$scope.reloadDispensationsTable();
				}
				break;
			}
			case "dateRange":{
				$scope.requestFilter.type = "date";
				var value = selector.value.split(" - ");
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Date Ranges Between: "+ new Date(value[0]).toDateString()+" And "+ new Date(value[1]).toDateString();
				$scope.reloadDispensationsTable();
				break;
			}
			case "patient":{
				$scope.requestFilter.type = "patient";
				$scope.requestFilter.value= selector.value;
				$scope.requestFilter.description = "Patient Search: '"+selector.value+"'";
				$scope.reloadDispensationsTable();
				break;
			}
			case "staff":{
				$scope.requestFilter.type = "staff";
				$scope.requestFilter.value= selector.value;
				if (typeof selector.date !== "undefined" && selector.date !== ""){
					$scope.requestFilter.date= selector.date;	
				}
				else {
					$scope.requestFilter.date = (new Date()).toLocaleDateString();
				}

				$scope.requestFilter.description = "Staff Search: '"+selector.value+"'";

				var req = utils.serverRequest("/human-resources/staff/get-staff-id?name="+selector.value, "GET");
				req.then(function(result){
					if (typeof result["StaffID"] !== "undefined"){
						$scope.requestFilter.staff = result["StaffID"];
						$scope.reloadDispensationsTable();
					}
				})
				break;
			}
			case "patienttype":{
				$scope.requestFilter.type = "patienttype";
				var value = selector.value.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = "Patient Type: '"+value[0]+"'";
				$scope.reloadDispensationsTable();
				break;
			}
			default:{
				$scope.requestFilter.type = "date";
				var value = selector.type.split("<seprator>");
				$scope.requestFilter.value = value[1];
				$scope.requestFilter.description = value[0];
				$scope.reloadDispensationsTable();
			}
		}
	}
});