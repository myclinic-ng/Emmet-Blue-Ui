angular.module("EmmetBlue")

.directive('ngInvoice', function(){
	return {
		restrict: "E",
		scope: {
			invoiceData: "=invoiceData"
		},
		templateUrl: "plugins/accounts/billing/assets/includes/invoice-template.html",
		controller: function($scope, utils){
			$scope.businessInfo = utils.userSession.getBusinessInfo();
			
			$scope.$watch("invoiceData", function(nv){
				if (typeof nv !== "undefined" && typeof nv.patient !== "undefined"){
					// var request = utils.serverRequest("/patients/patient/view?resourceId="+nv.patient, "GET");

					// request.then(function(response){
					// 	$scope.patient = response["_source"];
					// 	$scope.showInvoice = true;
					// }, function(response){
					// 	utils.errorHandler(response);
					// })
					$scope.patient = nv.patientInfo;
					$scope.showInvoice = true;
				}
				else {
					$scope.showInvoice = false;
				}
			});
			
			$scope.getItemName = function(item){
				utils.serverRequest('/accounts-biller/billing-type-items/view-by-id?resourceId='+item, "GET").then(function(response){
					console.log(response);
					return response;
				})
			}

			$scope.copyToClipboard = function(text) {
			    if (window.clipboardData && window.clipboardData.setData) {
			        // IE specific code path to prevent textarea being shown while dialog is visible.
			        return clipboardData.setData("Text", text); 

			    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
			        var textarea = document.createElement("textarea");
			        textarea.textContent = text;
			        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
			        document.body.appendChild(textarea);
			        textarea.select();
			        try {
			            document.execCommand("copy");  // Security exception may be thrown by some browsers.
			            utils.notify("Selected item copied successfully.", "", "info");
			        } catch (ex) {
			            utils.notify("Copy to clipboard failed.", ex, "error");
			            return false;
			        } finally {
			            document.body.removeChild(textarea);
			        }
			    }
			}
		}
	}
})