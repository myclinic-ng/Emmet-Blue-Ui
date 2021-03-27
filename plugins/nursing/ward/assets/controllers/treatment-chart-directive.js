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
			$scope.dtInstance = {};

			$scope.loadImage = utils.loadImage;

			$scope.dtOptions = utils.DT.optionsBuilder
			.fromFnPromise(function(){
				return utils.serverRequest('/nursing/treatment-chart/view?resourceId='+$scope.admissionId, 'GET');
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
						text: '<i class="icon-file-plus"></i> New Item',
						action: function(){
							$('#new_item').modal('show')
						}
					}
				]);	
		    }

			$scope.dtColumns = [
				utils.DT.columnBuilder.newColumn(null).withTitle("ID").renderWith(function(data){
					var html = "";
					if (data.Deleted == 1){
						html ="<span class='text-center text-danger'><i class='fa fa-ban'></i></span>"
					}
					else {
						html =data.TreatmentChartID;
					}

					return html;
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Drug").renderWith(function(data, full, meta){
					return "<span class='text-bold'>"+data.Drug+"</span><br/><span class='text-size-small'>"+data.Note+"</span>";
				}),
				utils.DT.columnBuilder.newColumn('Dose').withTitle("Dosage"),
				utils.DT.columnBuilder.newColumn('Route').withTitle("Route"),
				utils.DT.columnBuilder.newColumn(null).withTitle("Date").renderWith(function(data, full, meta){
					return new Date(data.Date).toLocaleDateString();
				}),
				utils.DT.columnBuilder.newColumn('Time').withTitle("Time"),
				utils.DT.columnBuilder.newColumn(null).withTitle("Logged By").renderWith(function(data, full, meta){
					var image = $scope.loadImage(data.NurseDetails.StaffPicture);
					var date = (new Date(data.DateLogged)).toDateString()+", "+(new Date(data.DateLogged)).toLocaleTimeString();
					var val = "<div class='media'>"+
								"<div class='media-left'>"+
									"<a href='#'>"+
										"<img src='"+image+"' class='img-circle img-xs' alt=''>"+
									"</a>"+
								"</div>"+

								"<div class='media-body' style='width: auto !important;'>"+
									"<h6 class='media-heading'>"+data.NurseDetails.StaffFullName+"</h6>"+
									"<span class='text-muted'> "+date+"</span>"+
								"</div>"+
							"</div>";

					return "<div class='content-group'>"+val+"</div>";
				}),
				utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(function(data){
					var html = "";
					if (data.Deleted != 1){
						html = "<a href='#' ng-click='deleteTreatment("+data.TreatmentChartID+")'>Deactivate</a>";
					}

					return html;
				})
			];

			function reloadTable(){
				if (typeof $scope.dtInstance.reloadData == 'function'){
					$scope.dtInstance.reloadData();
				}
			}

			$scope.$watch("admissionId", function(nv){
				reloadTable();
			});
			
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
				chart.nurse = utils.userSession.getID();
				chart.admissionId = $scope.admissionId;
				chart.associatedTime = (new Date(chart.time)).toLocaleTimeString();

				var req = utils.serverRequest("/nursing/treatment-chart/new", "POST", chart);
				req.then(function(response){
					$("#new_item").modal("hide");
					utils.alert("Operation Successful", "Treatment chart saved successfully", "success");
					$scope.generalTreatment = {};
					reloadTable();
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.deleteTreatment = function(id){
				var req = utils.serverRequest("/nursing/treatment-chart/delete?resourceId="+id, "DELETE");
				req.then(function(response){
					utils.notify("Operation Successful", "Item Tagged Successfully", "success");
					reloadTable();
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
})