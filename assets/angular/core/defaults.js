angular.module('EmmetBlue', [
	'ngRoute',
	'ngAnimate',
	'ngMessages',
	'ngSanitize',
	'datatables',
	'datatables.buttons',
	'datatables.fixedheader',
	'ngCookies',
	'ngStorage',
	'ngPrint',
	'angularUtils.directives.dirPagination',
	'angular-toArrayFilter' //<--- LIFE SAVER! Thanks https://github.com/petebacondarwin! (in case, paradventure, probably, you ever read this code)
])

.constant("CONSTANTS", getConstants())

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
	.when('/', {
		templateUrl: 'plugins/user/home.html'
	})
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

function determineRouteAvailability(url){
	var urlParts = url.split("/");
	if (typeof urlParts[1] == "undefined"){
		urlParts[1] = "dashboard"
	}

	// alert(route);

	if (typeof $.cookie(getConstants().USER_COOKIE_IDENTIFIER) != "undefined"){
		var userDashboard = (JSON.parse($.cookie(getConstants().USER_COOKIE_IDENTIFIER))).dashboard;
		if (userDashboard.split("/")[0] !== urlParts[0]){
			if (urlParts[0] == 'user'){
				//do nothing
			}
			else {
				return 'plugins/user/home.html';
			}
		}
	}

 	var _url = 'plugins/'+urlParts.join('/')+'.html';

 	return _url;
}


function getConstants(){
	var server = "http://192.168.173.1:700/";

	return {
		"TEMPLATE_DIR":"plugins/",
		"MODULE_MENU_LOCATION":"assets/includes/menu.html",
		"MODULE_HEADER_LOCATION":"assets/includes/header.html",
		"EMMETBLUE_SERVER":server,
		"EMMETBLUE_SERVER_VERSION":"v1",
		"USER_COOKIE_IDENTIFIER":"_______"
	};
}