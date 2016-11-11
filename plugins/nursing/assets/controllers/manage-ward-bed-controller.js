angular.module("EmmetBlue")

// wards and section controller

.controller('manageWardBedsController', function($scope,utils, DTOptionsBuilder, DTColumnBuilder){
	var functions = {
		actionsMarkup: function(meta, full, data){
			var manageSectionsButtonAction = "functions.manageWard.manageSections("+data.WardID+")";

			var options = "data-option-id='"+data.WardID+"' data-option-ward-name='"+data.WardName+"' data-option-ward-desc='"+data.WardDescription+"'";
			var manageSectionsButton = "<button class='btn btn-default' ng-click=\""+manageSectionsButtonAction+"\" "+options+"><i class='fa fa-puzzle-piece'></i> Sections</button>"
			var buttons = "<div class='btn-group'>"+manageSectionsButton+"</button>";
			
			return buttons;
		},
		manageWard:{
			viewAllBeds: function(){
				$("#view_all_bed_assignment").modal('show');
			},
			manageSections: function(id){
				var data = {
					name: $(".btn[data-option-id='"+id+"']").attr('data-option-ward-name'),
					id: id
				}
				utils.storage.sectionManagementData = data;
				$("#section-bed-assignment").modal("show");
			}
		}
	}


	$scope.dtInstance = {};
	$scope.temp= {};
	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		var ward = utils.serverRequest('/nursing/ward/view', 'GET');
		return ward;
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
			text: '<i class="icon-eye"> </i> <u>V</u>iew All Beds',
			action: function(){
				functions.manageWard.viewAllBeds();
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
		DTColumnBuilder.newColumn('WardID').withTitle('Ward ID'),
		DTColumnBuilder.newColumn('WardName').withTitle('Ward Name'),
		DTColumnBuilder.newColumn('WardDescription').withTitle('Ward Description'),
		//DTColumnBuilder.newColumn('CreatedDate').withTitle('Date Created'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkup)
	];

	$scope.functions = functions;
})