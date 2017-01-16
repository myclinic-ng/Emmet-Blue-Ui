angular.module("EmmetBlue")

.controller("nursingManageBedsController", function($scope, utils){
	function dtAction(data, full, meta, type){
		// editButtonAction = "manage('edit',"+data.SectionBedID+")";
		// deleteButtonAction = "manage('delete',"+data.SectionBedID+")";
		// sectionButtonAction = "manage('section',"+data.SectionBedID+")";
		// var dataOpt = "data-option-id='"+data.SectionBedID+
		// 			"' data-option-name='"+data.BedName+
		// 			"' data-option-description='"+data.BedDescription+
		// 			"'";
		// editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> <i class='fa fa-pencil'></i></button>";
		// deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash-o'></i></button>";
		// manageSectionButton = "<button class='btn btn-default' ng-click=\""+sectionButtonAction+"\" "+dataOpt+"> <i class='icon-atom2'></i> Manage Sections</button>";
		// return "<div class='btn-group'>"+manageSectionButton+editButton+deleteButton+"</div>";

		return "";
	}

	$scope.dtInstance = {};

	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		return utils.serverRequest('/nursing/section-bed/view?resourceId='+$scope.currentSection, 'GET');
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
				$('#new_bed').modal('show')
			}
		}
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('SectionBedID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Bed Name").renderWith(function(data){
			var val = data.BedName+"<span class='pull-right'>";
			if (data.BedStatus == 1){
				val += "&nbsp;<span class='label label-danger'> Occupied</span>"
			}
			else if (data.BedStatus == 0){
				val += "&nbsp;<span class='label label-success'> Unoccupied</span>"
			}

			return val+"</span>";
		}),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(dtAction).notSortable()
	];

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}

	$scope.saveBed = function(){
		$scope.bed.section = $scope.currentSection;
		var request = utils.serverRequest("/nursing/section-bed/new", "POST", $scope.bed);

		request.then(function(response){
			$('#new_bed').modal('hide');
			reloadTable();
			utils.notify("Operation Successful", "New Bed Registered Successfully", "success");
			$scope.bed = {};
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.saveEditBed = function(){
		var request = utils.serverRequest("/nursing/section-bed/edit", "PUT", $scope.tempHolder);

		request.then(function(response){
			$('#edit_bed').modal('hide');
			reloadTable();
			utils.notify("Operation Successful", "Bed updated succesfully", "success");
			$scope.tempHolder = {};
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.tempHolder = {};
	$scope.manage = function(value, id){
		switch(value)
		{
			case "edit":{
				$scope.tempHolder.resourceId = id;
				$scope.tempHolder.BedName = $(".btn[data-option-id='"+id+"']").attr('data-option-name');
				$scope.tempHolder.BedDescription = $(".btn[data-option-id='"+id+"']").attr('data-option-description');
				$('#edit_bed').modal('show');
				break;
			}
			case "delete":{
				var title = "Delete Prompt";
				var text = "You are about to delete the Bed titled "+$(".btn[data-option-id='"+id+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/section-bed/delete?'+utils.serializeParams({
						'resourceId': id
					}), 'DELETE');

					deleteRequest.then(function(response){
						utils.notify("Operation Successful", "Bed has been deleted successfully", "success");
						reloadTable();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
				break;
			}
		}
	}

	function loadWards(){
		var req = utils.serverRequest('/nursing/ward/view', 'GET');

		req.then(function(response){
			$scope.wards = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	function loadSections(ward){
		var req = utils.serverRequest('/nursing/ward-section/view?resourceId='+ward, 'GET');

		req.then(function(response){
			$scope.sections = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	$scope.$watch(function(){ return $scope.currentWard; }, function(nv){
		if (typeof nv != "undefined"){
			loadSections(nv);
		}
	});

	$scope.$watch(function(){ return $scope.currentSection; }, function(nv){
		if (typeof nv != "undefined"){
			reloadTable();
		}
	});

	loadWards();
})