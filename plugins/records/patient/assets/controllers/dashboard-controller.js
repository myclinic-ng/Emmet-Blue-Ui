angular.module("EmmetBlue")

.controller("recordsPatientDashboardController", function($scope, utils, $log){
	$scope.dashboardMessage = "Patients Repositories Dashboard";

	var self = this;

	  self.dzAddedFile = function( file ) {
	    $log.log( file );
	  };

	  self.dzError = function( file, errorMessage ) {
	    $log.log(errorMessage);
	  };

	  self.dropzoneConfig = {
	  	paramName: "file",
	    parallelUploads: 100,
	    dictDefaultMessage: 'Drop files here to upload <span>or CLICK</span>',
	    maxFileSize: 30,
	    addRemoveLinks: true,
	    autoProcessQueue: true,
	    uploadMultiple: true,
	    MaxFiles: 20
	  };

	  $scope.recordSubmitURL = "http://192.168.173.1/EmmetBlueApi/v1/patients/patient-repository/new";
	  self.dzSending = function( file, xhr, formData){
	  		formData.append("data", $scope.record);
	  }
})