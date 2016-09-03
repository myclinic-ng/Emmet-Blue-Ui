angular.module('EmmetBlue')

.controller('newConsultationSheetRegistrationController', function($scope, $http, utils){
	$scope.utils = utils;
	$scope.consultationSheet = {};
	$scope.saveNewConsultationSheet = function(){
		var editorContent = $("#editor-inline").html();
		var title = $scope.consultationSheet.title;
		var consultantId = 1;
		var data = {
			"consultantId": consultantId,
			"note":editorContent,
			"title":title,
		}
		var newConsultationSheet = utils.serverRequest('/consultancy/consultation-sheet/new', 'post', data);
		newConsultationSheet.then(function(response){
			utils.alert('Operation Succesfull', 'Consultation Sheet Succesfully saved','success', 'notify');
			newConsultationSheet = {}
			$("#new-consultation-sheet").modal("hide");
		}, function(error){
			utils.errorHandler(error, true);
		});
	}
})

.controller('viewConsultationSheetController', function($scope, utils, DTOptionsBuilder, DTColumnBuilder){
	var functions = {
		actionsMarkup: function(){
		/*var editButtonAction = "manageDepartment('edit', "+data.DepartmentID+")";
		var deleteButtonAction = "manageDepartment('delete', "+data.DepartmentID+")";
		var roleManagementButtonAction = "manageDepartment('role-management', "+data.DepartmentID+")";

		var dataOpt = "data-option-id='"+data.DepartmentID+"' data-option-name='"+data.Name+"' data-option-group='"+data.GroupID+"'";

		var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
		var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";
		var viewButton = "<button class='btn btn-default'> View</button>";
		var roleManagementButton = "<button class='btn btn-default' ng-click=\""+roleManagementButtonAction+"\" "+dataOpt+"> Manage Roles</button>";

		var buttons = "<div class='btn-group'>"+viewButton+editButton+deleteButton+roleManagementButton+"</button>";
		return buttons;*/
		return "";
	},
	manageConsultationSheet:{
		newConsultationSheet: function(){
			$("#new-consultation-sheet").modal("show");
		}

	}
	/*newConsultationSheetCreated: function(){
		utils.alert('Operation Succesfull', 'Consultation Sheet Created Succesfully', 'success', 'info');

	}*/
	}

	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		var consultationSheets = utils.serverRequest('/consultancy/consultation-sheet/view', 'GET');
		return consultationSheets;
	})
	.withButtons([
		{
			text: '<u>N</u>ew  Consultation Sheet',
			action: function(){
				functions.manageConsultationSheet.newConsultationSheet();
			},
			key : {
				key: 'n',
				ctrlKey: true,
				altKey: true
			},

		},
		{
	    	extend: 'print',
	    	text: '<u>P</u>rint this data page',
	    	key: {
	    		key: 'p',
	    		ctrlKey: true,
	    		altKey: true
	    	}
        },
        {
        	extend: 'copy',
        	text: '<u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: true,
        	}
        }
	]);	
	$scope.dtColumns = [
		DTColumnBuilder.newColumn('ConsultationSheetID').withTitle('Sheet ID'),
		DTColumnBuilder.newColumn('ConsultantID').withTitle('Consultant'),
		DTColumnBuilder.newColumn('Title').withTitle('Title'),
		DTColumnBuilder.newColumn('CreationDate').withTitle('Date and Time'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkup)
	];

	
})