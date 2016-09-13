angular.module("EmmetBlue")

// wards and section controller

.controller('sectionController', function($scope,utils, DTOptionsBuilder, DTColumnBuilder){
	var functions = {
		actionsMarkup: function(meta, full, data){
			var editButtonAction = "functions.manageSection.editSection("+data.WardSectionID+")";
			var deleteButtonAction = "functions.manageSection.deleteSection("+data.WardSectionID+")";
			var bedManagementButtonAction = "functions.manageSection.bedManagement("+data.WardSectionID+")";

			var options = "data-option-id='"+data.WardSectionID+
							"' data-option-section-name='"+data.WardSectionName+
							"' data-option-section-desc='"+data.WardSectionDescription+
							"' data-option-section-ward-id='"+data.WardID+
							"' data-option-section-ward-name='"+data.WardName+
							"' ";
<<<<<<< HEAD
			var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+options+"><i class='icon-pencil5'></i> Edit</button>";
			var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\""+options+"><i class='icon-bin'></i> Delete</button>"
			var bedManagementButton = "<button class='btn btn-default' ng-click=\""+bedManagementButtonAction+"\""+options+"><i icon-bed></i> Manage Beds</button>";
=======
			var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+options+"><i class='icon-pencil5'></i> </button>";
			var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\""+options+"><i class='icon-bin'></i> </button>"
			var bedManagementButton = "<button class='btn btn-default' ng-click=\""+bedManagementButtonAction+"\""+options+"><i icon-bed></i> Manage Beds</button>"
>>>>>>> e6e187131cad89cb647c5a64dd1321df6170eced
			return "<div class='btn-group'>"+editButton+deleteButton+bedManagementButton+"</div>";
		},
		manageSection:{
			newSection: function(){
				$("#new-section").modal("show");
			},
			newSectionCreated: function(){
				utils.alert('Operation Succesful', 'New Ward Created', 'success', 'notify');
				$scope.newSection = {};
				$scope.sectionDtInstance.reloadData();
				$("#new-section").modal("hide");
			},
			editSection: function(id){
				var sectionName = $(".btn[data-option-id='"+id+"']").attr('data-option-section-name');
				var sectionDesc = $(".btn[data-option-id='"+id+"']").attr('data-option-section-desc');
				var sectionWardId = $(".btn[data-option-id='"+id+"']").attr('data-option-section-ward-id');
				var wardName = $(".btn[data-option-id='"+id+"']").attr('data-option-section-ward-name');
				$scope.temp = {
					id:id,
					sectionName: sectionName,
					sectionDescription: sectionDesc,
					wardId: sectionWardId,
					wardName:wardName
				};
				$("#edit-section").modal('show');
			},
			sectionEdited: function(){
			utils.alert("Operation Successful", "Your changes have been saved successfully", "success", "notify");
			$scope.tempHolder = {};
			$scope.sectionDtInstance.reloadData();
			$("#edit-section").modal("hide");
			},
			sectionDeleted:function(){
				utils.alert("Operation Successful", "The selected ward has been deleted successfully", "success", "notify");
				$scope.tempHolder = {};
				delete  $scope._id;

				$scope.sectionDtInstance.reloadData();
			},
			deleteSection: function(id){
				var title = "Delete Prompt";
				var text = "You are about to delete this Section named "+$(".btn[data-option-id='"+id+"']").attr('data-option-section-name')+". Do you want to continue? Please note that this action cannot be undone";
				var close = true;
				$scope._id = id;
				var callback = function(){
					var deleteRequest = utils.serverRequest('/nursing/ward-section/delete?'+utils.serializeParams({
						'resourceId': $scope._id
					}), 'DELETE');

					deleteRequest.then(function(response){
						functions.manageSection.sectionDeleted();
					}, function(responseObject){
						utils.errorHandler(responseObject);
					})
				}
				var type = "warning";
				var btnText = "Delete";

				utils.confirm(title, text, close, callback, type, btnText);
			},
			bedManagement: function(id){
				var data = {
					name: $(".btn[data-option-id='"+id+"']").attr('data-option-section-name'),
					id: id
				}

				utils.storage.bedManagementData = data;
				$("#bed-management").modal("show");
			}
		},
		loadWard: function(){
			wards = utils.serverRequest('/nursing/ward/view','GET');
			wards.then(function(response){
				$scope.sectionWards = response;
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		}
	}



	functions.loadWard();
	$scope.sectionDtInstance = {};
	$scope.sectionDtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		var wardSection = utils.serverRequest('/nursing/ward-section/view', 'GET');
		return wardSection;
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
			text: '<i class="icon-file-plus"></i> <u>N</u>ew  Section',
			action: function(){
				functions.manageSection.newSection();
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
	$scope.sectionDtColumns = [
		DTColumnBuilder.newColumn('WardSectionID').withTitle('Section ID'),
		DTColumnBuilder.newColumn('WardSectionName').withTitle('Section Name'),
		DTColumnBuilder.newColumn('WardSectionDescription').withTitle('Section Description'),
		DTColumnBuilder.newColumn('WardName').withTitle('Ward'),
		DTColumnBuilder.newColumn('CreatedDate').withTitle('Date Created'),
		DTColumnBuilder.newColumn(null).withTitle('Action').notSortable().renderWith(functions.actionsMarkup)
	];

	$scope.saveNewSection = function(){
		var newSection = $scope.sectionRegistration
		//console.log(newSection);
		ward = utils.serverRequest('/nursing/ward-section/new', 'post', newSection);
		ward.then(function(response){
			functions.manageSection.newSectionCreated();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
	$scope.saveEditSection = function(){
		var edits = {
			resourceId: $scope.temp.id,
			WardID: $scope.temp.wardId,
			WardSectionName: $scope.temp.sectionName,
			WardSectionDescription: $scope.temp.sectionDescription
		}
		var saveEdits = utils.serverRequest('/nursing/ward-section/edit', 'PUT', edits);
		saveEdits.then(function(response){
			functions.manageSection.sectionEdited();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})

	}
	$scope.functions = functions;
	//console.log($scope.functions)
})