angular.module('EmmetBlue', [
	'ngRoute',
	'ngAnimate',
	'ngMessages',
	'datatables',
	'datatables.buttons',
	'datatables.fixedheader',
	'ngCookies',
	'ngStorage'
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

.directive()

.factory("utils", function(
	$rootScope,
	$location,
	$parse,
	CONSTANTS,
	$q,
	$http,
	$httpParamSerializer,
	$compile,
	DTOptionsBuilder,
	DTColumnBuilder,
	$compile,
	$cookies,
	$localStorage
){
	var services = {};

	services.enableDefaultFormValues = function(){
		var parameters = $location.search();
		for (var key in parameters){
			$parse(key).assign($rootScope, parameters[key]);
		}
		$location.url($location.path());
	};

	services.loadNigeriaData = function(){
		var defer = $q.defer();
		var data = $http.get("assets/angular/core/data/nigerian-states-lgas.json").then(function(response){
			defer.resolve(response.data);
			return defer.promise;
		}, function(response){
			defer.reject(response);
			return defer.promise;
		});

		return data;
	}

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

	services.alert = function(title, text, type, notyType=""){
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

	services.confirm = function(title, text, closeOnConfirm, callback, type="", btnText="Ok"){
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
				services.notify('Invalid Resource Requested', 'The requested resource was not found on this server, please contact an administrator', 'warning');
				break;
			}
			default:
			{
				if (typeof errorObject.data != "undefined"){
					services.alert(errorObject.status+': '+errorObject.statusText, errorObject.data.errorMessage, 'error');
				}
				else{
					services.alert("Unknown error", "A general error has occurred, please contact an administrator", 'error');
				}
			}
		}
	};

	services.globalConstants = CONSTANTS;

	services.serializeParams = $httpParamSerializer;

	services.compile = $compile;

	services.storage = $localStorage;
	
	services.restServer = CONSTANTS.EMMETBLUE_SERVER+CONSTANTS.EMMETBLUE_SERVER_VERSION;

	services.DT = {
		optionsBuilder: DTOptionsBuilder,
		columnBuilder: DTColumnBuilder,
	}

	return services;
})

.directive("ngCurrency", function(){
	return {
		template: '&#8358'
	}
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
		"EMMETBLUE_SERVER":"http://192.168.173.1:700/",
		"EMMETBLUE_SERVER_VERSION":"v1",
		"USER_COOKIE_IDENTIFIER":"_______"
	};
}