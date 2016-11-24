angular.module("EmmetBlue")

.directive('fileModel', function($parse){
	  return {
		restrict: 'A',
		link: function(scope, element, attrs) {
		  var model = $parse(attrs.fileModel);
		  var modelSetter = model.assign;

		  element.bind('change', function(){
		    scope.$apply(function(){
		      modelSetter(scope, element[0].files[0]);
		    });
		  });
		}
	};
})

.directive('ngRepository', function(){
	return {
		restrict: 'AE',
		scope: {
			currentRepository: '=repositoryId'
		},
		templateUrl: "plugins/records/patient/assets/includes/repository-template.html",
		controller: function($scope, utils, $http){
			recordsPatientManageRepositoryController($scope, utils, $http)
		}
	}
});

var recordsPatientManageRepositoryController = function($scope, utils, $http){
	// $scope.currentRepository = 7;
	$scope.$watch(function(){
		return $scope.currentRepository
	}, function(nv){
		loadRepo(nv);
	});

	$scope.currentDoc = {};
	$scope.currentRepositoryObject = {
		background: "transparent"
	};
	$scope.viewPort = {
		width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
	};

	$scope.uploadDocs = function(){
		var formData = new FormData();
		formData.append("documents", $scope.document.documents);
		formData.append("name", $scope.document.documentTitle);
		formData.append("description", $scope.document.documentDescription);
		formData.append("category", $scope.document.documentCategory);
		formData.append("creator", utils.userSession.getID());
		formData.append("repository", $scope.currentRepository);

		var res = utils.serverUpload("http://192.168.173.1:700/v1/patients/repository-item/new", "POST", formData);

		res.then(function(response){
			$scope.document = {};
			utils.alert("Upload successful", "The selected document has been uploaded to this repository successfully", "success");

			loadRepo();
		}, function(error){
			utils.errorHandler(error);
		})
	}

	var loadRepo = function(){
		var repo = utils.serverRequest("/patients/patient-repository/view?resourceId="+$scope.currentRepository, "GET");

		repo.then(function(response){
			$scope.repository = response;
		}, function(error){
			utils.errorHandler(error);
		});
	}

	loadRepo();

	$scope.loadFile = function(url){
		url = $scope.repository.RepositoryUrl+url;

		return utils.loadImage(url);
	}

	$scope.loadInfo = function(name, description){
		$scope.currentDoc.name = name;
		$scope.currentDoc.desc = description;

		$("#view-info").modal("show");
	}
	
	$scope.enlargeImage = function(url){
		$scope.currentRepositoryImage = $scope.loadFile(url);

		$("#view-image-document").modal("show");
	}

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
			console.log(response);
			$scope.currentJsonFile = response;
		}, function(error){
			utils.notify("An error occurred", "Unable to load document", "error");
		});
		
		$("#view-json-document").modal("show");
	}

	$scope.rotate = function(id){
		var curr_value = document.getElementById(id).style.transform;
        var new_value = "rotate(90deg)";
        if(curr_value !== ""){
	        var new_rotate = parseInt(curr_value.replace("rotate(","").replace(")","")) + 90;
	        new_value = "rotate(" + new_rotate + "deg)";
        }
        document.getElementById(id).style.transform = new_value;
	}

	$scope.closeModal = function(){
		$("#view-image-document").modal("hide");
		$("#view-object-document").modal("hide");
		$("#view-info").modal("hide");
		$("#view-json-document").modal("hide");
	}
};
