angular.module("EmmetBlue")

.directive("ngPharmacyRequestForm", function(){
	return {
		restrict: 'AE',
		scope: {
			patientId: '=patientId'
		},
		templateUrl: "plugins/nursing/ward/assets/includes/pharmacy-request-form-template.html",
		controller: function($scope, utils, $rootScope){
			$(".drug-search").typeahead({
	            hint: true,
	            highlight: true
	        },
	        {
	        	source: function(query, process){
	        		utils.serverRequest("/consultancy/drug-names/search?phrase="+query, "GET").then(function(response){
		    			var data = [];
		        		angular.forEach(response.hits.hits, function(value){
		        			data.push(value["_source"].displayTermsList.term);
		        		})

		        		data = $.map(data, function (string) { return { value: string }; });
		        		process(data);
		    		}, function(error){
		    			// utils.errorHandler(error);
		    		})
	        	}
	        })

			$scope.prescriptionList = [];
	        $scope.addDrug = function(){
	        	var item = $("#conclusion-drug").val();
	        	var prescription = {
					item: item,
					duration: null
				};

				var duplicationDetected = false;
				for (var i = 0; i < $scope.prescriptionList.length; i++){
					if ($scope.prescriptionList[i].item == prescription.item){
						duplicationDetected = true;
						break;
					}
				}
				if (duplicationDetected){
					utils.notify("Duplicate items are not allowed", item+" has already been added to the prescription list", "warning");
				}
				else {
					$scope.prescriptionList.push(prescription);
					$("#conclusion-drug").val("");
				}
	        }

	        $scope.removePrescriptionFromList = function(index){
				$scope.prescriptionList.splice(index, 1);
			}

			$scope.sendToPharmacy = function(){
				var data = {
					request: $scope.prescriptionList,
					patientId: $scope.patientId,
					requestedBy: utils.userSession.getID()
				}

				var req = utils.serverRequest("/pharmacy/pharmacy-request/new", "POST", data);

				req.then(function(response){
					$rootScope.$broadcast('newPharmacyRequestSent');
					$scope.prescriptionList = [];
					utils.notify("Operation Successful", "The dispensory has been notified", "success");
				}, function(error){
					utils.errorHandler(error);
				});
			}
		}
	}
})