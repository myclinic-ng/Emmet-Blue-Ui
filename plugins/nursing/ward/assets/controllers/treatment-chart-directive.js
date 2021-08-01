angular.module("EmmetBlue")

.directive("ngTreatmentChart", function(){
	return {
		restrict: 'AE',
		scope: {
			admissionId: '=admissionId',
			allowNew: '@allowNew'
		},
		templateUrl: "plugins/nursing/ward/assets/includes/treatment-chart-template.html",
		controller: function($scope, utils){
			$scope.treatmentChart = {};
			$scope.generalTreatment = {};
			$scope.administered = {};
			$scope.dtInstance = {};
			$scope.dateObject = utils.dateObject;

			$scope.loadImage = utils.loadImage;
			$scope.dateFilterList = [];

			$scope.selectedDate = utils.today();

			function loadDates(){
				const req = utils.serverRequest('/nursing/treatment-chart/view-dates?resourceId='+$scope.admissionId, 'GET');
				req.then(function(response){
					$scope.dateFilterList = response;
				}, function(error){
					utils.errorHandler(error);
				})
			}

			loadDates();

			$scope.msToTime = function(ms) {
				let seconds = (ms / 1000).toFixed(1);
				let minutes = (ms / (1000 * 60)).toFixed(1);
				let hours = (ms / (1000 * 60 * 60)).toFixed(1);
				let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
				if (seconds < 60) return seconds + " Sec";
				else if (minutes < 60) return minutes + " Min";
				else if (hours < 24) return hours + " Hrs";
				else return days + " Days"
			}

			$scope.dtOptions = utils.DT.optionsBuilder
			.fromFnPromise(function(){
				const start = $scope.selectedDate; 
				return utils.serverRequest('/nursing/treatment-chart/view?resourceId='+$scope.admissionId+"&startdate="+start+"&enddate="+start, 'GET');
				// return utils.serverRequest('/nursing/treatment-chart/view?resourceId='+$scope.admissionId, 'GET');
			})
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
		    });

		    if ($scope.allowNew == 'true'){
				$scope.dtOptions = $scope.dtOptions.withButtons([
					{
						text: '<i class="icon-file-plus"></i> Manage Plan',
						action: function(){
							$('#manage_plan').modal('show')
						}
					}
				]);	
		    }

			$scope.dtColumns = [
				utils.DT.columnBuilder.newColumn(null).withTitle("Status").renderWith(function(data){
					var html = "";
					if (typeof data.Status != "undefined" && typeof data.Status.Status != "undefined"){
						if (data.Status.Status == 1){
							html ="<span class='text-center text-success'><h1><i class='icon-check' style='font-size:1em'></i></h1></span>";
						}
					}
					else {
						var diff = new Date(data.Date) - new Date();
						if (diff > 0){
							html ="<span class=''><i class='fa fa-clock-o'></i></span><br/>"+
									"<span class='text-bold text-success'>"+$scope.msToTime(diff)+"</span>";	
						}
						else {
							html ="<span class=' text-warning'><i class='fa fa-warning text-center'></i></span><br/>"+
									"<span class='text-bold text-danger'>"+$scope.msToTime(Math.abs(diff))+"</span>";	
						}
					}

					return "<div class='text-center'>"+html+"</div>";
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Drug").renderWith(function(data, full, meta){
					return "<span class='text-bold'>"+data.Drug+"</span><br/><span class='text-size-small'>"+data.Note+"</span>";
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Dosage").renderWith(function(data, full, meta){
					return "<span class='text-semibold'>"+data.Dose+"</span><br/><span class='text-size-small'>"+data.Route+"</span>";
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Date").renderWith(function(data, full, meta){
					var _date = new Date(data.Date).toLocaleDateString();
					var _time = new Date(data.Date).toLocaleTimeString();

					return "<span>"+_date+"</span><br/><span class='text-bold'>"+_time+"</span>";
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Logged By").renderWith(function(data, full, meta){
					var image = $scope.loadImage(data.StaffDetails.StaffPicture);
					var date = (new Date(data.DateLogged)).toLocaleDateString();
					var val = "<div class='media'>"+
								"<div class='media-left'>"+
									"<a href='#'>"+
										"<img src='"+image+"' class='img-circle img-xs' alt=''>"+
									"</a>"+
								"</div>"+

								"<div class='media-body' style='width: auto !important;'>"+
									"<h6 class='media-heading'>"+data.StaffDetails.StaffFullName+"</h6>"+
									"<span class='text-muted'> "+date+"</span>"+
								"</div>"+
							"</div>";

					return "<div class='content-group'>"+val+"</div>";
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(function(data){
					var html = "";
					if (data.Deleted != 1){
						if (typeof data.Status != "undefined"){
							if (typeof data.Status.Status != "undefined" && data.Status.Status != 1){
								html = "<a href='#' class='btn btn-default bg-info text-white' ng-click='markAsAdministered("+data.TreatmentChartID+")'>Check</a>";
							}
							else if (typeof data.Status.Status == "undefined"){
								html = "<a href='#' class='btn btn-default bg-info text-white' ng-click='markAsAdministered("+data.TreatmentChartID+")'>Check</a>";
							}	
						}
					}

					return html;
				})
			];

			function reloadTable(){
				if (typeof $scope.dttInstance.reloadData == 'function'){
					$scope.dttInstance.reloadData();
				}
				if (typeof $scope.dtInstance.reloadData == 'function'){
					$scope.dtInstance.reloadData();
				}
			}

			$scope.$watch("admissionId", function(nv){
				loadDates();
				reloadTable();
			});

			$scope.setSelectedDate = function(date){
				$scope.selectedDate = utils.dateObject(date).toLocaleDateString();
				reloadTable();
			}

			// $scope.$watch("selectedDate", function(nv){
			// 	console.log(nv);
			// })
			
			$scope.treatmentItems = [];
			$scope.addToChart= function(){
				var chart = $scope.treatmentChart;
				$scope.treatmentItems.push(chart);
				$scope.treatmentChart = {};
			}
			$scope.removeItemFromChart = function(index){
				$scope.treatmentItems.splice(index, 1);
			}

			$scope.saveChart= function(){
				$scope.generalTreatment.items = $scope.treatmentItems;
				var chart = $scope.generalTreatment;
				chart.loggedBy = utils.userSession.getID();
				chart.admissionId = $scope.admissionId;
				chart.startDate = (new Date(chart.time)).toLocaleDateString() + " " + (new Date(chart.time)).toLocaleTimeString();

				var req = utils.serverRequest("/nursing/treatment-plan/new", "POST", chart);
				req.then(function(response){
					$("#new_item").modal("hide");
					utils.alert("Operation Successful", "Treatment plan saved successfully", "success");
					$scope.generalTreatment = {};
					reloadTable();
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.deleteTreatment = function(id){
				var staffId = utils.userSession.getID();
				var req = utils.serverRequest("/nursing/treatment-plan/delete?resourceId="+id+"&staffId="+staffId, "DELETE");
				req.then(function(response){
					utils.notify("Operation Successful", "Item Tagged Successfully", "success");
					reloadTable();
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.markAsAdministered = function(id){
				var staffId = utils.userSession.getID();
				$scope.administered = {
					associatedTime:'',
					associatedDate:'',
					note:'',
					staff:staffId,
					treatmentChartId:id
				};

				$("#mark_as_administered").modal("show");
				
			}

			$scope.saveAdministration = function(){
				var req = utils.serverRequest("/nursing/treatment-chart-status/new", "POST", [$scope.administered]);
				req.then(function(response){
					utils.notify("Operation Successful", "Status changed successfully", "success");
					reloadTable();
					$("#mark_as_administered").modal("hide");
				}, function(error){
					utils.errorHandler(error);
				})
			}


			$scope.dttInstance = {};

			$scope.dttOptions = utils.DT.optionsBuilder
			.fromFnPromise(function(){
				return utils.serverRequest('/nursing/treatment-plan/view?resourceId='+$scope.admissionId, 'GET');
			})
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
					text: '<i class="icon-file-plus"></i> Add Item to Plan',
					action: function(){
						$('#new_item').modal('show')
					}
				}
		    ]);

			$scope.dttColumns = [
				utils.DT.columnBuilder.newColumn(null).withTitle(" ").renderWith(function(data){
					var html = "";
					if (data.Deleted == 1){
						html ="<span class='text-center text-danger'><i class='fa fa-ban'></i></span>"
					}
					else {
						html ="<span class='text-center text-info'><i class='fa fa-check'></i></span>"
					}

					return html;
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Drug").renderWith(function(data, full, meta){
					return "<span class='text-bold'>"+data.Drug+"</span><br/><span class='text-size-small'>"+data.Note+"</span>";
				}),
				utils.DT.columnBuilder.newColumn('Dose').withTitle("Dosage"),
				utils.DT.columnBuilder.newColumn('Route').withTitle("Route"),
				utils.DT.columnBuilder.newColumn(null).withTitle("Frequency").renderWith(function(data, full, meta){
					var interval = 24 / data.HourlyInterval;
					var days = data.NumberOfDays;

					return "<span>"+interval+" times</span><br/><span>for "+days+" days</span>";
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Start Date").renderWith(function(data, full, meta){
					var _date = new Date(data.StartDate).toDateString();
					var _time = new Date(data.StartDate).toLocaleTimeString();

					return "<span>"+_date+"</span><br/><span class='text-bold'>"+_time+"</span>";
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Logged By").renderWith(function(data, full, meta){
					var image = $scope.loadImage(data.StaffDetails.StaffPicture);
					var date = (new Date(data.DateLogged)).toDateString()+", "+(new Date(data.DateLogged)).toLocaleTimeString();
					var val = "<div class='media'>"+
								"<div class='media-left'>"+
									"<a href='#'>"+
										"<img src='"+image+"' class='img-circle img-xs' alt=''>"+
									"</a>"+
								"</div>"+

								"<div class='media-body' style='width: auto !important;'>"+
									"<h6 class='media-heading'>"+data.StaffDetails.StaffFullName+"</h6>"+
									"<span class='text-muted'> "+date+"</span>"+
								"</div>"+
							"</div>";

					return "<div class='content-group'>"+val+"</div>";
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Status").renderWith(function(data, full, meta){
					val = "<p class='text-muted'>Active</p>";
					if (data.Deleted == 1){
						var image = $scope.loadImage(data.StaffDetails.StaffPicture);
						var date = (new Date(data.DateDeleted)).toDateString()+", "+(new Date(data.DateDeleted)).toLocaleTimeString();
						var val = "<span class='text-bold text-danger'>DISCONTINUED</span><div class='media'>"+
									"<div class='media-left'>"+
										"<a href='#'>"+
											"<img src='"+image+"' class='img-circle img-xs' alt=''>"+
										"</a>"+
									"</div>"+

									"<div class='media-body' style='width: auto !important;'>"+
										"<h6 class='media-heading'>"+data.StaffDetails.StaffFullName+"</h6>"+
										"<span class='text-muted'> "+date+"</span>"+
									"</div>"+
								"</div>";
					}

					return "<div class='content-group'>"+val+"</div>";
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(function(data){
					var html = "";
					if (data.Deleted != 1){
						html = "<a href='#' ng-click='deleteTreatment("+data.TreatmentPlanID+")'>Discontinue</a>";
					}

					return html;
				})
			];
		}
	}
})