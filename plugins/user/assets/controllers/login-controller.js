angular.module("EmmetBlue")

.controller('userLoginController', function($scope, utils, $cookies, $location, $timeout){
	$scope.login = {};
	$scope.userClient = utils.globalConstants.USER_CLIENT;
	
	$scope.loadImage = utils.loadImage;

	if (typeof $.cookie("last-stored-login-username") != "undefined"){
		$scope.login.username = $.parseJSON($.cookie("last-stored-login-username")).value;
	}

	$scope.processLogin = function(biometric = false){
		var loginData = $scope.login;

		if (!biometric && (
				typeof loginData == "undefined"
				|| typeof loginData.username == "undefined"
				|| typeof loginData.password == "undefined"
				|| loginData.username == ""
				|| loginData.password == ""
			)
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

			if (!biometric){
				$loginPromise = utils.serverRequest("/login", "POST", {
					username: loginData.username,
					password: loginData.password
				});	
			}
			else {
				$loginPromise = utils.serverRequest("/login", "POST", {
					fingerprint: $scope.fingerprintImage,
				});
			}

			$loginPromise.then(function(response){
				if (typeof response == "undefined" || !response.status){
					$(".form-control").addClass('has-warning')
					utils.alert(
						"Invalid login data",
						"We were unable to sign you into your account "+
						"because we could not link the login data you supplied to any account. "+
						"Please try again with a valid login data",
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
						token: response.token,
						businessInfo: response.business
					};

					$cookies.putObject(utils.globalConstants.USER_COOKIE_IDENTIFIER, responseObject);

					$timeout(function(){
						if (response.accountActivated !== "0")
						{
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
						}
						else
						{
							$location.path('/user/welcome');
						}
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

	$scope.fingerprintImage = "";
	$scope.fpStreamCounter = 0;
	$scope.fingerLoaded = false;

	$scope.fingerprintUnsupported = function(){
		utils.alert("Please contact us", "This feature is currently disabled for your organization, please contact us for details on how to get started.", "info")
	}

	function streamFingerprint(){
		var req = utils.serverRequest("/stream-fingerprint", "GET");
		req.then(function(response){
			if (response){
				$scope.fingerprintImage = "data:image/jpg;base64,"+response;
				$scope.fingerLoaded = true;
			}
			else {
				if ($scope.fpStreamCounter < 10){
					$timeout(function() {
						streamFingerprint();
						$scope.fpStreamCounter++;
					}, 1000);
				}
				else {
					utils.notify("Scanner Timeout", "No Scan Detected. Please try again or contact an administrator", "info");
				}
			}
		})
	}

	$scope.streamFingerprint = function(){
		$scope.fingerprintImage = "";
		$scope.fpStreamCounter = 0;
		$scope.fingerLoaded = false;
		streamFingerprint();
	}

	$scope.browserReload = function(){
		$("#biometric_login_modal").modal("hide");
		location.reload();
	}

	$scope.$watch("fingerLoaded", function(val){
		if (val == true){
			$scope.identifyStaff();
		}
	});

	$scope.identifyStaff = function(){
		$scope.fingerOwnerLoaded = 0;
		$scope.fingerOwner = {};
		$loginPromise = utils.serverRequest("/identify-fingerprint", "POST", {
			fingerprint: $scope.fingerprintImage
		});

		$loginPromise.then(function(response){
			if (typeof response.StaffID !== "undefined"){
				$scope.fingerOwner = response;
				$scope.fingerOwnerLoaded = 1;	
			}
			else {
				$scope.fingerOwnerLoaded = -1;
			}
		}, function(error){
			utils.errorHandler(error);
		});
	}
})