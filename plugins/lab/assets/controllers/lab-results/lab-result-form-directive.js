angular.module("EmmetBlue")

.directive('ngLabResultFormDesign', function(){
	return {
		restrict: 'AE',
		scope: {
			patientInfo: '=patientInfo'
		},
		templateUrl: "plugins/lab/assets/includes/result-forms/lab-result-form-template.html",
		controller: function($scope, utils){
			$scope.today = utils.today()+ " " + (new Date()).toLocaleTimeString();
			$scope.currentStaff = utils.userSession.getID();
			var req = utils.serverRequest("/human-resources/staff/view-staff-profile?resourceId="+utils.userSession.getID(), "GET");

			req.then(function(response){
				$scope.currentStaff = response[0].StaffFullName;
			}, function(error){
				utils.errorHandler(error);
			})

			var table = $(".lab-table tr");

			$("#lab-form > div > .table-responsive").css("border", "1px solid #000");

			table.each(function(){
				var th = $(this).children("th").first();
				var td = $(this).children("td");

				th.html("<div class='checkbox'><label><input type='checkbox' class='control-primary'/> "+th.html()+"</label></div>").addClass("bg-danger")
				td.attr("contenteditable", "true");
			});

			function loadInvestigationTypes(){
				utils.serverRequest('/lab/investigation-type/view-by-lab?resourceId=0', 'GET').then(function(response){
					$scope.investigationTypes = response;
				}, function(error){
					utils.errorHandler(error);
				})
			}
			loadInvestigationTypes();

			$scope.loadFields = function(id){
				utils.serverRequest('/lab/investigation-type-field/view?resourceId='+id, 'GET')
				.then(function(response){
					$scope.investigationFields = response;
					setTimeout(function(){
						$(".autosuggest").each(function(){
							var current = $(this);
							current.typeahead({
						        hint: true,
						        highlight: true,
						        minLength: 1
						    },
						    {
						    	source: function(query, process){
						    		utils.serverRequest("/lab/investigation-type-field/view-default-values?resourceId="+current.attr("data-id"), "GET").then(function(response){
						    			var data = [];
						        		angular.forEach(response, function(value){
						        			data.push(value.Value);
						        		})

						        		data = $.map(data, function (string) { return { value: string }; });
						        		process(data);
						    		}, function(error){
						    			utils.errorHandler(error);
						    		})
						    	}
						    })
						})
					}, 2000);
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.$watch("investigationType", function(nv){
				$scope.loadFields(nv);
				utils.serverRequest("/lab/investigation-type/view?resourceId="+nv, "GET")
				.then(function(response){
					if (typeof response[0] !== "undefined"){
						$scope.currentInvestigationName = response[0].InvestigationTypeName;	
					}
				})
			})

			$scope.selected = {};

			$scope.submit = function(){
				var reqs = [];
				$(".lab-table tr").each(function(){

					var th = $(this).children("th").first();

					$(th).find("input").each(function(){
						var checked = $(this).prop("checked");

						if (checked){
							reqs.push($.trim($(this).parent().text()));
							$(this).attr("checked", "checked");
						}
					});
				});

				if (typeof $scope.investigations !== "undefined"){
					reqs.push($scope.investigations);
				}

				if (typeof $scope.currentInvestigationName !== "undefined"){
					$scope.investigations = reqs.push($scope.currentInvestigationName);
				}

				$scope.investigations = reqs.join(", ");

				var req = utils.serverRequest("/lab/patient/view?resourceId=0&patient="+$scope.patientInfo.patientid, "GET");

				req.then(function(response){
					$scope.investigationsToAffect = response;
					$("#affects").modal("show");
				}, function(error){
					utils.errorHandler(error);
				})
			}

			$scope.persist = function(){
				var form = $("#lab-form").get(0);
				domtoimage.toPng(form)
			    .then(function (dataUrl) {
			        var img = new Image();
			        img.src = dataUrl;

			        $scope.submitResult(dataUrl);
			    })
			    .catch(function (error) {
			        console.error('oops, something went wrong!', error);
			    });
			}

			$scope.dateObject = function(date){
				return new Date(date);
			}

			$scope.submitResult = function(img){
				var patient = $scope.patientInfo.patientid;
				var investigationName = $scope.investigations;
				var report = img;
				var reportedBy = utils.userSession.getID();

				if (angular.equals(report, {})){
					utils.alert("An error occurred", "Please make sure you've filled in at least one field to continue", "warning");
				}
				else {
					var data = {
						patientLabNumber: patient,
						investigationName: investigationName,
						report: report,
						reportedBy: reportedBy,
						requests: []
					};

					angular.forEach($scope.selected, function(v, k){
						if (v.value){
							data.requests.push(k);
						}
					})

					utils.serverRequest("/lab/lab-result/new", "POST", data).then(function(response){
						utils.notify("Operation Successfuly", "Result Published Successfuly", "success");
						$scope.investigationResult = {};
						$scope.currentRepository = response.repoId;
						$("#repository-items").modal("show");

						window.location.path = "lab/patients";
					}, function(error){
						utils.errorHandler(error);
					})
				}
			}
		}
	}
})