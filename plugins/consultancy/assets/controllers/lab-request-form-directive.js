angular.module("EmmetBlue")

.directive('ngLabRequestFormDesign', function(){
	return {
		restrict: 'AE',
		scope: {
			patientInfo: '=patientInfo'
		},
		templateUrl: "plugins/consultancy/assets/includes/lab-request-form-template.html",
		controller: function($scope, utils, $rootScope){
			$scope.showSubmitLoader = false;
			$scope.today = utils.today()+ " " + (new Date()).toLocaleTimeString();

			var table = $(".lab-table tr");

			$("#lab-form > div > .table-responsive").css("border", "1px solid #000");

			table.each(function(){
				var th = $(this).children("th").first();
				var td = $(this).children("td").first();

				th.html("<div class='checkbox'><label><input type='checkbox' class='control-primary'/> "+th.html()+"</label></div>").addClass("bg-danger")
				td.html("<div class='checkbox'><label><input type='checkbox' class='control-primary'/> "+td.html()+"</label></div>")
			});

			$scope.module = {
				loadRegisteredLabs: function(){
					utils.serverRequest('/lab/lab/view', 'GET').then(function(response){
						$scope.module.registeredLabs = response;
					}, function(error){
						utils.errorHandler(error);
					})
				},
				loadRegisteredInvestigationTypes: function(lab){
					utils.serverRequest('/lab/investigation-type/view-by-lab?resourceId='+lab, 'GET').then(function(response){
						$scope.module.registeredInvestigationTypes = response;
					}, function(error){
						utils.errorHandler(error);
					})
				}
			}

			$scope.module.loadRegisteredLabs();
			$scope.$watch(function(){ if (typeof $scope.module.lab !== "undefined"){ return $scope.module.lab;} }, function(nv){
				$scope.module.loadRegisteredInvestigationTypes(nv);
			})

			$scope.submit = function(){
				$scope.showSubmitLoader = true;
				var reqs = [];
				$(".lab-table tr").each(function(){

					var th = $(this).children("th").first();
					var td = $(this).children("td").first();

					$(th).find("input").each(function(){
						var checked = $(this).prop("checked");

						if (checked){
							reqs.push($.trim($(this).parent().text()));
							$(this).attr("checked", "checked");
						}
					});

					$(td).find("input").each(function(){
						var checked = $(this).prop("checked");

						if (checked){
							reqs.push($.trim($(this).parent().text()));
							$(this).attr("checked", "checked");
						}
					});
				});

				$(".invCheck").each(function(){
					var checked = $(this).prop("checked");

					if (checked){
						reqs.push($.trim($(this).parent().text()));
						$(this).attr("checked", "checked");
					}
				})

				if (typeof $scope.investigations !== "undefined"){
					reqs.push($scope.investigations);
				}

				$rootScope.$broadcast("addSentLabInvestigationsToList", reqs);
				$scope.investigations = reqs.join(", ");
				var form = $("#lab-form").get(0);
				domtoimage.toPng(form)
			    .then(function (dataUrl) {
			        var img = new Image();
			        img.src = dataUrl;

					var data = {
						patientID: $scope.patientInfo.patientid,
						clinicalDiagnosis: dataUrl,
						requestNote: $scope.diagnoses,
						investigationRequired: $scope.investigations,
						requestedBy: utils.userSession.getID()
					}

					utils.serverRequest('/lab/lab-request/new', 'POST', data).then(function(response){
						$scope.showSubmitLoader = false;
						window.scrollTo(0, 0);
						utils.notify("Operation Successful", "Request sent successfully", "success");
						$scope.investigations = "";
						reqs = [];
					}, function(error){
						utils.errorHandler(error);
					})
			    })
			    .catch(function (error) {
					$scope.showSubmitLoader = false;
					console.log(error);
			        utils.notify('oops, something went wrong!', 'Unable to process request', "error");
			    });
			}
		}
	}
})