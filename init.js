// Define file locations
var css = [
	// "assets/js/plugins/loaders/pace-corner-indicator.css",
	"assets/css/icons/icomoon/styles.min.css",
	"assets/css/icons/fontawesome/styles-2.min.css",
	"assets/css/icons/fontawesome/styles.min.css",
	"assets/css/bootstrap.min.css",
	"assets/css/core.min.css",
	"assets/css/components.min.css",
	"assets/css/fab-menu.css",
	"assets/css/colors.min.css",
	"assets/css/ribbon.min.css",
	"assets/css/watermark.min.css",
	"assets/css/datatables/angular-datatables.min.css",
	"assets/css/datatables/buttons.dataTables.min.css",
	"assets/js/plugins/sliders/slick/slick.css",
	"assets/angular/libraries/ng-print/ngPrint.min.css",
	"assets/css/dt-picker.min.css",
	"assets/angular/libraries/angular-bootstrap-calendar/angular-bootstrap-calendar.min.css"
];

var jquery = {"jquery": "assets/js/core/libraries/jquery.min.js"};
var bootstrap = {"bootstrap": "assets/js/core/libraries/bootstrap.min.js"};
var libraries = [
	"assets/js/plugins/loaders/pace.min.js",
	"assets/js/plugins/ui/drilldown.min.js",
	"assets/js/plugins/ui/fab.min.js",
	"assets/js/plugins/ui/nicescroll.min.js",
	"assets/js/plugins/loaders/blockui.min.js",
	"assets/js/plugins/forms/styling/uniform.min.js",
	"assets/js/plugins/notifications/pnotify.min.js",
	"assets/js/plugins/uploaders/dropzone.min.js",
	"assets/js/plugins/notifications/sweet_alert.min.js",
	"assets/js/plugins/tables/datatables/datatables.min.js",
	"assets/js/plugins/tables/datatables/extensions/dataTables.fixedHeader.min.js",
	// "assets/js/plugins/tables/datatables/extensions/dataTables.bootstrap.min.js",
	"assets/js/core/libraries/jasny_bootstrap.min.js",
	"assets/js/plugins/webcam/webcam.js",
	"assets/js/moment.min.js",
	"assets/js/plugins/extensions/session_timeout.min.js",
	"assets/js/plugins/media/fancybox.min.js",
	"assets/js/plugins/ui/prism.min.js",
	"assets/js/dt-picker.js",
	"assets/js/dom-to-image.min.js",
	"assets/js/qrcodegenlib.js",
	"assets/js/qrcodegen.js",
	"assets/js/plugins/forms/selects/select2.min.js",
	"assets/angular/core/templates/assets/fab.js",
	"assets/js/fab-init.js",
	"assets/js/navbar_fixed_secondary.js",
	"plugins/records/patient/assets/js/webcam-controller.js",
	"assets/js/plugins/ui/moment/moment.min.js",
	"assets/js/plugins/pickers/daterangepicker.js",
	"assets/js/jsbarcode.code128.min.js"
];

var themes = [
	"assets/js/core/app.min.js"
];

var angular = {"angular": "assets/angular/libraries/angular.min.js"};
var appDefaults = ["./consts.js", {"appDefaults": "assets/angular/core/defaults.js"}];
var app = {"app": "assets/angular/core/app.js"};
var angularLibraries = [
	"assets/angular/libraries/angular-route.min.js",
	"assets/angular/libraries/angular-toArrayFilter.min.js",
	"assets/angular/libraries/angular-animate.min.js",
	"assets/angular/libraries/angular-messages.min.js",
	"assets/angular/libraries/angular-cookies.min.js",
	"assets/angular/libraries/angular-sanitize.min.js",
	"assets/angular/libraries/angular-datatables.js",
	"assets/angular/libraries/angular-moment.min.js",
	// "assets/angular/libraries/angular-datatables.bootstrap.min.js",
	"assets/angular/libraries/ng-print/ngPrint.min.js",
	"assets/angular/libraries/ng-pagination/ng-pagination.min.js",
	"assets/angular/libraries/angular-datatables.buttons.min.js",
	"assets/angular/libraries/datatable-buttons/dataTables.buttons.min.js",
	"assets/angular/libraries/datatable-buttons/buttons.print.min.js",
	"assets/angular/libraries/datatable-buttons/buttons.html5.min.js",
	"assets/angular/libraries/datatable-buttons/buttons.bootstrap.min.js",
	"assets/angular/libraries/angular-datatables.fixedheader.js",
	"assets/angular/libraries/angular-dropzone.min.js",
	"assets/angular/libraries/ngStorage.min.js",
	"assets/angular/libraries/angular-bootstrap-calendar/angular-bootstrap-calendar-tpls.min.js"
]

// Load Files

head.load([jquery, bootstrap]);

head.ready(["jquery", "bootstrap"], function(){
	head.load(libraries);
	head.load(css);
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
	"assets/angular/core/controllers/chat-widget-controller.js",
	"plugins/mortuary/assets/controllers.js",
	"plugins/user/assets/controllers.js",
	"plugins/human-resources/assets/controllers.js",
	"plugins/human-resources/it/assets/controllers.js",
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
	"plugins/financial-audit/assets/controllers.js",
	"plugins/records/cloud/assets/controllers.js",
	"plugins/hmo/assets/controllers.js",
	"plugins/pharmacy/standalone-dispensory/assets/controllers.js",
	"plugins/user/pharmacy-setup/assets/controllers.js"
]

var services = [

]

head.ready("appDefaults", function(){
	head.load(cntrllers);
	head.load(services);
});