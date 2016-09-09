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
			var viewButtonAction = "functions.manageBody.viewBody("+data.BodyID+")";
			var deleteButtonAction = "functions.manageBody.deleteBody("+data.BodyID+")";

			var options = 
				" data-option-id='"+data.BodyID+
				"' data-option-tag='"+data.BodyTag+
				"' data-option-place-of-death='"+data.PlaceOfDeath+
				"' data-option-date-of-death='"+data.DateOfDeath+
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

			var viewButton = "<button class='btn btn-default' ng-click=\""+viewButtonAction+"\" "+options+"><i class='icon-eye'> </i> View</button>"
			var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+options+"><i class='icon-bin'></i> Delete</button>"
			var buttons = "<div class='btn-group'>"+viewButton+editButton+deleteButton+"</button>";
			
			return buttons;
		},
		manageBody:{
			newBodyRegistration:function(){
				$('#new-body-registration').modal('show');
			},
			bodyDeleted:function(){
				utils.alert("Operation Successful", "The selected body has been deleted successfully", "success", "notify");
				$scope.tempHolder = {};
				delete  $scope._id;

				$scope.dtInstance.reloadData();
			},
		

		editBody: function(id){
			$scope.temp = {
				bodyId:id,
				tag: $(".btn[data-option-id='"+id+"']").attr("data-option-tag"),
				placeOfDeath:$(".btn[data-option-id='"+id+"']").attr("data-option-place-of-death"),
				dateOfDeath:$(".btn[data-option-id='"+id+"']").attr("data-option-date-of-death"),
				dateOfBirth:$(".btn[data-option-id='"+id+"']").attr("data-option-date-of-birth"),
				fullName:$(".btn[data-option-id='"+id+"']").attr("data-option-fullname"),
				gender:$(".btn[data-option-id='"+id+"']").attr("data-option-gender"),
				nextOfKinFullName:$(".btn[data-option-id='"+id+"']").attr("data-option-next-of-kin-fullname"),
				nextOfKinAddress:$(".btn[data-option-id='"+id+"']").attr("data-option-next-of-kin-address"),
				nextOfKinRelationship:$(".btn[data-option-id='"+id+"']").attr("data-option-next-of-kin-relationship"),
				nextOfKinPhoneNumber:$(".btn[data-option-id='"+id+"']").attr("data-option-next-of-kin-phone-number"),
				depositorFullName:$(".btn[data-option-id='"+id+"']").attr("data-option-depositor-fullname"),
				depositorAddress:$(".btn[data-option-id='"+id+"']").attr("data-option-depositor-address"),
				depositorRelationship:$(".btn[data-option-id='"+id+"']").attr("data-option-depositor-relationship"),
				depositorPhoneNumber:$(".btn[data-option-id='"+id+"']").attr("data-option-depositor-phone-number")


			};
			$('#edit-body-details').modal('show');
		},
		viewBody: function(id){
			alert('view');
			$scope.temp = {
				bodyid:id,
				tag: $(".btn[data-option-id='"+id+"']").attr("data-option-tag"),
				placeOfDeath:$(".btn[data-option-id='"+id+"']").attr("data-option-place-of-death"),
				dateOfDeath:$(".btn[data-option-id='"+id+"']").attr("data-option-date-of-death"),
				dateOfBirth:$(".btn[data-option-id='"+id+"']").attr("data-option-date-of-birth"),
				fullName:$(".btn[data-option-id='"+id+"']").attr("data-option-fullname"),
				gender:$(".btn[data-option-id='"+id+"']").attr("data-option-gender"),
				nextOfKinFullName:$(".btn[data-option-id='"+id+"']").attr("data-option-next-of-kin-fullname"),
				nextOfKinAddress:$(".btn[data-option-id='"+id+"']").attr("data-option-next-of-kin-address"),
				nextOfKinRelationship:$(".btn[data-option-id='"+id+"']").attr("data-option-next-of-kin-relationship"),
				nextOfKinPhoneNumber:$(".btn[data-option-id='"+id+"']").attr("data-option-next-of-kin-phone-number"),
				depositorFullName:$(".btn[data-option-id='"+id+"']").attr("data-option-depositor-fullname"),
				depositorAddress:$(".btn[data-option-id='"+id+"']").attr("data-option-depositor-address"),
				depositorRelationship:$(".btn[data-option-id='"+id+"']").attr("data-option-depositor-relationship"),
				depositorPhoneNumber:$(".btn[data-option-id='"+id+"']").attr("data-option-depositor-phone-number")


			};
			console.log($scope.temp);
		},
		deleteBody: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete this body named "+$(".btn[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					console.log($scope._id);
					var deleteRequest = utils.serverRequest('/mortuary/body/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.manageBody.bodyDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			},
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
		DTColumnBuilder.newColumn('BodyNextOfKinFullName').withTitle('Next Of Kin'),
		DTColumnBuilder.newColumn('BodyStatus').withTitle('status'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkup)
	];

	$scope.loadBodyInfo = function(id){

	}

	$scope.saveEditBody = function(){
		var body = {
			resourceId: $scope.temp.bodyId,
			BodyTag: $scope.temp.tag,
			PlaceOfDeath: $scope.temp.plaeOfDeath,
			DateOfDeath: $scope.temp.dateOfDeath,
		};
		var bodyInformation = {
			BodyFullName: $scope.temp.bodyFullname,
			BodyDateOfBirth: $scope.temp.dateOfBirth,
			BodyGender: $scope.temp.gender,
			BodyNextOfKinFullName: $scope.temp.nextOfKinFullName,
			BodyNextOfKinAddress:$scope.temp.nextOfKinAddress,
			BodyNextOfKinRelationshipType:$scope.temp.nextOfKinRelationship,
			BodyNextOfKinPhoneNumber: $scope.temp.nextOfKinPhoneNumber,
		};
		var depositorDetails = {
			DepositorFullName: $scope.temp.depositorFullName,
			DepositorAddress: $scope.depositorAddress,
			DepositorRelationshipType:$scope.temp.depositorRelationship,
			DepositorPhoneNumber: $scope.temp.depositorPhoneNumber
		};
		//console.log(edits);
		var saveEditBody = utils.serverRequest('/mortuary/body/edit', 'PUT', body);
		saveEditBody.then(function(response){
			//alert('updated');
			console.log(saveEditBody);
			//functions.departmentEdited();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})

	}
	
	$scope.functions = functions;
	//console.log($scope.temp);
})