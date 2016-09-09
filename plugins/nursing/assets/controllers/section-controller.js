angular.module("EmmetBlue")

// wards and section controller

.controller('sectionController', function($scope,utils, DTOptionsBuilder, DTColumnBuilder){
	var functions = {
		actionsMarkup: function(){
			return "";
		},
		manageSection:{
			newSection: function(){
				$("#new-section").modal("show");
			},
			newSectionCreated: function(){
				utils.alert('Operation Succesful', 'New Ward Created', 'success', 'notify');
				$scope.newSection = {};
				$("#new-ward").modal("hide");
			}
		}
	}




	$scope.dtInstance = {};
	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		var wardSection = utils.serverRequest('/nursing/ward-section/view', 'GET');
		return wardSection;
	})
	.withOption('createdRow', function(row, data, dataIndex){
		utils.compile(angular.element(row).contents())($scope);
	})
	.withOption('headerCallback', function(header) {
        if (!$scope.headerCompiled) {
            $scope.headerCompiled = true;
            utils.compile(angular.element(header).contents())($scope);
        }
    })
	.withButtons([
		{
			text: '<i class="icon-file-plus"></i> <u>N</u>ew  Section',
			action: function(){
				functions.manageSection.newSection();
			},
			key : {
				key: 'n',
				ctrlKey: true,
				altKey: true
			},

		},
		{
	    	extend: 'print',
	    	text: '<i class="icon-printer"></i> <u>P</u>rint this data page',
	    	key: {
	    		key: 'p',
	    		ctrlKey: true,
	    		altKey: true
	    	}
        },
        {
        	extend: 'copy',
        	text: '<i class="icon-copy"></i> <u>C</u>opy this data',
        	key: {
        		key: 'c',
        		ctrlKey: true,
        	}
        }
	]);	
	$scope.dtColumns = [
		DTColumnBuilder.newColumn('WardSectionID').withTitle('Section ID'),
		DTColumnBuilder.newColumn('WardSectionName').withTitle('Ward Name'),
		DTColumnBuilder.newColumn('WardSectionDescription').withTitle('Ward Description'),
		DTColumnBuilder.newColumn('WardName').withTitle('Ward'),
		DTColumnBuilder.newColumn('CreatedDate').withTitle('Date Created'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkup)
	];

	$scope.saveNewSection = function(){
		var newSection = $scope.sectionRegistration
		ward = utils.serverRequest('/nursing/ward-section/new', 'post', newSection);
		ward.then(function(response){
			functions.manageSection.newSectionCreated();
			$scope.dtInstance.reloadData();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
})