angular.module("EmmetBlue")

// wards and section controller

.controller('wardController', function($scope,utils, DTOptionsBuilder, DTColumnBuilder){
	var functions = {
		actionsMarkup: function(meta, full, data){
			var editButtonAction = "manageEditWard("+data.WardID+")";
			var options = "data-option-id='"+data.WardID+"' data-option-ward-name='"+data.WardName+"' data-option-ward-desc='"+data.WardDescription+"'";
			var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+options+"><i class='icon-pencil5'></i> Edit</button>";

			var buttons = "<div class='btn-group'>"+editButton+"</button>";
			
			return buttons;
		},
		manageWard:{
			newWard: function(){
				$("#new-ward").modal("show");
			},
			newWardCreated: function(){
				utils.alert('Operation Succesful', 'New Ward Created', 'success', 'notify');
				$scope.newWard = {};
				$scope.dtInstance.reloadData();
				$("#new-ward").modal("hide");
			},
			editWard: function(id){
				var name = $(".btn[data-option-id='"+id+"']").attr("data-option-ward-name");
				var desc = $(".btn[data-option-id='"+id+"']").attr("data-option-ward-desc");
				$scope.temp = {
					name: name,
					desc: desc
				};
				$("#edit-ward").modal("show");
			}
		}
	}


	$scope.dtInstance = {};
	$scope.temp= {};
	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function(){
		var ward = utils.serverRequest('/nursing/ward/view', 'GET');
		return ward;
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
			text: '<i class="icon-file-plus"> </i> <u>N</u>ew  Ward',
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
		DTColumnBuilder.newColumn('WardID').withTitle('Ward ID'),
		DTColumnBuilder.newColumn('WardName').withTitle('Ward Name'),
		DTColumnBuilder.newColumn('WardDescription').withTitle('Ward Description'),
		//DTColumnBuilder.newColumn('CreatedDate').withTitle('Date Created'),
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

	$scope.manageEditWard = function(id){
		functions.manageWard.editWard(id);
	}

	$scope.functions = functions;
})