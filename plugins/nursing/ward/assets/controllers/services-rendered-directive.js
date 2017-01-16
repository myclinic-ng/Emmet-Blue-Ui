angular.module("EmmetBlue")

.directive("ngServicesRendered", function(){
	return {
		restrict: 'AE',
		scope: {
			admissionId: '=admissionId',
			allowNew: '@allowNew'
		},
		templateUrl: "plugins/nursing/ward/assets/includes/services-rendered-template.html",
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
		    });

		    if ($scope.allowNew == "true"){
		    	$scope.dtOptions = $scope.dtOptions.withButtons([
					{
						text: '<i class="icon-file-plus"></i> New Item',
						action: function(){
							$('#new_service_rendered').modal('show')
						}
					}
				]);	
		    }

			$scope.dtColumns = [
				utils.DT.columnBuilder.newColumn('ServicesRenderedID').withTitle("ID"),
				utils.DT.columnBuilder.newColumn('BillingTypeItemName').withTitle("Service / Item"),
				utils.DT.columnBuilder.newColumn('BillingTypeItemQuantity').withTitle("Quantity"),
				utils.DT.columnBuilder.newColumn('DoctorInChargeFullName').withTitle("Consultant / Doctor"),
				utils.DT.columnBuilder.newColumn(null).withTitle("Date").renderWith(function(data, full, meta){
					var d = new Date(data.ServicesRenderedDate).toDateString();

					return "<p title='"+d+"'>"+data.ServicesRenderedDate+"</p>";
				}),
				utils.DT.columnBuilder.newColumn('NurseFullName').withTitle("Recorded By")
			];

			function reloadTable(){
				if (typeof $scope.dtInstance.reloadData == 'function'){
					$scope.dtInstance.reloadData();
				}
			}

			$scope.selectedRequestItems = [];
			$scope.currentItemIndex = 1;
			$scope.currentItemQty = 1;
			$scope.addToList = function(index, process = false){
				if (!process){
					$scope.currentItemIndex = index;
					$("#itemQty").modal("show");
					$scope.requestItems[$scope.currentRequestItemGroup][index]
				}
				else  {
					try {
						$("#itemQty").modal("hide");
						if ($scope.selectedRequestItems.indexOf($scope.requestItems[$scope.currentRequestItemGroup][$scope.currentItemIndex]) == -1){
							$scope.requestItems[$scope.currentRequestItemGroup][$scope.currentItemIndex].BillingTypeItemQuantity = $scope.currentItemQty;
							$scope.selectedRequestItems.push($scope.requestItems[$scope.currentRequestItemGroup][$scope.currentItemIndex]);
							$scope.currentItemIndex = 1;
						}
					}
					catch(err){
						console.log(err);
					}
				}
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

			function loadDoctors(){
				utils.serverRequest("/nursing/load-doctors/view", "GET").then(function(response){
					$scope.doctors = response;
				}, function(error){
					utils.errorHandler(error);
				})
			}
			loadDoctors();
			
			$scope.saveService= function(){
				var service = $scope.servicesRendered;
				service.nurse = utils.userSession.getID();
				service.admissionId = $scope.admissionId;
				service.items = $scope.selectedRequestItems;

				var req = utils.serverRequest("/nursing/services-rendered/new", "POST", service);
				req.then(function(response){
					console.log(response);
					$("#new_service_rendered").modal("hide");
					utils.alert("Operation Successful", "Billing item saved successfully", "success");
					$scope.selectedRequestItems  = [];
					$scope.servicesRendered = {};
					reloadTable();
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
})