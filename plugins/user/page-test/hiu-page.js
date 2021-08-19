
let hiu = function() {

  let isHIU = element(by.css('#navbar-primary .navbar-header p:nth-child(5)'));
  let patientMngDashboardTab = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(1) a'));
  let achivesAndInfoRetrieval = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(2) a'));
    let achives_PatientDatabase = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(2) ul li:nth-child(1) a'));
    let achives_PatientRecords = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(2) ul li:nth-child(2) a'));
    let achives_PatientRepositories = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(2) ul li:nth-child(3) a'));
    let achives_HMODashboard = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(2) ul li:nth-child(4) a'));
  let manageInPatient = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(3) a.dropdown-toggle'));
  let manage_ViewAdmittedPatient = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(3) ul li a'));

  let patientRegistration = element(by.css('[ng-click="loadDeps = true"]'));

  let patientRegistrationModal = element(by.css('#new_patient'));
  let patientRegistrationModalToggleClose = element(by.css('#new_patient .modal-dialog .modal-content .modal-header button.close'));
  let patientRegistrationModalToggleCloseButton = element(by.css('#new_patient .modal-dialog .modal-content .modal-footer div button[ng-click="newPatient = {}"]'));
  let patientRegistrationSubmit = element(by.css('[ng-click="submit()"]'));

  let NPR_PatientCategorySelect = element(by.css('fieldset .col-sm-3 .select2-choice'));
  let NPR_PatientCategorySelectDropDown = element(by.css('.pace-done > .select2-drop ul li:nth-child(1)'));
  let NPR_PatientCategorySelectValue = element(by.css('#select2-chosen-2'));  
  
  let NPR_PatientTypeSelect = element(by.css('fieldset > div:nth-of-type(1) .select2-default'));
  let NPR_PatientTypeSelectDropdown = element(by.css('.select2-result-label'));
  let NPR_PatientTypeSelectValue = element(by.css('#select2-chosen-4'));

  let NPR_HMONumber = element(by.model("newPatient['HMO Number']"));
  let NPR_FirstName = element(by.model("newPatient['First Name']"));
  let NPR_LastName = element(by.model("newPatient['Last Name']"));

  let NPR_DOB = element(by.model("newPatient['Date Of Birth']"));
  let NPR_DOBValue = element(by.css('.datepicker-days tr:nth-of-type(1) > td:nth-of-type(1)'));

  let NPR_Gender = element.all(by.model("newPatient['Gender']"));
  let NPR_MaritalStatus = element.all(by.model("newPatient['Marital Status']"));
  let NPR_HomeAddress = element(by.model("newPatient['Home Address']"));
  let NPR_MothersMadienName = element(by.model("newPatient['Mothers Maiden Name']"));
  let NPR_MedicalHandCardNo = element(by.model("newPatient['Medical Hand Card Number']"));
  let NPR_PhoneNo = element(by.model("newPatient['Phone Number']"));
  let NPR_ReferenceContact = element(by.model("newPatient['Reference Contact, Emergency']"));
  let NPR_ReferenceContactMirror = element(by.model("newPatient['Reference Contact, Minor']"));

  let NPR_StateOfOriginSelect = element(by.css("fieldset > div:nth-of-type(6) > div:nth-of-type(1) .select2-choice"));
  let NPR_StateOfOriginSelectDropDown = element(by.css(".select2-highlighted > .select2-result-label"));
  let NPR_StateOfOriginValue = element(by.css('#select2-chosen-6'));

  let NPR_LGASelect = element(by.css("fieldset > div:nth-of-type(6) .select2-default"));
  let NPR_LGASelectDrowdown = element(by.css(".select2-result-label"));
  let NPR_LGASelectValue = element(by.css("#select2-chosen-8"));

  let NPR_SORSelect = element(by.css("fieldset div:nth-of-type(3) .select2-choice"));
  let NPR_SORSelectDrowdown = element(by.css(".select2-result-label"));
  let NPR_SORSelectValue = element(by.css("#select2-chosen-10"));

  let NPR_ReligionSelect = element(by.css("fieldset > div:nth-of-type(7) .select2-choice"));
  let NPR_ReligionSelectDrowdown = element(by.css(".select2-result-label"));
  let NPR_ReligionValue = element(by.css("#select2-chosen-12"));

  let NPR_Occupation = element(by.model("newPatient['Occupation']"));
  let NPR_Tribe = element(by.model("newPatient['Tribe']"));
  let NPR_Email = element(by.model("newPatient['Email Address']"));
  let NPR_NextOfKin = element(by.model("newPatient['Next Of Kin']"));

  let patientRegistrationSuccess = element(by.css(".sweet-alert"));
  let patientRegistrationConfirm = element(by.css(".confirm"));
  
  let patientCard = element(by.css("#patient_card"));
  let patientRegSuccessName = element(by.css(".col-xs-7 > div:nth-of-type(1) .text"));
  let patientID = element(by.css(".col-xs-7 > div:nth-of-type(2) .text"));

  let searchPatient = element(by.css("[title='Click the Advanced link below for more search options']"));
  
  

  this.getIsHIU = () => isHIU;
  this.getPatientMngDashboardTab = () => patientMngDashboardTab;
  this.getAchivesAndInfoRetrieval = () => achivesAndInfoRetrieval;
  this.getAchives_PatientDatabase = () => achives_PatientDatabase;
  this.getAchives_PatientRecords = () => achives_PatientRecords;
  this.getAchives_PatientRepositories = () => achives_PatientRepositories;
  this.getAchives_HMODashboard = () => achives_HMODashboard;
  this.getManageInPatient = () => manageInPatient;
  this.getManage_ViewAdmittedPatient = () => manage_ViewAdmittedPatient;
  this.getPatientRegistration = () => patientRegistration;
  this.getPatientRegistrationModal = () => patientRegistrationModal;
  this.getPatientRegistrationModalToggleClose = () => patientRegistrationModalToggleClose;
  this.getPatientRegistrationModalToggleCloseButton = () => patientRegistrationModalToggleCloseButton;

  this.getPatientRegistrationSubmit = () => patientRegistrationSubmit;
  this.getPatientRegistrationSuccess = () => patientRegistrationSuccess;
  this.getPatientRegistrationConfirm = () => patientRegistrationConfirm;

  this.getNPR_PatientCategorySelect = () => NPR_PatientCategorySelect;
  this.getNPR_PatientCategorySelectDropDown = () => NPR_PatientCategorySelectDropDown;
  this.getNPR_PatientCategorySelectValue = () => NPR_PatientCategorySelectValue;

  this.getNPR_PatientTypeSelect = () => NPR_PatientTypeSelect;
  this.getNPR_PatientTypeSelectDropdown = () => NPR_PatientTypeSelectDropdown;
  this.getNPR_PatientTypeSelectValue = () => NPR_PatientTypeSelectValue;

  this.getNPR_PatientTypeSelect = () => NPR_PatientTypeSelect;
  this.getNPR_HMONumber = () => NPR_HMONumber;
  this.getNPR_FirstName = () => NPR_FirstName;
  this.getNPR_LastName = () => NPR_LastName;

  this.getNPR_DOB = () => NPR_DOB;
  this.getNPR_DOBValue = () => NPR_DOBValue;

  this.getNPR_Gender = () => NPR_Gender;
  this.getNPR_MaritalStatus = () => NPR_MaritalStatus;
  this.getNPR_HomeAddress = () => NPR_HomeAddress;
  this.getNPR_MothersMadienName = () => NPR_MothersMadienName;
  this.getNPR_MedicalHandCardNo = () => NPR_MedicalHandCardNo;
  this.getNPR_PhoneNo = () => NPR_PhoneNo;
  this.getNPR_ReferenceContact = () => NPR_ReferenceContact;
  this.getNPR_ReferenceContactMirror = () => NPR_ReferenceContactMirror;

  this.getNPR_StateOfOriginSelect = () => NPR_StateOfOriginSelect;
  this.getNPR_StateOfOriginSelectDropDown = () => NPR_StateOfOriginSelectDropDown;
  this.getNPR_StateOfOriginValue = () => NPR_StateOfOriginValue;

  this.getNPR_LGASelect = () => NPR_LGASelect;
  this.getNPR_LGASelectDropdown = () => NPR_LGASelectDrowdown;
  this.getNPR_LGASelectValue = () => NPR_LGASelectValue;

  this.getNPR_SORSelect = () => NPR_SORSelect;
  this.getNPR_SORSelectDropdown = () => NPR_SORSelectDrowdown;
  this.getNPR_SORSelectValue = () => NPR_SORSelectValue;

  this.getNPR_ReligionSelect = () => NPR_ReligionSelect;
  this.getNPR_ReligionSelectDropdown = () => NPR_ReligionSelectDrowdown;
  this.getNPR_ReligionValue = () => NPR_ReligionValue;

  this.getNPR_Occupation = () => NPR_Occupation;
  this.getNPR_Tribe = () => NPR_Tribe;
  this.getNPR_Email = () => NPR_Email;
  this.getNPR_NextOfKin = () => NPR_NextOfKin;

  this.getPatientCard = () => patientCard;
  this.getPatientRegSuccessName = () => patientRegSuccessName;
  this.getPatientId = () => patientID

  this.getSearchPatient = () => searchPatient;

}

module.exports = new hiu();
