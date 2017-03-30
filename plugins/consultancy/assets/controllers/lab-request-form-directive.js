angular.module("EmmetBlue")

.directive('ngLabRequestFormDesign', function(){
	return {
		restrict: 'AE',
		scope: {
			patientInfo: '=patientInfo'
		},
		templateUrl: "plugins/consultancy/assets/includes/lab-request-form-template.html",
		controller: function($scope, utils){
			var table = $(".lab-table tr");

			$("#lab-form > div > .table-responsive").css("border", "1px solid #000");

			table.each(function(){

				var th = $(this).children("th").first();
				var td = $(this).children("td").first();

				th.html("<div class='checkbox'><label><input type='checkbox' class='control-primary'/> "+th.html()+"</label></div>").addClass("bg-danger")
				td.html("<div class='checkbox checkbox-right'><label><input type='checkbox' class='control-primary'/> "+td.html()+"</label></div>")
			});

			$scope.submit = function(){
				var form = $("#lab-form").prop("outerHTML");
				console.log(form);
				form = btoa(encodeURIComponent(form).replace(/%([0-9A-F]{2})/g, function(match, p1) {
			        return String.fromCharCode('0x' + p1);
			    }));
				var data = {
					patientID: 7,
					clinicalDiagnosis: form,
					requestedBy: utils.userSession.getID()
				}

				utils.serverRequest('/lab/lab-request/new', 'POST', data).then(function(response){
					utils.notify("Operation Successful", "Request sent successfully", "success");
				}, function(error){
					utils.errorHandler(error);
				})
			}
		}
	}
})