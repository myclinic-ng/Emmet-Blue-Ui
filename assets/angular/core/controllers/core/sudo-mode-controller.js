angular.module("EmmetBlue")

.controller('sudoModeController', function($scope, $rootScope, utils){
	$scope.showSudoInfo = function(){
		var info = "Sometimes, it's important to make sure it's actually you (the owner of this account) that's trying to do very important things. Protected Mode helps us to do that. All you have to do is enter your password and we'd do the rest. Please note that if you enter the wrong information more than five times, your account will be blocked. This is necessary to prevent unsolicited access to your account. Keep your account login data known to you alone, stay safe.";
		utils.alert("What is Protected Mode?", info, "info");
	}

	$scope.showForgotPasswordInfo = function(){
		utils.alert("Forgotten your password?", "Please contact an administrator for the next steps to take. There's nothing more to do from here", "info");
	}

	$scope.processLogin = function(){
		$loginPromise = utils.serverRequest("/login", "POST", {
			username: "pharmabigail",
			password: $scope.password
		});

		$loginPromise.then(function(response){
			if (!response.status){
				$(".password").addClass('has-warning').val("");
				utils.alert(
					"Invalid login data",
					"We were unable to sign you into your account "+
					"because we could not link the password you entered to the currently logged in account. "+
					"Please try again with a valid password",
					"error"
				);
			}
			else
			{
				$(".password").removeClass('has-warning').addClass('has-success').val("");
				$rootScope.$broadcast("sudo-mode-bypassed");
				// utils.notify("You have successfully confirmed your account", "we are sorry for the inconveniences it might have caused", "success");
			}
		})
	}
});