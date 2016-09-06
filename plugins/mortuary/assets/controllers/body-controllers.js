angular.module("EmmetBlue")

.controller('mortuaryBodyRegistrationController', function($scope, $http, utils){
	$scope.utils = utils;
	
	$scope.submit = function(){
		//console.log($scope.body);
		var body = utils.serverRequest('/mortuary/body/new', 'post', $scope.body);

		body.then(function(response){
			//console.log(response);
			utils.alert('Operation Successful', 'The Registration of body number was completed successfully', 'success', 'both');
			$scope.body = {};
			//dtInstance = dtInstance.reloadData();
			$('#new-body-registration').modal('hide');
		}, function(error){
			utils.errorHandler(error, true);
		});
	
	}
})

.controller('mortuaryViewBodyController', function($scope, utils, DTOptionsBuilder, DTColumnBuilder){
	var functions = {
		actionsMarkup: function(meta, full, data){
			var editButtonAction = "functions.manageBody.editBody("+data.BodyID+")";

			var options = "data-option-id='"+data.BodyID+"'";
			var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+options+"><i class='icon-pencil5'></i> Edit</button>";

			var buttons = "<div class='btn-group'>"+editButton+"</button>";
			
			return buttons;
		},
		manageBody:{
			newBodyRegistration:function(){
				$('#new-body-registration').modal('show');
			}
		},

		editBody: function(id){
			console.log(id);
			alert(id);
		}
	}
	

	$scope.dtInstance = {};	
	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/mortuary/body/view?resourceId=0', 'get', {});
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
			text:'<u>N</u>ew Body',
			action:function(){
				functions.manageBody.newBodyRegistration();
			}
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
		DTColumnBuilder.newColumn('BodyFullName').withTitle('Body Name'),
		DTColumnBuilder.newColumn('DateOfDeath').withTitle('Age'),
		DTColumnBuilder.newColumn('DepositorFullName').withTitle('Depositor'),
		DTColumnBuilder.newColumn('DepositorPhoneNumber').withTitle('Depositor Phone Number'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkup)
	];

	$scope.loadBodyInfo = function(id){

	}
	
	$scope.manageEditBody = function(id){
		console.log(id);
		//functions.manageBody.editBody(id);
	}
	console.log(functions.actionsMarkup)
//scope.functions = functions;
})