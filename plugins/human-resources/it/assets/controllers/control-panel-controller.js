angular.module("EmmetBlue")

.controller("itControlPanelController", function($scope, utils){
	$scope.current = {
		segmentUrl: "",
		segmentName: ""
	}

	$scope.departments = [
		{	
			"name":"Control Panel Home",
			"icon":"fa fa-home",
			"url": "plugins/human-resources/it/assets/includes/control-panel/cpanel_index.html"
		},
		{
			"name":"Patient Information Management",
			"icon":"fa fa-user",
			"url":"plugins/human-resources/it/assets/includes/control-panel/patient_info_dept.html"
		},
		{
			"name":"Billing, Invoicing and Transaction Items Linking",
			"icon":"fa fa-unlink",
			"url":"plugins/human-resources/it/assets/includes/control-panel/main_acct_dept.html"
		},
		{
			"name":"Nursing and Ward Management",
			"icon":"fa fa-hotel",
			"url":"plugins/human-resources/it/assets/includes/control-panel/nursing_ward_dept.html"
		},
		{
			"name":"Laboratory Management",
			"icon":"fa fa-flask",
			"url":"plugins/human-resources/it/assets/includes/control-panel/lab_dept.html"
		},
		{
			"name":"Dispensory, Pharmacy/Store And Inventory Management",
			"icon":"fa fa-archive",
			"url":"plugins/human-resources/it/assets/includes/control-panel/pharmacy_dept.html"
		}
	];

	$scope.load = function(department){
		$scope.current.segmentUrl = department.url;
		$scope.current.segmentName = department.name;
	}

	$scope.load($scope.departments[0]);
})