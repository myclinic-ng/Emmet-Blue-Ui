angular.module("EmmetBlue")

.controller('userLoginController', function($scope, utils, $cookies, $location){
	$(".no-login").hide();

	$scope.processLogin = function(){
		var loginData = $scope.login;

		if (typeof loginData == "undefined"
			|| typeof loginData.username == "undefined"
			|| typeof loginData.password == "undefined"
		)
		{
			utils.alert("All fields are required", "Please enter both your username and password to continue", "warning");
		}
		else
		{
			var block = $(".login-form");
			$(block).block({ 
			    message: '<i class="icon-spinner4 spinner"></i>',
			    timeout: 3000, //unblock after 3 seconds
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
					$(".form-group").addClass('has-warning')
					utils.alert(
						"Invalid login data",
						"We were unable to sign you into your account "+
						"because we could not link the username and password you entered to any account. "+
						"Please try again with a valid username and password",
						"error"
					);
				}
				else
				{
					utils.alert(
						"Login Successful",
						"Your sign in request was completed successfully. You are now being redirected to your dashboard",
						"success",
						"notify"
					);
					$(".form-group").removeClass('has-warning').addClass('has-success');

					var responseObject = {
						uuid: response.uuid,
						accountActivated: response.accountActivated,
						staffid: response.id
					};

					$cookies.putObject(utils.globalConstants.USER_COOKIE_IDENTIFIER, responseObject);

					$(".no-login").show();
					if (response.accountActivated !== "0")
					{
						$location.path('/');
					}
					else
					{
						utils.alert('Looks like its your first time', 'show some tutorial stuff', 'info');
						$location.path('/');
					}
				}
			}, function(response){
				utils.errorHandler(response);
			});

			$scope.login.password = "";
		}
	}
})