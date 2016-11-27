angular.module("EmmetBlue")

.directive("ngServicesRendered", function(){
	return {
		restrict: 'AE',
		scope: {
			admissionId: '=admissionId'
		},
		templateUrl: "plugins/nursing/assets/includes/services-rendered-template.html",
		controller: function($scope, utils){
			$scope.servicesRendered = {};
			$scope.dtInstance = {};

			$scope.dtOptions = utils.DT.optionsBuilder
			.fromFnPromise(function(){
				return utils.serverRequest('/nursing/services-rendered/view?resourceId='+$scope.admissionId, 'GET');
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
					text: '<i class="icon-file-plus"></i> New Item',
					action: function(){
						$('#new_service_rendered').modal('show')
					}
				}
			]);	

			$scope.dtColumns = [
				utils.DT.columnBuilder.newColumn('ServicesRenderedID').withTitle("ID"),
				utils.DT.columnBuilder.newColumn('BillingTypeItemName').withTitle("Service / Item"),
				utils.DT.columnBuilder.newColumn('BillingTypeItemQuantity').withTitle("Quantity"),
				utils.DT.columnBuilder.newColumn('DoctorInCharge').withTitle("Consultant / Doctor"),
				utils.DT.columnBuilder.newColumn('ServicesRenderedDate').withTitle("Date"),
				utils.DT.columnBuilder.newColumn('Nurse').withTitle("Recorded By")
			];

			function reloadTable(){
				if (typeof $scope.dtInstance.reloadData == 'function'){
					$scope.dtInstance.reloadData();
				}
			}

			$scope.selectedRequestItems = [];

			$scope.addToList = function(index, process = false){
				if (!process){
					$("#itemQty").modal("show");
					$scope.requestItems[$scope.currentRequestItemGroup][index]
				}
				else  {

				}
				// try {
				// 	if ($scope.selectedRequestItems.indexOf($scope.requestItems[$scope.currentRequestItemGroup][index]) == -1){
				// 		$scope.selectedRequestItems.push($scope.requestItems[$scope.currentRequestItemGroup][index]);
				// 	}
				// }
				// catch(err){
				// 	console.log(err);
				// }
			}

			$scope.removeFromList = function(itemLocation){
				$scope.selectedRequestItems.splice(itemLocation, 1);
			}

			$scope.$watch("admissionId", function(nv){
				if (angular.isDefined(nv)){
					reloadTable();
				}
			});

			$scope.$watch("currentRequestItemGroup", function(nv){
				if (angular.isDefined(nv)){
					$scope.currentRequestItems = $scope.requestItems[nv];
				}
			});

			function loadRequestItems(staff){
				var request = utils.serverRequest("/accounts-biller/billing-type-items/view-by-staff-uuid?resourceId=0&uuid="+staff, "GET");

				request.then(function(response){
					$scope.requestItems = response;
				}, function(error){
					utils.errorHandler(error);
				});
			}

			loadRequestItems(utils.userSession.getUUID());


			
			$scope.saveService= function(){
				var service = $scope.servicesRendered;
				service.nurse = utils.userSession.getID();
				service.admissionId = $scope.admissionId;

				var req = utils.serverRequest("/nursing/services-rendered/new", "POST", service);
				req.then(function(response){
					$("#new_service_rendered").modal("hide");
					utils.alert("Operation Successful", "Billing item saved successfully", "success");
					reloadTable();
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
})