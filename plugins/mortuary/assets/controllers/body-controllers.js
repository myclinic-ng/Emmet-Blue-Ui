angular.module("EmmetBlue")

.controller('mortuaryBodyRegistrationController', function($scope, $http, utils){
	$scope.utils = utils;

	var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function(i, str) {
                if (substrRegex.test(str)) {

                    // the typeahead jQuery plugin expects suggestions to a
                    // JavaScript object, refer to typeahead docs for more info
                    matches.push({ value: str });
                }
            });
            cb(matches);
        };
    };

    // Data
    var dataRequest = utils.serverRequest('/mortuary/tags/view', 'GET');

    dataRequest.then(function(success){
    	var data = [];
    	angular.forEach(success, function(value){
    		data.push(value.TagName);
    	});

    	$('.tagsinput-typeahead').tagsinput('input').typeahead(
	        {
	            hint: true,
	            highlight: true,
	            minLength: 1
	        },
	        {
	            name: 'tags',
	            displayKey: 'value',
	            source: substringMatcher(data)
	        }
	    ).bind('typeahead:selected', $.proxy(function (obj, datum) {  
	        this.tagsinput('add', datum.value);
	        this.tagsinput('input').typeahead('val', '');
	    }, $('.tagsinput-typeahead')));
	
    }, function(error){
    	utils.errorHandler(error);
    })
    
	$scope.submit = function(){
		$scope.body.tag = $scope.body.tag.split(",");
		var body = utils.serverRequest('/mortuary/body/new', 'post', $scope.body);
		body.then(function(response){
			utils.alert('Operation Successful', 'The Registration of body number was completed successfully', 'success', 'both');
			$scope.body = {};
			dtInstance = dtInstance.reloadData();
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
			var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+options+"><i class='icon-pencil5'></i> </button>";

			var viewButton = "<button class='btn btn-default' ng-click=\""+viewButtonAction+"\" "+options+"><i class='icon-eye'> </i> </button>";
			var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+options+"><i class='icon-bin'></i> </button>";
			var logOutButton = "<button class='btn btn-default' ng-click=\""+logOutButton+"\" "+options+">Log Out Body</button>";
			var buttons = "<div class='btn-group'>"+viewButton+editButton+deleteButton+logOutButton+"</button>";
			
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
			bodyloggedOut:function(){
				utils.alert("Operation Successful", "The selected body has been logged Out successfully", "success", "notify");
				$scope.tempHolder = {};
				//delete  $scope._id;

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
			$scope.temp = {
				bodyid:id,
				tag: $(".btn[data-option-id='"+id+"']").attr("data-option-tag"),
				bodyStatus: $(".btn[data-option-id='"+id+"']").attr("data-option-body-status"),
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
			$("#view-each-body").modal('show');
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
			logOutBody:function(id){
				var title = "Log Out Prompt";
				var text = "You are about to Log Out this body named "+$(".btn[data-option-id='"+id+"']").attr('data-option-fullName')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					console.log($scope._id);
					var data = {"resourceId":$scope._id}
					var logOutRequest = utils.serverRequest('/mortuary/body/logoutbody', 'PUT', data);

					logOutRequest.then(function(response){
						functions.manageBody.bodyloggedOut();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Log Out";

				utils.confirm(title, text, close, callback, type, btnText);
				
			}
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
			text:'<i class="icon-user-plus"></i> <u>N</u>ew Body',
			action:function(){
				functions.manageBody.newBodyRegistration();
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
		DTColumnBuilder.newColumn('BodyID').withTitle('Body ID'),
		DTColumnBuilder.newColumn(null).withTitle('Tags').renderWith(function(meta, full, data){
			return data.Tags.join(", ");
		}),
		DTColumnBuilder.newColumn('BodyFullName').withTitle('Full Name'),
		DTColumnBuilder.newColumn('DateOfDeath').withTitle('Date Of Death'),
		DTColumnBuilder.newColumn('CreationDate').withTitle('Date Registered'),
		DTColumnBuilder.newColumn('DepositorFullName').withTitle('Depositor'),
		DTColumnBuilder.newColumn(null).withTitle('<i class="icon-home"></i> Status').renderWith(function(meta, full, data){
			if (data.BodyStatus == 0){
				return "<div class='badge badge-success'>LOGGED OUT</div>";
			}
			else if (data.BodyStatus == 1){
				return "<div class='badge badge-info'>LOGGED IN</div>";
			}
			else {
				return "<div class='badge badge-danger'>UNKNOWN</div>";
			}
		}),
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

			BodyFullName: $scope.temp.bodyFullname,
			BodyDateOfBirth: $scope.temp.dateOfBirth,
			BodyGender: $scope.temp.gender,
			BodyNextOfKinFullName: $scope.temp.nextOfKinFullName,
			BodyNextOfKinAddress:$scope.temp.nextOfKinAddress,
			BodyNextOfKinRelationshipType:$scope.temp.nextOfKinRelationship,
			BodyNextOfKinPhoneNumber: $scope.temp.nextOfKinPhoneNumber,

			DepositorFullName: $scope.temp.depositorFullName,
			DepositorAddress: $scope.depositorAddress,
			DepositorRelationshipType:$scope.temp.depositorRelationship,
			DepositorPhoneNumber: $scope.temp.depositorPhoneNumber
		};
		console.log(body);
		/*var saveEditBody = utils.serverRequest('/mortuary/body/edit', 'PUT', body);
		saveEditBody.then(function(response){
			//alert('updated');
			console.log(saveEditBody);
			//functions.departmentEdited();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})*/

	}
	
	$scope.functions = functions;
	//console.log($scope.temp);
})