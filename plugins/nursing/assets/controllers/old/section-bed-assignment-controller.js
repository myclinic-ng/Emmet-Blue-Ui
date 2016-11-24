angular.module("EmmetBlue")

// wards and section controller

.controller('sectionBedAssignmentController', function($scope,utils, DTOptionsBuilder, DTColumnBuilder){
	$scope.startWatching = false;
	$scope.$watch(function(){
		return utils.storage.sectionManagementData
	}, function(newValue){
		//console.log(newValue);
		$scope.wardName = newValue.name;
		$scope.wardId = newValue.id;

		if (!$scope.startWatching){
			$scope.startWatching = true;
		}
		else{
			$scope.dtInstance.reloadData();
		}
	})
	var functions = {
		actionsMarkup: function(meta, full, data){
			var assignBedButtonAction = "functions.manageAssignSectionBeds.assignBeds("+data.WardSectionID+")";

			var options = "data-option-id='"+data.WardSectionID+
							"' data-option-section-name='"+data.WardSectionName+
							"' data-option-section-desc='"+data.WardSectionDescription+
							"' data-option-section-ward-id='"+data.WardID+
							"' data-option-section-ward-name='"+data.WardName+
							"' ";

			var assignBedButton = "<button class='btn btn-default' ng-click=\""+assignBedButtonAction+"\""+options+"><i class='fa fa-bed'></i> Assign Beds</button>";
			return "<div class='btn-group'>"+assignBedButton+"</div>";
		},
		manageAssignSectionBeds:{
			
			assignBeds: function(id){
				var data = {
					name: $(".btn[data-option-id='"+id+"']").attr('data-option-section-name'),
					id: id
				}
				utils.storage.bedManagementData = data;
				$("#bed_assignment").modal("show");
			}
		}
	}

	$scope.dtInstance = {};
	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		var wardSection = utils.serverRequest('/nursing/ward-section/view?resourceId='+$scope.wardId, 'GET');
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
		DTColumnBuilder.newColumn('WardSectionName').withTitle('Section Name'),
		DTColumnBuilder.newColumn('WardSectionDescription').withTitle('Section Description'),
		//DTColumnBuilder.newColumn('WardName').withTitle('Ward'),
		//DTColumnBuilder.newColumn('CreatedDate').withTitle('Date Created'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkup)
	];
	$scope.functions = functions;
})