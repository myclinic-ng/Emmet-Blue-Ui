angular.module("EmmetBlue")

.factory("recordsPatientWidgetFactory", function(utils){
	return {
		loadTimeline : function(patientId){
			var request = utils.serverRequest("/patients/patient-event/view?resourceId="+patientId, "GET");

			return request;
		}
	}
})