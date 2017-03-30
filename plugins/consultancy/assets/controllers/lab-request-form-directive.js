angular.module("EmmetBlue")

.directive('ngLabRequestFormDesign', function(){
	return {
		restrict: 'AE',
		scope: {
			patientInfo: '=patientInfo'
		},
		templateUrl: "plugins/consultancy/assets/includes/lab-request-form-template.html",
		controller: function($scope, utils){
			$scope.today = utils.today()+ " " + (new Date()).toLocaleTimeString();

			var table = $(".lab-table tr");

			$("#lab-form > div > .table-responsive").css("border", "1px solid #000");

			table.each(function(){
				var th = $(this).children("th").first();

				th.html("<div class='checkbox'><label><input type='checkbox' class='control-primary'/> "+th.html()+"</label></div>").addClass("bg-danger")
			});

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

				$scope.investigations = reqs.join(", ");
				var form = $("#lab-form").get(0);
				domtoimage.toPng(form)
			    .then(function (dataUrl) {
			        var img = new Image();
			        img.src = dataUrl;
			        // $scope.image = img;

					var data = {
						patientID: $scope.patientInfo.patientid,
						clinicalDiagnosis: dataUrl,
						requestNote: $scope.diagnoses,
						investigationRequired: $scope.investigations,
						requestedBy: utils.userSession.getID()
					}

					utils.serverRequest('/lab/lab-request/new', 'POST', data).then(function(response){
						utils.notify("Operation Successful", "Request sent successfully", "success");
					}, function(error){
						utils.errorHandler(error);
					})
			    })
			    .catch(function (error) {
			        console.error('oops, something went wrong!', error);
			    });
			}
		}
	}
})