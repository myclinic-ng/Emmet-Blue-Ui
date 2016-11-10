angular.module("EmmetBlue")

//bed assignment controller

.controller('bedsAssignmentController', function($scope,utils, DTOptionsBuilder, DTColumnBuilder){
	$scope.startWatching = false;
	$scope.$watch(function(){
		return utils.storage.bedManagementData
	}, function(newValue){
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
			var leasedBedAction = "functions.manageBedAssignment.assignBed("+data.BedAssignmentID+")";
			var unleasedBedAction = "functions.manageBedAssignment.unAssignBed("+data.BedAssignmentID+")";
			var deleteBedAction = "functions.manageBedAssignment.deleteAssignedBed("+data.BedAssignmentID+")";
			var options = 	"data-option-id='"+data.BedAssignmentID+
							"' data-option-bed-name='"+data.BedName+
							"' data-option-bed-status='"+data.AssignmentLeased+
							"' data-option-bed-leased-date='"+data.AssignmentDate+"'";

			var leasedButton = "<button class='btn btn-default' ng-click=\""+leasedBedAction+"\" "+options+"><i class='fa fa-sign-in'></i> Lease Bed</button>"
			var unleasedButton = "<button class='btn btn-default' ng-click=\""+unleasedBedAction+"\" "+options+"><i class='fa fa-sign-out'></i> Unlease Bed</button>"
			var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteBedAction+"\" "+options+"><i class='icon-bin'></i></button>"
			if(data.AssignmentLeased==0){
			var leasedBedButton = leasedButton;
			}else{
			var leasedBedButton = unleasedButton;

			}
			var buttons = "<div class='btn-group'>"+leasedBedButton+deleteButton+"</button>";
			
			return buttons;
		},
		manageBedAssignment:{
			newBedAssignment: function(){
				$scope.loadSectionBed();
				$("#new_bed_assignment").modal('show');
			},
			assignBed: function(id){
				var data = {
					resourceId: id,
					AssignmentLeased:1
				}
				var leaseBed = utils.serverRequest('/nursing/bed-assignment/edit', 'PUT', data);
				leaseBed.then(function(response){
					functions.manageBedAssignment.bedAssigned()
				}, function(responseObject){
					utils.errorHandler(responseObject);
				})
			},
			unAssignBed: function(id){
				var data = {
					resourceId: id,
					AssignmentLeased:0
				}
				var leaseBed = utils.serverRequest('/nursing/bed-assignment/edit', 'PUT', data);
				leaseBed.then(function(response){
					functions.manageBedAssignment.bedUnAssigned(id);
				}, function(responseObject){
					utils.errorHandler(responseObject);
				})
			},
			bedAssigned: function(id){
				utils.alert("Operation Successful", "This bed has been assigned successfully", "success", "notify");
				$scope.dtInstance.reloadData();
			},
			bedUnAssigned:function(id){
				utils.alert("Operation Successful", "This bed has been Unassigned successfully", "success", "notify");
				$scope.dtInstance.reloadData();
			},
			newBedAssignmentCreated: function(){
				
				utils.alert("Operation Successful", "New Bed Created", "success", "notify");
				$("#new_bed_assignment").modal('hide');
				$scope.dtInstance.reloadData();
			},
			assignedBedDeleted: function(){
				utils.alert("Operation Successful", "Assigned Bed Deleted", "success", "notify");
				$scope.dtInstance.reloadData();
			},
			deleteAssignedBed: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete this body named "+$(".btn[data-option-id='"+id+"']").attr('data-option-bed-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/bed-assignment/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.manageBedAssignment.assignedBedDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			}
		}
	}


	$scope.dtInstance = {};
	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		var beds = utils.serverRequest('/nursing/bed-assignment/view-section-beds?resourceId='+$scope.wardId, 'GET');
		return beds;
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
			text: '<i class="icon-file-plus"> </i> <u>C</u>reate New Bed Assignment',
			action: function(){
				functions.manageBedAssignment.newBedAssignment();
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
		DTColumnBuilder.newColumn('BedName').withTitle('Bed Name'),
		DTColumnBuilder.newColumn(null).withTitle('Lease Status').renderWith(function(meta, full, data){
			if(data.AssignmentLeased==1){
				return "<div class='badge badge-success'>Leased</div>";
			}else{
				return "<div class='badge badge-info'>Free Bed</div>";
			}
		}),
		DTColumnBuilder.newColumn('AssignmentDate').withTitle('Date Assigned'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkup)
	];

	$scope.loadSectionBed = function(){
		var beds = utils.serverRequest('/nursing/sectionBed/view', 'GET');
		beds.then(function(response){
			return $scope.bed  = response;
		}, function(responseObject){
			utils.errorHandler();
		})
	}

	$scope.saveNewBedAssignment = function(){
		$(".loader").addClass('show');
		var newBedAssignment = {
			bedName: $scope.bedName,
			assignmentLeased: 0
		}
		newBed = utils.serverRequest('/nursing/bed-assignment/new', 'post', newBedAssignment);
		newBed.then(function(response){
			newBedAssignment = {}
			$(".loader").removeClass('show');
			functions.manageBedAssignment.newBedAssignmentCreated();
		}, function(responseObject){
			$(".loader").removeClass('show');
			utils.errorHandler(responseObject);
		})
	}

	$scope.manageEditBedAssignment = function(id){
		functions.manageBedAssignment.editBedAssignment(id);
	}
	$scope.saveEditBedAssignment = function(){
		var edits = {
			resourceId: $scope.temp.id,
			BedAssignmentName: $scope.temp.name,
			BedAssignmentDescription:$scope.temp.desc
		}
		$(".loader").addClass('show');
		var saveEdits = utils.serverRequest('/nursing/ward/edit', 'PUT', edits);
		saveEdits.then(function(response){
			$(".loader").removeClass('show');
			functions.manageBedAssignment.wardEdited();
		}, function(responseObject){
			$(".loader").removeClass('show');
			utils.errorHandler(responseObject);
		})
	}

	$scope.functions = functions;
})