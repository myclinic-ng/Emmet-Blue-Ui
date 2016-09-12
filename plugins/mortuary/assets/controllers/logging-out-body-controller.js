angular.module("EmmetBlue")
.controller('logOutBodyController', function(utils, $scope, DTOptionsBuilder, DTColumnBuilder){
	var functions = {
		actionsMarkup: function(meta, full, data){
			var editButtonAction = "functions.manageBody.editBody("+data.BodyID+")";
			var viewButtonAction = "functions.manageBody.viewBody("+data.BodyID+")";
			var deleteButtonAction = "functions.manageBody.deleteBody("+data.BodyID+")";
			var logOutButton = "functions.manageBody.logOutBody("+data.BodyID+")"

			var options = 
				" data-option-id='"+data.BodyID+
				"' data-option-tag='"+data.BodyTag+
				"' data-option-place-of-death='"+data.PlaceOfDeath+
				"' data-option-date-of-death='"+data.DateOfDeath+
				"' data-option-body-status='"+data.BodyStatus+
				"' data-option-date-of-birth='"+data.BodyDateOfBirth+
				"' data-option-fullname='"+data.BodyFullName+
				"' data-option-gender='"+data.BodyGender+
				"' data-option-next-of-kin-fullname='"+data.BodyNextOfKinFullName+
				"' data-option-next-of-kin-address='"+data.BodyNextOfKinAddress+
				"' data-option-next-of-kin-relationship='"+data.BodyNextOfKinRelationshipType+
				"' data-option-next-of-kin-phone-number='"+data.BodyNextOfKinPhoneNumber+
				"' data-option-depositor-fullname='"+data.DepositorFullName+
				"' data-option-depositor-address='"+data.DepositorAddress+
				"' data-option-depositor-relationship='"+data.DepositorRelationshipType+
				"' data-option-depositor-phone-number='"+data.DepositorPhoneNumber+
				"' ";
			var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+options+"><i class='icon-pencil5'></i> Edit</button>";

			var viewButton = "<button class='btn btn-default' ng-click=\""+viewButtonAction+"\" "+options+"><i class='icon-eye'> </i> View</button>";
			var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+options+" disabled='disabled'><i class='icon-bin'></i> Delete</button>";
			var logOutButton = "<button class='btn btn-default' ng-click=\""+logOutButton+"\" "+options+">Log Out Body</button>";
			var buttons = "<div class='btn-group'>"+viewButton+editButton+deleteButton+logOutButton+"</button>";
			
			return buttons;
		}
	}
	$scope.utils = utils;
	$scope.dtInstance = {};	
	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/mortuary/body/view-logged-out-Body', 'get', {});
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
		DTColumnBuilder.newColumn('BodyNextOfKinFullName').withTitle('Next Of Kin'),
		DTColumnBuilder.newColumn('BodyStatus').withTitle('status'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkup)
	];

})