// Define file locations
var css = [
	"https://fonts.googleapis.com/css?family=Roboto:400,300,100,500,700,900",
	"assets/css/icons/icomoon/styles.css",
	"assets/css/icons/fontawesome/styles.min.css",
	"assets/css/bootstrap.css",
	"assets/css/core.css",
	"assets/css/components.css" ,
	"assets/css/colors.css",
	"assets/css/ribbon.css",
	"assets/css/datatables/angular-datatables.css",
	"assets/css/datatables/buttons.dataTables.css",
	"assets/css/datatables/fixedHeader.dataTables.css"
];

var jquery = {"jquery": "assets/js/core/libraries/jquery.min.js"};
var bootstrap = {"bootstrap": "assets/js/core/libraries/bootstrap.min.js"};
var libraries = [
	"assets/js/plugins/ui/drilldown.js",
	"assets/js/plugins/ui/nicescroll.min.js",
	"assets/js/plugins/loaders/pace.min.js",
	"assets/js/plugins/loaders/blockui.min.js",
	"assets/js/plugins/forms/styling/uniform.min.js",
	"assets/js/plugins/notifications/pnotify.min.js",
	"assets/js/plugins/uploaders/dropzone.js",
	"assets/js/plugins/notifications/sweet_alert.min.js",
	"assets/js/plugins/tables/datatables/datatables.min.js",
	"assets/js/plugins/tables/datatables/extensions/dataTables.fixedHeader.js",
	"assets/js/core/libraries/jasny_bootstrap.min.js",
	"assets/js/plugins/webcam/webcam.js"
];

var themes = [
	"assets/js/core/app.js"
];

var angular = {"angular": "assets/angular/libraries/angular.js"};
var app = {"app": "assets/angular/core/app.js"};
var angularLibraries = [
	"assets/angular/libraries/angular-route.js",
	"assets/angular/libraries/angular-animate.js",
	"assets/angular/libraries/angular-messages.js",
	"assets/angular/libraries/angular-cookies.js",
	"assets/angular/libraries/angular-datatables.js",
	"assets/angular/libraries/angular-datatables.buttons.js",
	"assets/angular/libraries/datatable-buttons/dataTables.buttons.js",
	"assets/angular/libraries/datatable-buttons/buttons.print.js",
	"assets/angular/libraries/datatable-buttons/buttons.html5.js",
	"assets/angular/libraries/datatable-buttons/buttons.bootstrap.js",
	"assets/angular/libraries/angular-datatables.fixedheader.js",
	"assets/angular/libraries/angular-dropzone.js",
	"assets/angular/libraries/ngStorage.js"
]

// Load Files
head.load(css);

head.load([jquery, bootstrap]);

head.ready(["jquery", "bootstrap"], function(){
	head.load(libraries);
	head.load(themes);

	head.load(angular);
	head.ready("angular", function(){
		head.load(angularLibraries);
		head.load(app);
	});
});

// AngularJS Controllers and Services
var cntrllers = [
	"assets/angular/core/controllers/core/core-controller.js",
	"plugins/mortuary/assets/controllers.js",
	"plugins/user/assets/controllers.js",
	"plugins/human-resources/assets/controllers.js",
	"plugins/accounts/billing/assets/controllers.js",
	"plugins/records/patient/assets/controllers.js",
	"plugins/nursing/assets/controllers.js",
	"plugins/dummy/assets/controllers.js",
	"plugins/consultancy/assets/controllers.js"
]

var services = [

]

head.ready("app", function(){
	head.load({"chart":"assets/js/plugins/visualization/echarts/echarts.js"});
	head.load(cntrllers);
	head.load(services);
});