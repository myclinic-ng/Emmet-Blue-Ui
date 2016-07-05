angular.module('EmmetBlue', ['ngRoute'])

.config(function($routeProvider){
	$routeProvider
	.when('/:page*', {
		templateUrl: function(url){
			return determineRouteAvailability(url.page);
		}
	})
	.otherwise({
		redirectTo: '/'
	})
})

.constant("CONSTANTS", getConstants())

function determineRouteAvailability(url){
 	var _url = 'templates/'+url+'.html';

 	return _url;
}

function getConstants(){
	return {
		"TEMPLATE_DIR":"templates/",
		"MODULE_MENU_LOCATION":"includes/menu.html",
		"MODULE_HEADER_LOCATION":"includes/header.html",
		"EMMETBLUE_SERVER":"http://127.0.0.1:420/",
		"EMMETBLUE_SERVER_VERSION":"v1"
	};
}