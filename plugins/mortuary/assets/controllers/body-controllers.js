angular.module("EmmetBlue")
.
.controller('mortuaryBodyRegistrationController', function($scope, $http, utils){
	$scope.utils = utils;
	
	$scope.submit = function(){
		//console.log($scope.body);
		var body = utils.serverRequest('/mortuary/body/new', 'post', $scope.body);

		body.then(function(response){
			utils.alert('Operation Successful', 'The Registration of body number was completed successfully', 'success', 'both');
			$scope.body = {};
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
        	extend: ''
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
		DTColumnBuilder.newColumn('BodyID').withTitle('Body ID'),
		DTColumnBuilder.newColumn('BodyTag').withTitle('Body Tag'),
		DTColumnBuilder.newColumn('DateOfDeath').withTitle('Date Of Death'),
		DTColumnBuilder.newColumn('PlaceOfDeath').withTitle('Place Of Death'),
		DTColumnBuilder.newColumn('DeathPhysicianID').withTitle('Physician'),
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

});