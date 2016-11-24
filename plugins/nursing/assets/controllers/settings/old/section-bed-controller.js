angular.module("EmmetBlue")

//section beds controller
.controller("sectionBedController", function($scope, utils){
	$scope.startWatching = false;
	$scope.$watch(function(){
		return utils.storage.bedManagementData
	}, function(newValue){
		//console.log(newValue);
		$scope.sectionName = newValue.name;
		$scope.sectionId = newValue.id;

		if (!$scope.startWatching){
			$scope.startWatching = true;
		}
		else{
			$scope.reloadSectionBedTable();
		}
	})
	var functions = {
		actionMarkUps: {
			bedActionMarkUp: function(data, full, meta, type){
				editButtonAction = "manageSectionBed('edit',"+data.SectionBedID+")";
				deleteButtonAction = "manageSectionBed('delete',"+data.SectionBedID+")";
				var dataOpt = "data-option-id='"+data.SectionBedID+
							"' data-option-bed-name='"+data.BedName+
							"' data-option-bed-description='"+data.BedDescription+
							"'";
				editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
				deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";
				viewButton = "<button class='btn btn-default'><i class='fa fa-eye'></i> </button>"
				return "<button class='btn-group'>"+viewButton+editButton+deleteButton+"</button>";
			}
		},
		newBedCreated: function(){
			utils.alert("Operation Successful", "You have successfully created a new bed", "success", "notify");
			$scope.newBed = {};
			$scope.reloadSectionBedTable();
			$("#new_bed").modal("hide");
		},
		bedDeleted: function(){
			utils.alert("Operation Successful", "The selected bed has been deleted successfully", "success", "notify");
			delete  $scope._id;

			$scope.reloadSectionBedTable();
		},
		bedEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$scope.reloadSectionBedTable();
			$("#edit_bed").modal("hide");
			},
		manageBed:{
			editBed: function(id){
				var bedName = $(".btn[data-option-id='"+id+"']").attr('data-option-bed-name');
				var bedDesc = $(".btn[data-option-id='"+id+"']").attr('data-option-bed-description');
				//var bedId = $(".btn[data-option-id='"+id+"']").attr('data-option-section-id');
				$scope.temp = {
					id:id,
					bedName: bedName,
					bedDescription: bedDesc
				};
				console.log(bedName);
				$("#edit_bed").modal("show");
			},
			newBed: function(){
				$("#new_bed").modal("show");
			},
			deleteBed: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete the Bed named "+$(".btn[data-option-id='"+id+"']").attr('data-option-bed-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/section-bed/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.bedDeleted();
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



	$scope.ddtInstance = {};

	$scope.ddtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var roles = utils.serverRequest('/nursing/section-bed/view-section-bed?resourceId='+$scope.sectionId, 'GET');
		return roles;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
	.withFixedHeader()
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
			text: '<i class="icon-file-plus"></i> New Bed',
			action: function(){
				functions.manageBed.newBed();
			}
		}
	]);	

	$scope.ddtColumns = [
		utils.DT.columnBuilder.newColumn('SectionBedID').withTitle("ID").withOption('width', '0.5%').notSortable(),
		utils.DT.columnBuilder.newColumn('BedName').withTitle("Bed Name"),
		utils.DT.columnBuilder.newColumn("BedDescription").withTitle("Bed Description"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkUps.bedActionMarkUp).notSortable()
	];

	$scope.reloadSectionBedTable = function(){
		$scope.ddtInstance.reloadData();
	}
	$scope.saveNewBed = function(){
		var newBed = $scope.newBed;
		newBed.wardSectionId = $scope.sectionId;
		$('.loader').addClass('show');
		var bed = utils.serverRequest("/nursing/section-bed/new", "POST", newBed);
		bed.then(function(response){
			$('.loader').removeClass('show');
			functions.newBedCreated();
		}, function(responseObject){
			$('.loader').removeClass('show');
			errorHandler(responseObject);
		})
	}
	$scope.manageSectionBed = function(manageGroup, id){
		switch(manageGroup.toLowerCase()){
			case "edit":{
				functions.manageBed.editBed(id);
				break;
			}
			case "delete":{
				functions.manageBed.deleteBed(id);
				break;
			}
			case "role-management":{
				functions.manageRole.roleManagement(id);
				break;
			}
		}
	}
	$scope.saveEditBed = function(){
		var edits = {
			resourceId: $scope.temp.id,
			//WardID: $scope.temp.wardId,
			BedName: $scope.temp.bedName,
			BedDescription: $scope.temp.bedDescription
		}
		$('.loader').addClass('show');
		var saveEdits = utils.serverRequest('/nursing/section-bed/edit', 'PUT', edits);
		saveEdits.then(function(response){
			$('.loader').removeClass('show');
			functions.bedEdited();
		}, function(responseObject){
			$('.loader').removeClass('show');
			utils.errorHandler(responseObject);
		})

	}
})