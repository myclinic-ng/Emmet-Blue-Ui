// Define file locations
var css = [
	"assets/css/icons/icomoon/styles.min.css",
	"assets/css/icons/fontawesome/styles.min.css",
	"assets/css/bootstrap.min.css",
	"assets/css/core.min.css",
	"assets/css/components.min.css",
	"assets/css/colors.min.css",
	"assets/css/ribbon.min.css",
	"assets/css/watermark.min.css",
	"assets/css/datatables/angular-datatables.min.css",
	"assets/css/datatables/buttons.dataTables.min.css",
	"assets/css/datatables/fixedHeader.dataTables.min.css",
	"assets/js/plugins/sliders/slick/slick.css",
	"assets/angular/libraries/ng-print/ngPrint.min.css",
	"assets/css/dt-picker.min.css"
];

var jquery = {"jquery": "assets/js/core/libraries/jquery.min.js"};
var bootstrap = {"bootstrap": "assets/js/core/libraries/bootstrap.min.js"};
var libraries = [
	"assets/js/plugins/ui/drilldown.min.js",
	"assets/js/plugins/ui/nicescroll.min.js",
	"assets/js/plugins/loaders/pace.min.js",
	"assets/js/plugins/loaders/blockui.min.js",
	"assets/js/plugins/forms/styling/uniform.min.js",
	"assets/js/plugins/notifications/pnotify.min.js",
	"assets/js/plugins/uploaders/dropzone.min.js",
	"assets/js/plugins/notifications/sweet_alert.min.js",
	"assets/js/plugins/tables/datatables/datatables.min.js",
	"assets/js/plugins/tables/datatables/extensions/dataTables.fixedHeader.min.js",
	"assets/js/core/libraries/jasny_bootstrap.min.js",
	"assets/js/plugins/webcam/webcam.min.js",
	"assets/js/core/libraries/jquery_ui/core.min.js",
	"assets/js/core/libraries/jquery_ui/effects.min.js",
	"assets/js/core/libraries/jquery_ui/interactions.min.js",
	"assets/js/plugins/trees/fancytree_all.min.js",
	"assets/js/plugins/media/fancybox.min.js",
	"assets/js/plugins/trees/fancytree_childcounter.min.js",
	"assets/js/plugins/ui/prism.min.js",
	"assets/js/dt-picker.js",
	"assets/js/dom-to-image.min.js"
];

var themes = [
	"assets/js/core/app.min.js"
];

var angular = {"angular": "assets/angular/libraries/angular.min.js"};
var appDefaults = {"appDefaults": "assets/angular/core/defaults.js"}
var app = {"app": "assets/angular/core/app.js"};
var angularLibraries = [
	"assets/angular/libraries/angular-route.min.js",
	"assets/angular/libraries/angular-toArrayFilter.min.js",
	"assets/angular/libraries/angular-animate.min.js",
	"assets/angular/libraries/angular-messages.min.js",
	"assets/angular/libraries/angular-cookies.min.js",
	"assets/angular/libraries/angular-sanitize.min.js",
	"assets/angular/libraries/angular-datatables.min.js",
	"assets/angular/libraries/ng-print/ngPrint.min.js",
	"assets/angular/libraries/ng-pagination/ng-pagination.min.js",
	"assets/angular/libraries/angular-datatables.buttons.min.js",
	"assets/angular/libraries/datatable-buttons/dataTables.buttons.min.js",
	"assets/angular/libraries/datatable-buttons/buttons.print.min.js",
	"assets/angular/libraries/datatable-buttons/buttons.html5.min.js",
	"assets/angular/libraries/datatable-buttons/buttons.bootstrap.min.js",
	"assets/angular/libraries/angular-datatables.fixedheader.js",
	"assets/angular/libraries/angular-dropzone.min.js",
	"assets/angular/libraries/ngStorage.min.js"
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
		head.load(appDefaults);
		head.load(app);
	});
});

// AngularJS Controllers and Services
var cntrllers = [
	"assets/angular/core/controllers/core/core-controller.js",
	"assets/angular/core/controllers/core/sudo-mode-controller.js",
	"plugins/mortuary/assets/controllers.js",
	"plugins/user/assets/controllers.js",
	"plugins/human-resources/assets/controllers.js",
	"plugins/accounts/billing/assets/controllers.js",
	"plugins/accounts/main/assets/controllers.js",
	"plugins/accounts/hmo/assets/controllers.js",
	"plugins/records/patient/assets/controllers.js",
	"plugins/nursing/ward/assets/controllers.js",
	"plugins/nursing/station/assets/controllers.js",
	"plugins/pharmacy/assets/controllers.js",
	"plugins/pharmacy/dispensory/assets/controllers.js",
	"plugins/consultancy/assets/controllers.js",
	"plugins/lab/assets/controllers.js",
	"plugins/financial-audit/assets/controllers.js"
]

var services = [

]

head.ready("appDefaults", function(){
	head.load(cntrllers);
	head.load(services);
});