angular.module('EmmetBlue', [
	'ngRoute',
	'ngAnimate',
	'ngMessages',
	'datatables',
	'datatables.buttons',
	'ngCookies'
])

.run(function(DTDefaultOptions){
	DTDefaultOptions.setBootstrapOptions({
        TableTools: {
            classes: {
                container: 'btn-group',
                buttons: {
                    normal: 'btn btn-danger'
                }
            }
        }
    });
})

.config(function($routeProvider, $locationProvider){
	$routeProvider
	.when('/:page*', {
		templateUrl: function(url){
			return determineRouteAvailability(url.page);
		},
		reloadOnSearch: false
	})
	.otherwise({
		redirectTo: '/'
	});

	$locationProvider.html5Mode(true);
})

.factory("utils", function($rootScope, $location, $parse, CONSTANTS, $q, $http){
	var services = {};

	services.enableDefaultFormValues = function(){
		var parameters = $location.search();
		for (var key in parameters){
			$parse(key).assign($rootScope, parameters[key]);
		}
		$location.url($location.path());
	};

	services.notify = function(title, text, type){
	     new PNotify({
            title: title,
            text: text,
            addclass: 'alert-styled-left alert-arrow-left text-sky-royal',
            type: type,
            mouse_reset: true,
            insert_brs: true
        });
	};

	services.swal = function(title, text, type){
		sweetAlert({
			title: title,
			text: text,
			type: type,
			html: true
		});
	};

	services.alert = function(title, text, type, notyType){
		if (notyType == 'both'){
			services.swal(title, text, type);
			services.notify(title, text, type);
		}
		else if (notyType == 'notify'){
			services.notify(title, text, type);
		}
		else{
			services.swal(title, text, type);
		}
	}

	services.confirm = function(title, text, closeOnConfirm, callback, btnText="Cancel", type=""){
		sweetAlert({
			title: title,
			text: text,
			html: true,
			type: type,
			showCancelButton: true,
			confirmButtonText: btnText,
			closeOnConfirm: closeOnConfirm
		}, callback);
	}

	services.serverRequest = function(url, requestType, data={}){
		var deferred = $q.defer();

		return $http({
			"url":services.restServer+url,
			"method":requestType,
			"data":data
		}).then(function(result){
			deferred.resolve(result.data.contentData);
			return deferred.promise;
		}, function(result){
			deferred.reject(result);
			return deferred.promise;
		});
	}

	services.errorHandler = function(errorObject, showSwal=false){
		var alertType = (showSwal) ? "both" : "notify";
		switch(errorObject.status){
			case 404:{
				services.notify('Invalid Resource Requested', 'The requested resource was not found on this server, please contact an administration', 'warning');
				break;
			}
			default:
			{
				services.alert('Input Data Related Error', errorObject.data.errorMessage, 'error', alertType);
			}
		}
	};

	services.globalConstants = CONSTANTS;

	services.restServer = CONSTANTS.EMMETBLUE_SERVER+CONSTANTS.EMMETBLUE_SERVER_VERSION;

	return services;
})

.constant("CONSTANTS", getConstants())

function determineRouteAvailability(url){
	var urlParts = url.split("/");
	if (typeof urlParts[1] == "undefined"){
		urlParts[1] = "dashboard"
	}

 	var _url = 'plugins/'+urlParts.join('/')+'.html';

 	return _url;
}

function getConstants(){
	return {
		"TEMPLATE_DIR":"plugins/",
		"MODULE_MENU_LOCATION":"assets/includes/menu.html",
		"MODULE_HEADER_LOCATION":"assets/includes/header.html",
		"EMMETBLUE_SERVER":"http://192.168.1.100:420/",
		"EMMETBLUE_SERVER_VERSION":"v1",
		"USER_COOKIE_IDENTIFIER":"_______"
	};
}