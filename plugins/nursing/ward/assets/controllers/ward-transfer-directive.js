angular.module("EmmetBlue")

.directive("ngWardTransfer", function(){
	return {
		restrict: 'AE',
		scope: {
			admissionId: '=admissionId',
			allowNew: '@allowNew'
		},
		templateUrl: "plugins/nursing/ward/assets/includes/ward-transfer-template.html",
		controller: function($scope, utils){
			$scope.dtInstance = {};

			$scope.dtOptions = utils.DT.optionsBuilder
			.fromFnPromise(function(){
				return utils.serverRequest('/nursing/ward-transfer/view?resourceId='+$scope.admissionId, 'GET');
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

		    if ($scope.allowNew == "true"){
		    	$scope.dtOptions = $scope.dtOptions.withButtons([
					{
						text: '<i class="icon-file-plus"></i> New Item',
						action: function(){
							
						}
					}
				]);	
		    }

			$scope.dtColumns = [
				utils.DT.columnBuilder.newColumn('TransferLogID').withTitle("ID"),
				utils.DT.columnBuilder.newColumn('WardFrom').withTitle("Ward Transferred From"),
				utils.DT.columnBuilder.newColumn('WardToName').withTitle("Ward Transferred To"),
				utils.DT.columnBuilder.newColumn(null).withTitle("Date Transferred").renderWith(function(data, full, meta){
					var d = new Date(data.TransferDate).toDateString();

					return "<p title='"+data.TransferDate+"'>"+d+"</p>";
				}),
				utils.DT.columnBuilder.newColumn('TransferredByName').withTitle("Transferred By"),
				utils.DT.columnBuilder.newColumn('TransferNote').withTitle("Transfer Note")
			];
		}
	}
})