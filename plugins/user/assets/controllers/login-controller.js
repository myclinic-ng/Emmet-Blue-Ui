angular.module("EmmetBlue")

.controller('userLoginController', function($scope, utils, $cookies, $location, $timeout){
	$scope.login = {};
	$scope.userClient = utils.globalConstants.USER_CLIENT;
	
	if (typeof $.cookie("last-stored-login-username") != "undefined"){
		$scope.login.username = $.parseJSON($.cookie("last-stored-login-username")).value;
	}

	$scope.processLogin = function(){
		var loginData = $scope.login;

		if (typeof loginData == "undefined"
			|| typeof loginData.username == "undefined"
			|| typeof loginData.password == "undefined"
			|| loginData.username == ""
			|| loginData.password == ""
		)
		{
			utils.alert("All fields are required", "Please enter both your username and password to continue", "warning");
		}
		else
		{
			var block = $("#form-login");
			$(block).block({ 
			    message: '<i class="icon-spinner4 spinner"></i>',
			    //timeout: 3000, //unblock after 3 seconds
			    overlayCSS: {
			        backgroundColor: '#fff',
			        opacity: 0.8,
			        cursor: 'wait'
			    },
			    css: {
			        border: 0,
			        padding: 0,
			        backgroundColor: 'transparent'
			    }
			});

			$loginPromise = utils.serverRequest("/login", "POST", {
				username: loginData.username,
				password: loginData.password
			});

			$loginPromise.then(function(response){
				if (!response.status){
					$(".form-control").addClass('has-warning')
					utils.alert(
						"Invalid login data",
						"We were unable to sign you into your account "+
						"because we could not link the username and password you entered to any account. "+
						"Please try again with a valid username and password",
						"error"
					);
					$(block).unblock();
				}
				else
				{
					$(block).block({ 
					    message: '<i class="icon-spinner2 spinner"></i> redirecting',
					    overlayCSS: {
					    	backgroundColor: '#fff',
			        		opacity: 0.8,
			        		cursor: 'wait'
					    },
					    css: {
					        border: 0,
					        padding: 0,
					        backgroundColor: 'transparent'
					    }
					});
					utils.alert(
						"Login Successful",
						"Your sign in request was completed successfully. You are now being redirected to your dashboard",
						"success",
						"notify"
					);
					$(".controls").removeClass('has-warning').addClass('has-success');

					if ($scope.login.remember){
						$cookies.putObject("last-stored-login-username", {value: $scope.login.username});
					}

					var responseObject = {
						uuid: response.uuid,
						accountActivated: response.accountActivated,
						staffid: response.id,
						username: $scope.login.username,
						token: response.token
					};

					$cookies.putObject(utils.globalConstants.USER_COOKIE_IDENTIFIER, responseObject);

					$timeout(function(){
						utils.serverRequest("/human-resources/staff/view-root-url?resourceId="+responseObject.staffid, "GET").then(function(response){
							responseObject.dashboard = response.Url;
							$cookies.putObject(utils.globalConstants.USER_COOKIE_IDENTIFIER, responseObject);
							$(".login-wrapper").fadeOut();
							$location.path(response.Url);
						}, function(error){
							utils.alert("Department Dashboard Inaccessible", "This is usually due to your account being associated with an inexistent department, a department on general lockdown or some other indeterminate reasons. Please contact an administrator if this error persists", "error");
							$(block).unblock();
							utils.notify("Redirection Incomplete", "Please see previous errors", "warning");
						});

						// if (response.accountActivated !== "0")
						// {
						// 	utils.serverRequest("/human-resources/staff/view-root-url?resourceId="+responseObject.staffid, "GET").then(function(response){
						// 		$location.path(response.Url);
						// 	});
						// }
						// else
						// {
						// 	utils.alert('Looks like its your first time', 'show some tutorial stuff', 'info');
						// 	$location.path('/');
						// }
					}, 4000);
				}
			}, function(response){
				utils.errorHandler(response);
				$(block).unblock();
			});

			$scope.login.password = "";
		}
	}

	$scope.currentType = "password";
	$scope.togglePassword = function(){
		$scope.currentType = $scope.currentType == "password" ? "text" : "password";
		$("#password").attr("type", $scope.currentType);
	}

	$scope.currentYear = (new Date()).getFullYear();
})