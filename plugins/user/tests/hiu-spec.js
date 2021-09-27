let loginpage = require('../page-test/login-page');
let loginDetails = require('../../../env-const');
const hiuPage = require('../page-test/hiu-page');
var originalTimeout;



// Global variables

let firstName = 'Adeola';
let lastName = 'Moses Adebayo';
let patientID;
let HMO = '21232321';
let patientCategory = 'Individual';;
let patientType = 'Student';

let editedHMO = "091291ADG";
let editedFirstName = 'Abdullahi';
let editedLastName = 'Moshood';
let editedPatientCategory = 'Individual';;
let editedPatientType = 'Staff';

// Global Functions

function login() {
    // Logging-in
    loginpage.get(`${loginDetails.appPath}user/login`);

    let EC = protractor.ExpectedConditions;
    browser.wait(EC.elementToBeClickable(loginpage.getElm()), 10000);

    loginpage.setUsername(loginDetails.username);
    loginpage.setPassword(loginDetails.password);

    loginpage.getElm().click();
    browser.ignoreSynchronization = true;
    browser.sleep(10000);
}


function patientSearch(id) {
    hiuPage.getSearchPatient().sendKeys(`${patientID ?? id}`);
    hiuPage.getSearchPatientButton().click();
    browser.sleep(loginDetails.waitSeconds.sleep02);
    expect(hiuPage.getSearchedPatient().getText()).toBe('1');
}

describe('Health Information Unit Tests', () => {

    // add this in your test
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
        login();
    });

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('is page HIU', async (done) => {
        expect(hiuPage.getIsHIU().getText()).toEqual(loginDetails.departmentsName.HIU);
        done();
    });
})

describe('Health Information Unit Sub Nav Tests', () => {
    // add this in your test
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
        login();
    });
    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('Patient Management Dasboard Tab', async (done) => {
        await hiuPage.getPatientMngDashboardTab().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        var url = await browser.getCurrentUrl();
        expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.HIU}`);
        done();
    });

    describe('Achives and Information Retrieval Tab', () => {

        it('Patient Dashboard', async (done) => {
            await hiuPage.getAchivesAndInfoRetrieval().click();
            browser.sleep(loginDetails.waitSeconds.sleep01);
            await hiuPage.getAchives_PatientDatabase().click();
            browser.sleep(loginDetails.waitSeconds.sleep02);
            var url = await browser.getCurrentUrl();
            expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.PatientDashboard}`);
            browser.sleep(loginDetails.waitSeconds.sleep03);
            done();
        })
        it('Patient Records', async (done) => {
            await hiuPage.getAchivesAndInfoRetrieval().click();
            browser.sleep(loginDetails.waitSeconds.sleep01);
            await hiuPage.getAchives_PatientRecords().click();
            browser.sleep(loginDetails.waitSeconds.sleep02);
            var url = await browser.getCurrentUrl();
            expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.PatientRecords}`);
            browser.sleep(loginDetails.waitSeconds.sleep03);
            done();
        })
        it('Patient Repositories', async (done) => {
            await hiuPage.getAchivesAndInfoRetrieval().click();
            browser.sleep(loginDetails.waitSeconds.sleep01);
            await hiuPage.getAchives_PatientRepositories().click();
            browser.sleep(loginDetails.waitSeconds.sleep02);
            var url = await browser.getCurrentUrl();
            expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.PatientReepositories}`);
            browser.sleep(loginDetails.waitSeconds.sleep03);
            done();
        })
        it('HMO Dashboard', async (done) => {
            await hiuPage.getAchivesAndInfoRetrieval().click();
            browser.sleep(loginDetails.waitSeconds.sleep01);
            await hiuPage.getAchives_HMODashboard().click();
            browser.sleep(loginDetails.waitSeconds.sleep02);
            var url = await browser.getCurrentUrl();
            expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.HMODashboard}`);
            browser.sleep(loginDetails.waitSeconds.sleep03);
            done();
        })
    });

    it('Manage In Patient', async (done) => {
        await hiuPage.getManageInPatient().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await hiuPage.getManage_ViewAdmittedPatient().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        var url = await browser.getCurrentUrl();
        expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.AdmittedPatients}`);
        browser.sleep(loginDetails.waitSeconds.sleep01);
        done();
    })

})


describe('Side Dashboard Modules Test', () => {

    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
        browser.driver.manage().window().maximize();
        login();
    });

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('is page HIU', async (done) => {
        expect(hiuPage.getIsHIU().getText()).toEqual(loginDetails.departmentsName.HIU);
        done();
    });

    it('Patient Registration', async (done) => {
        await hiuPage.getPatientRegistration().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        expect(hiuPage.getPatientRegistrationModal().getCssValue('display')).toBe('block');
        browser.sleep(loginDetails.waitSeconds.sleep01);

        // Patient Category
        await hiuPage.getNPR_PatientCategorySelect().click();
        browser.sleep(2000);
        patientCategory = await hiuPage.getNPR_PatientCategorySelectDropDown().getText();
        await hiuPage.getNPR_PatientCategorySelectDropDown().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        expect(hiuPage.getNPR_PatientCategorySelectValue().getText()).toEqual(patientCategory);

        // Patient Type
        browser.sleep(loginDetails.waitSeconds.sleep02);
        console.log(loginDetails.waitSeconds.sleep02);
        await hiuPage.getNPR_PatientTypeSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        patientTest = hiuPage.getNPR_PatientTypeSelectDropdown().getText();
        await hiuPage.getNPR_PatientTypeSelectDropdown().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        expect(hiuPage.getNPR_PatientTypeSelectValue().getText()).toEqual(patientTest);

        // HMO Number
        await hiuPage.getNPR_HMONumber().sendKeys(HMO);

        // FirstName and OtherNames
        await hiuPage.getNPR_FirstName().sendKeys(firstName);
        await hiuPage.getNPR_LastName().sendKeys(lastName);

        // DOB
        await hiuPage.getNPR_DOB().click();
        await hiuPage.getNPR_DOBValue().click();

        // Gender
        await hiuPage.getNPR_Gender().get(0).click();

        // Marital Status
        await hiuPage.getNPR_MaritalStatus().get(0).click();

        // Address, Mother's Maiden Name, Medical Hand Card No, Phone No, Reference Contacts, 
        await hiuPage.getNPR_HomeAddress().sendKeys('Citec Villas, Gwarimpa, Abuja');
        await hiuPage.getNPR_MothersMadienName().sendKeys('Grace');
        await hiuPage.getNPR_MedicalHandCardNo().sendKeys('HIH_323002C');
        await hiuPage.getNPR_PhoneNo().sendKeys('+2349032349233, +23481038237273');
        await hiuPage.getNPR_ReferenceContact().sendKeys('Adesugba Aderunke');
        await hiuPage.getNPR_ReferenceContactMirror().sendKeys('Adesugba Aderunke');

        // State Of Origin
        await hiuPage.getNPR_StateOfOriginSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        let stateOfOrigin = hiuPage.getNPR_StateOfOriginSelectDropDown().getText();
        await hiuPage.getNPR_StateOfOriginSelectDropDown().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        expect(hiuPage.getNPR_StateOfOriginValue().getText()).toEqual(stateOfOrigin);

        // LGA
        await hiuPage.getNPR_LGASelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        let lga = hiuPage.getNPR_LGASelectDropdown().getText();
        await hiuPage.getNPR_LGASelectDropdown().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        expect(hiuPage.getNPR_LGASelectValue().getText()).toEqual(lga);

        // SOR
        await hiuPage.getNPR_SORSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        let sor = hiuPage.getNPR_SORSelectDropdown().getText();
        await hiuPage.getNPR_SORSelectDropdown().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        expect(hiuPage.getNPR_SORSelectValue().getText()).toEqual(sor);

        // Religion
        await hiuPage.getNPR_ReligionSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        let religion = hiuPage.getNPR_ReligionSelectDropdown().getText();
        await hiuPage.getNPR_ReligionSelectDropdown().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        expect(hiuPage.getNPR_ReligionValue().getText()).toEqual(religion);

        // Occupation, Tribe, Email, NextOfKin
        await hiuPage.getNPR_Occupation().sendKeys('Doctor Reps');
        await hiuPage.getNPR_Tribe().sendKeys('Adesugba Aderunke');
        await hiuPage.getNPR_Email().sendKeys('adesholaremi@myclinic.ng');
        await hiuPage.getNPR_NextOfKin().sendKeys('Boluwatife Aderunke');

        // Registration Submit
        await hiuPage.getPatientRegistrationSubmit().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);


        await expect(hiuPage.getPatientRegistrationSuccess().getCssValue('display')).toBe('block');
        await hiuPage.getPatientRegistrationConfirm().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await expect(hiuPage.getPatientRegistrationSuccess().getCssValue('display')).toBe('none');

        browser.sleep(loginDetails.waitSeconds.sleep06);
        expect(hiuPage.getPatientCard().getCssValue('display')).toBe('block');
        expect(hiuPage.getPatientRegSuccessName().getText()).toEqual(`${firstName} ${lastName}`);
        patientID = await hiuPage.getPatientId().getText();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        console.log(patientID);
        done();
    })

    it('Patient Exist Search', async (done) => { 
        patientSearch();

        hiuPage.getViewProfile().get(0).click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        expect(await hiuPage.getPatientNameInfo().getText()).toBe(`${firstName} ${lastName}`);
        expect(await hiuPage.getPatientTypeInfo().getText()).toBe(patientType + ", " + patientCategory);
        expect(await hiuPage.getPatientHMOInfo().getText()).toBe(HMO);

        done();
    })

    it('Updated Profile ', async (done) => {

        patientSearch();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await hiuPage.getViewProfile().get(0).click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        hiuPage.getEditProfileButton().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await hiuPage.getEditProfileHMO().clear().then(()=>{
            hiuPage.getEditProfileHMO().sendKeys(editedHMO);
        })
        await hiuPage.getEditProfileFirstName().clear().then(()=>{
            hiuPage.getEditProfileFirstName().sendKeys(editedFirstName);
        });
        await hiuPage.getEditProfileLastName().clear().then(()=>{
            hiuPage.getEditProfileLastName().sendKeys(editedLastName);
        })
        

        hiuPage.getTypeInfoSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        hiuPage.getTypePatientCategory().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        hiuPage.getTypeSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep03);

        hiuPage.getTypeSelectPatientType().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        hiuPage.getTypeSelectStaff().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);

        hiuPage.getEditProfileSave().click();
        browser.sleep(loginDetails.waitSeconds.sleep03);
        
        done();
        
    })

    it('Patient Profile Update Test', async (done) => {
        patientSearch();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        hiuPage.getViewProfile().get(0).click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        hiuPage.getViewProfileTab().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        expect(await hiuPage.getEditedSuccessName().getText()).toBe(`${editedFirstName.toUpperCase()} ${editedLastName.toUpperCase()}`);
        expect(await hiuPage.getEditedPatientType().getText()).toBe(`${editedPatientType}, ${editedPatientCategory}`);
        expect(await hiuPage.getEditedSuccessHMO().getText()).toBe("HMO NUMBER: " + editedHMO);

        done();
    })

    it('Unlocking Patient Profifle', async (done) => {
        let assignedNumber = [];
        let initNumber;
        let assignedTo = 'General Practitioner';

        /* PositionOfAssigned
        * Always toggle this value between 0 and 1. Also ensure that there exist
        * atleast more than one postions for the value of assignedTo (in this case, 'General Practitioner' ).
        * This will throw error if it cannot find a second member to assign variable to.
        * This is so because you cannot assign the same patient to the same doctor on the same day more than once.
        */
        
        let positionOfAssigned = 1;

        patientSearch('611D04E127E58');
        browser.sleep(loginDetails.waitSeconds.sleep02);
        hiuPage.getUnlockPatient().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await hiuPage.getDoctorList().map( (elem, ind) => {
            elem.getText().then(text => {
                 if(text === 'General Practitioner'){
                    expect(elem.getText()).toBe(assignedTo);
                    assignedNumber.push(ind);
                }
            })
        })

        browser.sleep(loginDetails.waitSeconds.sleep04);
        hiuPage.getDoctorListNumber().get(assignedNumber[positionOfAssigned]).getText().then( text => {
            initNumber = parseInt(text);    
        })
        await hiuPage.getDoctorListSelector().get(assignedNumber[positionOfAssigned]).click();
        browser.sleep(loginDetails.waitSeconds.sleep01);

        await hiuPage.getAssignPatient().click();
        browser.sleep(loginDetails.waitSeconds.sleep06);
        await browser.refresh();
        browser.sleep(loginDetails.waitSeconds.sleep06);
        
        await hiuPage.getPatientQueueButton().click();
        browser.sleep(loginDetails.waitSeconds.sleep06);
        expect(hiuPage.getPatientQueueList().get(assignedNumber[positionOfAssigned]).getText()).toBe((initNumber + 1).toString());
        
        await hiuPage.getPatientQueueViewButton().get(assignedNumber[positionOfAssigned]).click();
        browser.sleep(loginDetails.waitSeconds.sleep03);
        
        expect(hiuPage.getPatientQueueViewName().getText()).toBe(`${editedFirstName} ${editedLastName}`)

        done();
    })
    

    it("Generate payment request", (done) => {
        let quantity = '2';
        hiuPage.getPaymentRequest().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);

        hiuPage.getSearchPatientPaymentRequest().sendKeys(patientID ?? '611D062C6793E');
        hiuPage.getSearchPatientPaymentRequestButton().click();
        browser.sleep(loginDetails.waitSeconds.sleep03);
        hiuPage.getPaymentRequestListing().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        hiuPage.getSelectService().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        hiuPage.getServiceDropdown().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        hiuPage.getSelectQuantity().sendKeys(quantity);
        hiuPage.getAddService().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        hiuPage.getCreatePayment().click();

        browser.sleep(loginDetails.waitSeconds.sleep03);

        done();
    })
})

