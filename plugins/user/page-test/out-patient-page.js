
const outPatient = function() {
    const processPatient = element(by.css("table tbody tr:last-child .btn-queue"))
    const selectOption = element(by.css(".col-md-offset-3 .select2-choice"))
    const selectOptionDropdown = element(by.css(".pace-done > .select2-drop > .select2-results li:first-child"));
    const temperatureInput = element(by.css(".tt-input[data-id='1']"));
    const pulseRate = element(by.css(".tt-input[data-id='3']"));
    const respirationRate = element(by.css(".tt-input[data-id='4']"));
    const bloodPressure = element(by.css(".tt-input[ng-if='field.TypeName == \\'text\\'']"));
    const submitObservation = element(by.css("[ng-click='submitObservation()']"));
   
    const doctorList = element.all(by.css(".mt-15 .table tbody tr.ng-scope td:nth-child(2) span:nth-child(2)"))
    
    const doctorListSelector = element.all(by.css(".mt-15 .table tbody tr.ng-scope td:nth-child(1) input"));
    const doctorListNumber = element.all(by.css(".mt-15 .table tbody tr.ng-scope td:nth-child(3)"));
    const queuePatientButton = element(by.css("[ng-click='queuePatient()']"))


    const createPharmacy = element(by.css("[data-target='#_pharmacy_request']"));
    const createNewRequest = element(by.css("#presc-request-new [placeholder='Enter patients hospital number']"));
    const searchButton = element(by.css("#presc-request-new > .form-group .btn"));
    const nameConfirm = element(by.css("[ng-if='!requestForm.showSearchResult'] > .text-black"));
    const prescriptionItem = element(by.id("conclusion-drug"));
    const addPrescriptionItem = element(by.css("[ng-click='addDrug()']"));
    const addPrescriptionDesc = element(by.css("[ng-model='prescription.duration']"));
    const sendPresciption = element(by.className("btn btn-primary bg-info pull-right"));
    




    this.getProcessPatient = () => processPatient;
    this.getSelectOption = () => selectOption;
    this.getSelectOptionDropdown = () => selectOptionDropdown;
    this.getTemperatureInput = () => temperatureInput;
    this.getPulseRate = () => pulseRate;
    this.getRespirationRate = () => respirationRate;
    this.getBloodPressure = () => bloodPressure;
    this.getSubmitObservation = () => submitObservation;
    this.getDoctorList = () => doctorList;
    this.getDoctorListSelector = () => doctorListSelector;
    this.getDoctorListNumber = () => doctorListNumber;

    this.getQueuePatientButton = () => queuePatientButton;

    this.getCreatePharmacy = () => createPharmacy;
    this.getCreateNewRequest = () => createNewRequest;
    this.getSearchButton = () => searchButton;
    this.getNameConfirm = () => nameConfirm;
    this.getPrescriptionItem = () => prescriptionItem;
    this.getAddPrescriptionItem = () => addPrescriptionItem;
    this.getAddPrescriptionDesc = () => addPrescriptionDesc;
    this.getSendPresciption = () => sendPresciption;

}

module.exports = new outPatient();


