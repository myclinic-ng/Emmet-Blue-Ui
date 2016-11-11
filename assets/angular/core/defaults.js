angular.module('EmmetBlue', [
	'ngRoute',
	'ngAnimate',
	'ngMessages',
	'datatables',
	'datatables.buttons',
	'datatables.fixedheader',
	'ngCookies',
	'ngStorage',
	'ngPrint',
	'angularUtils.directives.dirPagination'
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