angular.module("EmmetBlue")

	.controller('observationChartFieldTitleTypeRegistration', function($scope, utils){
		$scope.utils = utils;

		$scope.submit = function(){
			//console.log($scope.newObservationChart);
			var fieldTitleType = utils.serverRequest('/Nursing/observation-chart-field-title-type/new', 'post', $scope.newObservationChart);

			fieldTitleType.then(function(response){
				$scope.type = response;
				//console.log($scope.type.TypeName);
				utils.alert('Operation Successful', 'The Registration of Type Name was completed successfully', 'success', 'both');
				$scope.dtInstance.reloadData();
				$('#new-observation-chart-title-type').modal('hide');
			}, function(responseObject){
			utils.errorHandler(responseObject);
		})
		}
	})

	.controller('viewObservationChartFieldTitleType', function($scope, utils, DTOptionsBuilder, DTColumnBuilder){	
		$scope.dtInstance = {};
	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/nursing/observation-chart-field-title-type/view?resourceId=0', 'get', {});
	})	
	.withButtons([
		{
			text: '<i class="icon-file-plus"> </i> <u>N</u>ew Observation Type',
			action: function(){
				functions.newObservationChartType();
			}
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
		DTColumnBuilder.newColumn('TypeID').withTitle('ID'),
		DTColumnBuilder.newColumn('TypeName').withTitle('Name'),
		DTColumnBuilder.newColumn('TypeDescription').withTitle('Description'),
		//DTColumnBuilder.newColumn('PlaceOfDeath').withTitle('Place Of Death'),
		//DTColumnBuilder.newColumn('DeathPhysicianID').withTitle('Physician'),
		//DTColumnBuilder.newColumn('DeathPhysicianID').withTitle('Physician'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(actionsMarkup)
	];

	$scope.loadBodyInfo = function(id){

	}

	function actionsMarkup(data, type, full, meta){
		var markup = '<div class="btn-group">'+
					 '<button type="button" class="btn btn-warning" ng-click="cntrller.loadBodyInfo(2)"><i class="icon icon-profile"></i> View Info</button>'+
					 '</div>';

		return markup;
	};
	var functions = {
		newObservationChartType: function(){
			$('#new-observation-chart-title-type').modal('show');
		}
	}

});

	