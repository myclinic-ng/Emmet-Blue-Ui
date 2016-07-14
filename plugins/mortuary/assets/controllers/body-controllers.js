angular.module("EmmetBlue")

.controller('mortuaryBodyRegistrationController', function($scope, $http, utils){
	$scope.utils = utils;
	
	$scope.submit = function(){
		var body = utils.serverRequest('/mortuary/body/new', 'post', $scope.body);
		
		body.then(function(response){
			$scope.bodyInformation.id = response.lastInsertId;
			utils.alert('Operation in progress', 'Registration ID was generated successfully, please hold on while we save the information', 'info', 'notify');
			utils.serverRequest('/mortuary/body/new-body-info', 'post', $scope.bodyInformation).then(function(response){
				utils.alert('Operation Successful', 'The Registration of body number '+$scope.bodyInformation.id+' was completed successfully', 'success', 'both');
				$scope.body = {};
				$scope.bodyInformation = {};
			}, function(error){
				utils.errorHandler(error, true);
			});
		}, function(error){
			utils.errorHandler(error, true);
		});
	}
})

.controller('mortuaryViewBodyController', function($scope, utils, DTOptionsBuilder, DTColumnBuilder){	
	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/mortuary/body/view?resourceId=0', 'get', {});
	})	
	.withButtons([
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
		DTColumnBuilder.newColumn('BodyID').withTitle('Body ID'),
		DTColumnBuilder.newColumn('BodyTag').withTitle('Body Tag'),
		DTColumnBuilder.newColumn('DateOfDeath').withTitle('Date Of Death'),
		DTColumnBuilder.newColumn('TimeOfDeath').withTitle('Time Of Death'),
		DTColumnBuilder.newColumn('PlaceOfDeath').withTitle('Place Of Death'),
		DTColumnBuilder.newColumn('BurialPlace').withTitle('Burial Place'),
		DTColumnBuilder.newColumn('DeathPhysicianName').withTitle('Physician'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(actionsMarkup)
	];

	$scope.loadBodyInfo = function(id){
		console.log('ckicked');
		alert("Sam");
	}

	function actionsMarkup(data, type, full, meta){
		var markup = '<div class="btn-group">'+
					 '<button type="button" class="btn btn-warning" ng-click="cntrller.loadBodyInfo(2)"><i class="icon icon-profile"></i> View Info</button>'+
					 '</div>';

		return markup;
	};

});