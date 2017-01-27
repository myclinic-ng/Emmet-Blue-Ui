angular.module("EmmetBlue")

.controller("accountsHMOPatientsDocumentController", function($scope, utils){
	$scope.loadImage = utils.loadImage;

	function tableAction(data, type, full, meta){
		var viewButtonAction = "manageDoc('view', '"+data.DocumentCategory+"', '"+data.DocumentNumber+"')";
		var deleteButtonAction = "manageDoc('delete', '"+data.DocumentCategory+"', '"+data.DocumentNumber+"')";

		var dataOpt = "data-option-id='"+data.DocumentNumber+"' data-option-loc='"+data.DocLoc+"' data-option-name='"+data.DocumentName+"'";

		var viewButton = "<button class='btn btn-info bg-white btn-labeled btn-hmo-doc btn-xs' ng-click=\""+viewButtonAction+"\" "+dataOpt+"><b><i class='icon-file-eye'></i></b> View</button>";
		var deleteButton = "<button class='btn btn-default btn-hmo-doc' ng-click=\""+deleteButtonAction+"\" "+dataOpt+"> <i class='fa fa-trash'></i> Delete</button>";
		// var viewButton = "<button class='btn btn-default btn-hmo-doc'> View</button>";

		var buttons = "<div class='btn-group'>"+viewButton+"</button>";
		return buttons;
	}

	$scope.dtInstance = {};
	$scope.dtOptions = utils.DT.optionsBuilder
	.fromFnPromise(function(){
		var request = utils.serverRequest('/accounts-biller/hmo-document/view', 'GET');
		return request;
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
        	text: '<i class="icon-file-plus"></i> <u>U</u>pload a new document',
        	action: function(){
				$("#uploadNew").modal("show");
        	}
        },
        {
        	extend: 'print',
        	text: '<i class="icon-printer"></i> <u>P</u>rint this data page',
        	key: {
        		key: 'p',
        		ctrlKey: false,
        		altKey: true
        	}
        }
	]);	

	$scope.dtColumns = [
		utils.DT.columnBuilder.newColumn("DocumentNumber").withTitle("Doc. Number"),
		utils.DT.columnBuilder.newColumn('DocumentName').withTitle("Doc. Name"),
		utils.DT.columnBuilder.newColumn('DocumentDescription').withTitle("Doc. Description"),
		utils.DT.columnBuilder.newColumn('DocumentCategory').withTitle("Doc. Category"),
		utils.DT.columnBuilder.newColumn('DocumentCreator').withTitle("Doc. Creator"),
		utils.DT.columnBuilder.newColumn('DocumentCreationDate').withTitle("Date Created"),
		utils.DT.columnBuilder.newColumn(null).withTitle("Action").renderWith(tableAction).notSortable()
	];

	$scope.reloadTable = function(){
		$scope.dtInstance.reloadData();
	}

	$scope.manageDoc = function(manageGroup, type, number){
		switch(manageGroup.toLowerCase()){
			case "view":{
				var loc = $(".btn-hmo-doc[data-option-id='"+number+"']").attr("data-option-loc");
				$scope.currentDocumentTitle = $(".btn-hmo-doc[data-option-id='"+number+"']").attr("data-option-name");
				if(type == "image"){
					$scope.enlargeImage(loc);
				}
				else if (type == "pdf"){
					$scope.enlargeObject(loc, "pdf");
				}
			}
		}
	}

	$scope.uploadDocs = function(){
		var formData = new FormData();
		formData.append("documents", $scope.document.documents);
		formData.append("name", $scope.document.documentTitle);
		formData.append("description", $scope.document.documentDescription);
		formData.append("category", $scope.document.documentCategory);
		formData.append("creator", utils.userSession.getID());

		var res = utils.serverUpload(utils.restServer+"/accounts-biller/hmo-document/new", "POST", formData);

		res.then(function(response){
			$scope.document = {};
			utils.alert("Upload successful", "The selected document has been uploaded to this repository successfully", "success");

			loadRepo();
		}, function(error){
			utils.errorHandler(error);
		})
	}

	$scope.viewPort = {
		width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
	};

	$scope.loadFile = function(url){
		console.log(url);
		return utils.loadImage(url);
	}

	$scope.enlargeImage = function(url){
		$scope.currentRepositoryImage = $scope.loadFile(url);

		$("#view-image-document").modal("show");
	}
	$scope.currentRepositoryObject = {};
	$scope.enlargeObject = function(url, type){
		$scope.currentRepositoryObject.url = $scope.loadFile(url);
		switch(type)
		{
			case "pdf":{
				$scope.currentRepositoryObject.type="application/pdf";
				$scope.currentRepositoryObject.alt="Open PDF Document";
				$scope.currentRepositoryObject.background = "transparent";
				break;
			}
			case "text":{
				$scope.currentRepositoryObject.type="text/html";
				$scope.currentRepositoryObject.alt="Cannot display document, click to load with an installed software";
				$scope.currentRepositoryObject.background = "#fff";
				break;
			}
		}

		$("#view-object-document").modal("show");
	}

	$scope.enlargeJson = function(url){
		url = $scope.repository.RepositoryUrl+url;

		utils.serverRequest("/read-resource?url="+url, "GET").then(function(response){
			$scope.currentJsonFile = response;
		}, function(error){
			utils.notify("An error occurred", "Unable to load document", "error");
		});
		
		$("#view-json-document").modal("show");
	}

	$scope.closeModal = function(){
		$("#view-image-document").modal("hide");
		$("#view-object-document").modal("hide");
		$("#view-info").modal("hide");
		$("#view-json-document").modal("hide");
	}
});