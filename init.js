// Define file locations
var css = [
	// "https://fonts.googleapis.com/css?family=Roboto:400,300,100,500,700,900",
	"assets/css/icons/icomoon/styles.css",
	"assets/css/icons/fontawesome/styles.min.css",
	"assets/css/bootstrap.css",
	"assets/css/core.css",
	"assets/css/components.css" ,
	"assets/css/colors.css"
];

var jquery = {"jquery": "assets/js/core/libraries/jquery.min.js"};
var bootstrap = {"bootstrap": "assets/js/core/libraries/bootstrap.min.js"};
var libraries = [
	"assets/js/plugins/ui/drilldown.js",
	"assets/js/plugins/ui/nicescroll.min.js",
	"assets/js/plugins/loaders/pace.min.js"
];

var themes = [
	"assets/js/core/app.js"
];

var angular = {"angular": "assets/angular/libraries/angular.js"};
var app = {"app": "assets/angular/core/app.js"};
var angularLibraries = [
	"assets/angular/libraries/angular-route.js"
]

// Load Files
head.load(css);

head.load([jquery, bootstrap]);

head.load(angular);

head.ready(["jquery", "bootstrap"], function(){
	head.load(libraries);
	head.load(themes);
});

head.ready("angular", function(){
	head.load(angularLibraries);
	head.load(app);
});

// AngularJS Controllers and Services
var cntrllers = [
	"assets/angular/core/controllers/core/core-controller.js",
	"assets/angular/core/controllers/mortuary/controllers.js"
]

var services = [

]

head.ready("app", function(){
	head.load(cntrllers);
	head.load(services);
});