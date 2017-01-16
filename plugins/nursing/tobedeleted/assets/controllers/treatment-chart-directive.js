angular.module("EmmetBlue")

.directive("ngTreatmentChart", function(){
	return {
		restrict: 'AE',
		scope: {
			admissionId: '=admissionId',
			allowNew: '@allowNew'
		},
		templateUrl: "plugins/nursing/assets/includes/treatment-chart-template.html",
		controller: function($scope, utils){
			$scope.treatmentChart = {};
			$scope.dtInstance = {};

			$scope.dtOptions = utils.DT.optionsBuilder
			.fromFnPromise(function(){
				return utils.serverRequest('/nursing/treatment-chart/view?resourceId='+$scope.admissionId, 'GET');
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
				utils.DT.columnBuilder.newColumn('TreatmentChartID').withTitle("ID"),
				utils.DT.columnBuilder.newColumn('Drug').withTitle("Drug"),
				utils.DT.columnBuilder.newColumn('Dose').withTitle("Dose"),
				utils.DT.columnBuilder.newColumn('Route').withTitle("Route"),
				utils.DT.columnBuilder.newColumn('Time').withTitle("Time"),
				utils.DT.columnBuilder.newColumn('Note').withTitle("Comment"),
				utils.DT.columnBuilder.newColumn('Nurse').withTitle("Administered By"),
			];

			function reloadTable(){
				if (typeof $scope.dtInstance.reloadData == 'function'){
					$scope.dtInstance.reloadData();
				}
			}

			$scope.$watch("admissionId", function(nv){
				reloadTable();
			});
			
			$scope.saveChart= function(){
				var chart = $scope.treatmentChart;
				chart.nurse = utils.userSession.getID();
				chart.admissionId = $scope.admissionId;

				var req = utils.serverRequest("/nursing/treatment-chart/new", "POST", chart);
				req.then(function(response){
					$("#new_item").modal("hide");
					utils.alert("Operation Successful", "Treatment chart saved successfully", "success");
					reloadTable();
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
})