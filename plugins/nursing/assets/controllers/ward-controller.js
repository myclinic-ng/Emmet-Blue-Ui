angular.module("EmmetBlue")

// wards and section controller

.controller('wardController', function($scope,utils, DTOptionsBuilder, DTColumnBuilder){
	var functions = {
		actionsMarkup: function(){
			return "";
		},
		manageWard:{
			newWard: function(){
				$("#new-ward").modal("show");
			},
			newWardCreated: function(){
				utils.alert('Operation Succesful', 'New Ward Created', 'success', 'notify');
				$scope.newWard = {};
				$("#new-ward").modal("hide");
			}
		}
	}





	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		var consultationSheets = utils.serverRequest('/nursing/ward/view', 'GET');
		return consultationSheets;
	})
	.withButtons([
		{
			text: '<u>N</u>ew  Ward',
			action: function(){
				functions.manageWard.newWard();
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
		DTColumnBuilder.newColumn('WardID').withTitle('Ward ID'),
		DTColumnBuilder.newColumn('WardName').withTitle('Ward Name'),
		DTColumnBuilder.newColumn('WardDescription').withTitle('Ward Description'),
		DTColumnBuilder.newColumn('CreatedDate').withTitle('Date Created'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkup)
	];

	$scope.saveNewWard = function(){
		var newWard = $scope.wardRegistration
		ward = utils.serverRequest('/nursing/ward/new', 'post', newWard);
		ward.then(function(response){
			functions.manageWard.newWardCreated();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
})