angular.module("EmmetBlue")

.controller("ConsultancyPrescriptionTemplateController", function($scope, utils){
	var functions = {
		actionMarkups:{
			templateActionMarkup: function(data, type, full, meta){
				var editButtonAction = "editTemplate("+data.TemplateID+")";
				var deleteButtonAction = "deleteTemplate("+data.TemplateID+")";

				var dataOpt = "data-option-id='"+data.TemplateID+"' data-option-name='"+data.TemplateName+"' data-option-description='"+data.TemplateDescription+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";

				var buttons = "<div class='btn-template'>"+editButton+deleteButton+"</button>";
				return buttons;
			}
		}
	}
	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/consultancy/prescription-template/view', 'GET');

		return request;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
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
			text: 'New Template',
			action: function(){
				$scope.newTemplate = {};
				$("#new_setting_new_template").modal("show");
			}
		}
    ]);

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('TemplateID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('TemplateName').withTitle("Template Title"),
		utils.DT.columnBuilder.newColumn('TemplateDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn('CreatedBy').withTitle("Created By"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.templateActionMarkup).notSortable()
	]

	$scope.dtInstance = {};

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}
	$scope.tempHolder = {};

	$scope.editTemplate = function(templateId){
		$scope.tempHolder.TemplateName = $(".btn[data-option-id='"+templateId+"']").attr('data-option-name');
		$scope.tempHolder.TemplateDescription = $(".btn[data-option-id='"+templateId+"']").attr('data-option-description');
		$scope.tempHolder.resourceId = templateId;

		$("#new_setting_edit_template").modal("show");
	}

	$scope.deleteTemplate = function(templateId){
		var title = "Delete Prompt";
		var text = "You are about to delete the template named "+$(".btn[data-option-id='"+templateId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
		var close = true;
		$scope._templateId = templateId;
		var callback = function(){
			var deleteRequest = utils.serverRequest('/consultancy/prescription-template/delete?'+utils.serializeParams({
				'resourceId': $scope._templateId
			}), 'DELETE');

			deleteRequest.then(function(response){
				utils.alert("Operation Successful", "The selected template has been deleted successfully", "success", "notify");
				delete  $scope._groupId;

				reloadTable();
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		}
		var type = "warning";
		var btnText = "Delete";

		utils.confirm(title, text, close, callback, type, btnText);
	}
	$scope.saveEditTemplate = function(){
		var data = $scope.tempHolder;

		var request = utils.serverRequest('/consultancy/prescription-template/edit', 'PUT', data);

		request.then(function(response){
			utils.alert("Operation Successful", "Your changes has been saved successfully", "success", "notify");
			$("#new_setting_edit_template").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	$scope.saveNewTemplate = function(){
		var data = $scope.newTemplate;
		data.staff = utils.userSession.getID();
		
		var request = utils.serverRequest('/consultancy/prescription-template/new', 'POST', data);

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully created a new template", "success", "notify");
			$("#new_setting_new_template").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
})

.controller("ConsultancyPrescriptionTemplateItemsController", function($scope, utils){
	var functions = {
		actionMarkups:{
			templateActionMarkup: function(data, type, full, meta){
				var editButtonAction = "editTemplate("+data.ItemID+")";
				var deleteButtonAction = "deleteTemplate("+data.ItemID+")";

				var dataOpt = "data-option-id='"+data.ItemID+"' data-option-name='"+data.Item+"' data-option-description='"+data.Note+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";

				var buttons = "<div class='btn-template'>"+editButton+deleteButton+"</button>";
				return buttons;
			}
		}
	}
	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/consultancy/prescription-template/view-template-items?resourceId='+$scope.currentTemplate, 'GET');

		return request;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
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
			text: 'New Item',
			action: function(){
				$scope.newTemplate = {};
				$("#new_setting_new_template_item").modal("show");
			}
		}
    ]);

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('ItemID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('Item').withTitle("Item"),
		utils.DT.columnBuilder.newColumn('Note').withTitle("Note"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.templateActionMarkup).notSortable()
	]

	$scope.dtInstance = {};

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}

	var loadTemplates = function(){
		var req = utils.serverRequest("/consultancy/prescription-template/view", "GET");
		req.then(function(response){
			$scope.templates = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}();

	$scope.$watch("currentTemplate", function(nv){
		if (typeof nv !== "undefined" && nv !== null){
			reloadTable();
		}
	});

	$scope.tempHolder = {};

	$scope.editTemplate = function(templateId){
		$scope.tempHolder.TemplateName = $(".btn[data-option-id='"+templateId+"']").attr('data-option-name');
		$scope.tempHolder.TemplateDescription = $(".btn[data-option-id='"+templateId+"']").attr('data-option-description');
		$scope.tempHolder.resourceId = templateId;

		$("#new_setting_edit_template").modal("show");
	}

	$scope.deleteTemplate = function(templateId){
		var title = "Delete Prompt";
		var text = "You are about to delete the template named "+$(".btn[data-option-id='"+templateId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
		var close = true;
		$scope._templateId = templateId;
		var callback = function(){
			var deleteRequest = utils.serverRequest('/consultancy/prescription-template/delete?'+utils.serializeParams({
				'resourceId': $scope._templateId
			}), 'DELETE');

			deleteRequest.then(function(response){
				utils.alert("Operation Successful", "The selected template has been deleted successfully", "success", "notify");
				delete  $scope._groupId;

				reloadTable();
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		}
		var type = "warning";
		var btnText = "Delete";

		utils.confirm(title, text, close, callback, type, btnText);
	}
	$scope.saveEditTemplate = function(){
		var data = $scope.tempHolder;

		var request = utils.serverRequest('/consultancy/prescription-template/edit', 'PUT', data);

		request.then(function(response){
			utils.alert("Operation Successful", "Your changes has been saved successfully", "success", "notify");
			$("#new_setting_edit_template").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	$scope.saveNewTemplate = function(){
		var data = $scope.newTemplate;
		data.template = $scope.currentTemplate;
		
		var request = utils.serverRequest('/consultancy/prescription-template/new-template-item', 'POST', data);

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully created a new template item", "success", "notify");
			$("#new_setting_new_template_item").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
})
.controller("ConsultancyComplaintTemplateController", function($scope, utils){
	var functions = {
		actionMarkups:{
			templateActionMarkup: function(data, type, full, meta){
				var editButtonAction = "editTemplate("+data.TemplateID+")";
				var deleteButtonAction = "deleteTemplate("+data.TemplateID+")";

				var dataOpt = "data-option-id='"+data.TemplateID+"' data-option-name='"+data.TemplateName+"' data-option-description='"+data.TemplateDescription+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";

				var buttons = "<div class='btn-template'>"+editButton+deleteButton+"</button>";
				return buttons;
			}
		}
	}
	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/consultancy/complaint-template/view', 'GET');

		return request;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
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
			text: 'New Template',
			action: function(){
				$scope.newTemplate = {};
				$("#new_setting_new_complaint_template").modal("show");
			}
		}
    ]);

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('TemplateID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('TemplateName').withTitle("Template Title"),
		utils.DT.columnBuilder.newColumn('TemplateDescription').withTitle("Description"),
		utils.DT.columnBuilder.newColumn('CreatedBy').withTitle("Created By"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.templateActionMarkup).notSortable()
	]

	$scope.dtInstance = {};

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}
	$scope.tempHolder = {};

	$scope.editTemplate = function(templateId){
		$scope.tempHolder.TemplateName = $(".btn[data-option-id='"+templateId+"']").attr('data-option-name');
		$scope.tempHolder.TemplateDescription = $(".btn[data-option-id='"+templateId+"']").attr('data-option-description');
		$scope.tempHolder.resourceId = templateId;

		$("#new_setting_edit_complaint_template").modal("show");
	}

	$scope.deleteTemplate = function(templateId){
		var title = "Delete Prompt";
		var text = "You are about to delete the template named "+$(".btn[data-option-id='"+templateId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
		var close = true;
		$scope._complaint_templateId = templateId;
		var callback = function(){
			var deleteRequest = utils.serverRequest('/consultancy/complaint-template/delete?'+utils.serializeParams({
				'resourceId': $scope._complaint_templateId
			}), 'DELETE');

			deleteRequest.then(function(response){
				utils.alert("Operation Successful", "The selected template has been deleted successfully", "success", "notify");
				delete  $scope._groupId;

				reloadTable();
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		}
		var type = "warning";
		var btnText = "Delete";

		utils.confirm(title, text, close, callback, type, btnText);
	}
	$scope.saveEditTemplate = function(){
		var data = $scope.tempHolder;

		var request = utils.serverRequest('/consultancy/complaint-template/edit', 'PUT', data);

		request.then(function(response){
			utils.alert("Operation Successful", "Your changes has been saved successfully", "success", "notify");
			$("#new_setting_edit_complaint_template").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	$scope.saveNewTemplate = function(){
		var data = $scope.newTemplate;
		data.staff = utils.userSession.getID();
		
		var request = utils.serverRequest('/consultancy/complaint-template/new', 'POST', data);

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully created a new template", "success", "notify");
			$("#new_setting_new_complaint_template").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
})

.controller("ConsultancyComplaintTemplateItemsController", function($scope, utils){
	var functions = {
		actionMarkups:{
			templateActionMarkup: function(data, type, full, meta){
				var editButtonAction = "editTemplate("+data.ItemID+")";
				var deleteButtonAction = "deleteTemplate("+data.ItemID+")";

				var dataOpt = "data-option-id='"+data.ItemID+"' data-option-name='"+data.Item+"' data-option-description='"+data.Note+"'";

				var editButton = "<button class='btn btn-default' ng-click=\""+editButtonAction+"\" "+dataOpt+"> Edit</button>";
				var deleteButton = "<button class='btn btn-default' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> Delete</button>";

				var buttons = "<div class='btn-template'>"+editButton+deleteButton+"</button>";
				return buttons;
			}
		}
	}
	$scope.dtOptions = utils.DT.optionsBuilder.fromFnPromise(function(){
		var request = utils.serverRequest('/consultancy/complaint-template/view-template-items?resourceId='+$scope.currentTemplate, 'GET');

		return request;
	})
	.withPaginationType('full_numbers')
	.withDisplayLength(10)
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
			text: 'New Item',
			action: function(){
				$scope.newTemplate = {};
				$("#new_setting_new_complaint_template_item").modal("show");
			}
		}
    ]);

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn('ItemID').withTitle("ID"),
		utils.DT.columnBuilder.newColumn('Item').withTitle("Item"),
		utils.DT.columnBuilder.newColumn('Note').withTitle("Note")
		// utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(functions.actionMarkups.templateActionMarkup).notSortable()
	]

	$scope.dtInstance = {};

	function reloadTable(){
		$scope.dtInstance.reloadData();
	}

	var loadTemplates = function(){
		var req = utils.serverRequest("/consultancy/complaint-template/view", "GET");
		req.then(function(response){
			$scope.templates = response;
		}, function(error){
			utils.errorHandler(error);
		})
	}();

	$scope.$watch("currentTemplate", function(nv){
		if (typeof nv !== "undefined" && nv !== null){
			reloadTable();
		}
	});

	$scope.tempHolder = {};

	$scope.editTemplate = function(templateId){
		$scope.tempHolder.TemplateName = $(".btn[data-option-id='"+templateId+"']").attr('data-option-name');
		$scope.tempHolder.TemplateDescription = $(".btn[data-option-id='"+templateId+"']").attr('data-option-description');
		$scope.tempHolder.resourceId = templateId;

		$("#new_setting_edit_complaint_template").modal("show");
	}

	$scope.deleteTemplate = function(templateId){
		var title = "Delete Prompt";
		var text = "You are about to delete the template named "+$(".btn[data-option-id='"+templateId+"']").attr('data-option-name')+". Do you want to continue? Please note that this action cannot be undone";
		var close = true;
		$scope._complaint_templateId = templateId;
		var callback = function(){
			var deleteRequest = utils.serverRequest('/consultancy/complaint-template/delete?'+utils.serializeParams({
				'resourceId': $scope._complaint_templateId
			}), 'DELETE');

			deleteRequest.then(function(response){
				utils.alert("Operation Successful", "The selected template has been deleted successfully", "success", "notify");
				delete  $scope._groupId;

				reloadTable();
			}, function(responseObject){
				utils.errorHandler(responseObject);
			})
		}
		var type = "warning";
		var btnText = "Delete";

		utils.confirm(title, text, close, callback, type, btnText);
	}
	$scope.saveEditTemplate = function(){
		var data = $scope.tempHolder;

		var request = utils.serverRequest('/consultancy/complaint-template/edit', 'PUT', data);

		request.then(function(response){
			utils.alert("Operation Successful", "Your changes has been saved successfully", "success", "notify");
			$("#new_setting_edit_complaint_template").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}

	$scope.saveNewTemplate = function(){
		var data = $scope.newTemplate;
		data.template = $scope.currentTemplate;
		
		var request = utils.serverRequest('/consultancy/complaint-template/new-template-item', 'POST', data);

		request.then(function(response){
			utils.alert("Operation Successful", "You have successfully created a new template item", "success", "notify");
			$("#new_setting_new_complaint_template_item").modal("hide");
			reloadTable();
		}, function(responseObject){
			utils.errorHandler(responseObject);
		})
	}
});