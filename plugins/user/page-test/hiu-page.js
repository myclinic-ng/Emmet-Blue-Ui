
const hiu = function () {

  const isHIU = element(by.css('#navbar-primary .navbar-header p:nth-child(5)'));
  const patientMngDashboardTab = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(1) a'));
  const achivesAndInfoRetrieval = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(2) a'));
  const achives_PatientDatabase = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(2) ul li:nth-child(1) a'));
  const achives_PatientRecords = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(2) ul li:nth-child(2) a'));
  const achives_PatientRepositories = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(2) ul li:nth-child(3) a'));
  const achives_HMODashboard = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(2) ul li:nth-child(4) a'));
  const manageInPatient = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(3) a.dropdown-toggle'));
  const manage_ViewAdmittedPatient = element(by.css('#navbar-second-toggle .nav.navbar-nav li:nth-child(3) ul li a'));

  const patientRegistration = element(by.css('[ng-click="loadDeps = true"]'));

  const patientRegistrationModal = element(by.css('#new_patient'));
  const patientRegistrationModalToggleClose = element(by.css('#new_patient .modal-dialog .modal-content .modal-header button.close'));
  const patientRegistrationModalToggleCloseButton = element(by.css('#new_patient .modal-dialog .modal-content .modal-footer div button[ng-click="newPatient = {}"]'));
  const patientRegistrationSubmit = element(by.css('[ng-click="submit()"]'));

  const NPR_PatientCategorySelect = element(by.xpath("//fieldset[1]//div[@class='form-group col-sm-3']//a[contains(.,'Select an option')]"));
  const NPR_PatientCategorySelectDropDown = element(by.css('.pace-done > .select2-drop ul li:nth-child(1)'));
  const NPR_PatientCategorySelectValue = element(by.css('#select2-chosen-2'));

  const NPR_PatientTypeSelect = element(by.css('fieldset > div:nth-of-type(1) .select2-default'));
  const NPR_PatientTypeSelectDropdown = element(by.css('.select2-result-label'));
  const NPR_PatientTypeSelectValue = element(by.css('#select2-chosen-4'));

  const NPR_HMONumber = element(by.model("newPatient['HMO Number']"));
  const NPR_FirstName = element(by.model("newPatient['First Name']"));
  const NPR_LastName = element(by.model("newPatient['Last Name']"));

  const NPR_DOB = element(by.model("newPatient['Date Of Birth']"));
  const NPR_DOBValue = element(by.css('.datepicker-days tr:nth-of-type(1) > td:nth-of-type(1)'));

  const NPR_Gender = element.all(by.model("newPatient['Gender']"));
  const NPR_MaritalStatus = element.all(by.model("newPatient['Marital Status']"));
  const NPR_HomeAddress = element(by.model("newPatient['Home Address']"));
  const NPR_MothersMadienName = element(by.model("newPatient['Mothers Maiden Name']"));
  const NPR_MedicalHandCardNo = element(by.model("newPatient['Medical Hand Card Number']"));
  const NPR_PhoneNo = element(by.model("newPatient['Phone Number']"));
  const NPR_ReferenceContact = element(by.model("newPatient['Reference Contact, Emergency']"));
  const NPR_ReferenceContactMirror = element(by.model("newPatient['Reference Contact, Minor']"));

  const NPR_StateOfOriginSelect = element(by.css("fieldset > div:nth-of-type(6) > div:nth-of-type(1) .select2-choice"));
  const NPR_StateOfOriginSelectDropDown = element(by.css(".select2-highlighted > .select2-result-label"));
  const NPR_StateOfOriginValue = element(by.css('#select2-chosen-6'));

  const NPR_LGASelect = element(by.css("fieldset > div:nth-of-type(6) .select2-default"));
  const NPR_LGASelectDrowdown = element(by.css(".select2-result-label"));
  const NPR_LGASelectValue = element(by.css("#select2-chosen-8"));

  const NPR_SORSelect = element(by.css("fieldset div:nth-of-type(3) .select2-choice"));
  const NPR_SORSelectDrowdown = element(by.css(".select2-result-label"));
  const NPR_SORSelectValue = element(by.css("#select2-chosen-10"));

  const NPR_ReligionSelect = element(by.css("fieldset > div:nth-of-type(7) .select2-choice"));
  const NPR_ReligionSelectDrowdown = element(by.css(".select2-result-label"));
  const NPR_ReligionValue = element(by.css("#select2-chosen-12"));

  const NPR_Occupation = element(by.model("newPatient['Occupation']"));
  const NPR_Tribe = element(by.model("newPatient['Tribe']"));
  const NPR_Email = element(by.model("newPatient['Email Address']"));
  const NPR_NextOfKin = element(by.model("newPatient['Next Of Kin']"));

  const patientRegistrationSuccess = element(by.css(".sweet-alert"));
  const patientRegistrationConfirm = element(by.css(".confirm"));

  const patientCard = element(by.css("#patient_card"));
  const patientRegSuccessName = element(by.css(".col-xs-7 > div:nth-of-type(1) .text"));
  const patientID = element(by.css(".col-xs-7 > div:nth-of-type(2) .text"));

  const searchPatient = element(by.css("[title='Click the Advanced link below for more search options']"));
  const searchPatientButton = element(by.css('[ng-click="search(true)"]'));
  const searchedPatient = element(by.css(".text-black.text-bold"));
  const viewProfile = element.all(by.css("button[title='View Profile']"));
  const patientNameInfo = element(by.css("[patient-info='patientInfo'] .col-xs-7 > div:nth-of-type(1) .text"));
  const patientTypeInfo = element(by.css("[patient-info='patientInfo'] .col-xs-7 > div:nth-of-type(3) .text"));
  const patientHMOInfo = element(by.css("[ng-if='patientInfo[\\\"hmo number\\\"]'] .text"));
  const editProfileButton = element(by.css(`[ng-click="toggleView('editProfile')"]`));

  const editProfileHMO = element(by.css(".mt-20.row .col-sm-12 > div:nth-of-type(1) > .form-control"));
  const editProfileFirstName = element(by.css(".mt-20.row .col-sm-12 > div:nth-of-type(2) > .form-control"));
  const editProfileLastName = element(by.css(".mt-20.row div:nth-of-type(3) > .form-control"));

  const typeInfoSelect = element(by.xpath("//a[.='Type Information']"));
  const typePatientCategory = element(by.css(".form-control[ng-model='patientCategory']"));
  const typeSelect = element(by.css("[ng-repeat='category in patientCategories']"));

  const typeSelectPatientType = element(by.css("[ng-model='patientType']"));
  const typeSelectStaff = element(by.css("[value='2'][ng-repeat='type in patientTypes']"));

  const editProfileSave = element(by.css("[ng-click='saveChangeType()']"));

  const viewProficonstab = element(by.css("[ng-if='searched.totalPageCount > 0'] > div:nth-of-type(2) > div:nth-of-type(1) div:nth-of-type(2) div:nth-of-type(2) > div:nth-of-type(1) div:nth-of-type(1) > button:nth-of-type(2)"));
  const editedSuccessName = element(by.css(".text-uppercase.text-bold"));
  const editedSuccessHMO = element(by.css(".text-uppercase[ng-if='patientInfo[\\\"hmo number\\\"]']"));
  const editedPatientType = element(by.css(".text-size-large.text-light.text-muted.ng-binding"));

  const unlockPatient = element(by.xpath("//button[@class='btn btn-xs ng-scope']"));
  const doctorList = element.all(by.css("[patient-info='patient[\\'_source\\']'] .col-md-7 .table tbody tr.ng-scope td:nth-child(2) span:nth-child(2)"));
  const doctorListSelector = element.all(by.css("[patient-info='patient[\\'_source\\']'] .col-md-7 .table tbody tr.ng-scope td:nth-child(1) input"));
  const doctorListNumber = element.all(by.css("[patient-info='patient[\\'_source\\']'] .col-md-7 .table tbody tr.ng-scope td:nth-child(3)"));
  const assignPatient = element(by.css("[ng-click='queuePatient()']"));
  const patientQueueButton = element(by.css("[ng-click='loadDoctors()']"))

  const patientQueueList = element.all(by.css("#view_patient_queue .col-md-5 .table tbody tr.ng-scope td:nth-child(2)"));
  const patientQueueViewButton = element.all(by.css("#view_patient_queue .col-md-5 .table tbody tr.ng-scope td:nth-child(3)"));

  const patientQueueViewName = element(by.css("#view_patient_queue .col-md-7 tbody tr:last-child td:nth-child(2) span:nth-child(1)"))
  const paymentRequest = element(by.css("[data-target='#payment_request']"));

  const searchPatientPaymentRequest = element(by.css("#payment-request-new [placeholder='Enter a patients number or name here to search']"))
  const searchPatientPaymentRequestButton = element(by.css("#payment-request-new > .form-group .btn"));

  const paymentRequestListing = element(by.css(".media-list li:nth-child(2)"));

  const selectService = element(by.xpath("//div[@id='payment-request-new']//a[contains(.,'Select an option')]"));
  const serviceDropdown = element(by.css(".select2-result-sub li:first-child"));

  const selectQuantity = element(by.css("[ng-model='paymentRequestItem.quantity']"));
  const addService = element(by.css("[ng-click='addPaymentRequestItemToList()']"));
  const createPayment = element(by.css("[ng-show='paymentRequestItems.length > 0']"));


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
  this.getSearchPatientButton = () => searchPatientButton;
  this.getSearchedPatient = () => searchedPatient;
  this.getViewProfile = () => viewProfile;
  this.getPatientNameInfo = () => patientNameInfo;
  this.getPatientTypeInfo = () => patientTypeInfo;
  this.getPatientHMOInfo = () => patientHMOInfo;
  this.getEditProfileButton = () => editProfileButton;

  this.getEditProfileHMO = () => editProfileHMO;
  this.getEditProfileFirstName = () => editProfileFirstName;
  this.getEditProfileLastName = () => editProfileLastName;

  this.getTypeInfoSelect = () => typeInfoSelect;
  this.getTypePatientCategory = () => typePatientCategory;
  this.getTypeSelect = () => typeSelect;

  this.getTypeSelectPatientType = () => typeSelectPatientType;
  this.getTypeSelectStaff = () => typeSelectStaff;

  this.getEditProfileSave = () => editProfileSave;

  this.getViewProficonstab = () => viewProficonstab;

  this.getEditedSuccessName = () => editedSuccessName;
  this.getEditedSuccessHMO = () => editedSuccessHMO;
  this.getEditedPatientType = () => editedPatientType;

  this.getUnlockPatient = () => unlockPatient;
  this.getDoctorList = () => doctorList;
  this.getDoctorListNumber = () => doctorListNumber;
  this.getDoctorListSelector = () => doctorListSelector;
  this.getAssignPatient = () => assignPatient;

  this.getPatientQueueButton = () => patientQueueButton;
  this.getPatientQueueList = () => patientQueueList;
  this.getPatientQueueViewButton = () => patientQueueViewButton;
  this.getPatientQueueViewName = () => patientQueueViewName;

  this.getPaymentRequest = () => paymentRequest;
  this.getSearchPatientPaymentRequest = () => searchPatientPaymentRequest;
  this.getSearchPatientPaymentRequestButton = () => searchPatientPaymentRequestButton;
  this.getPaymentRequestListing = () => paymentRequestListing;

  this.getSelectService = () => selectService;
  this.getServiceDropdown = () => serviceDropdown;
  this.getSelectQuantity = () => selectQuantity;
  this.getAddService = () => addService;
  this.getCreatePayment = () => createPayment;


}
module.exports = new hiu();
