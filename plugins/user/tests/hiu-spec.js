let loginpage = require('../page-test/login-page');
let loginDetails = require('../../../env-const');
const { getToggleBillingDismiss } = require('../page-test/global-page');
const hiuPage = require('../page-test/hiu-page');
const { getSearchPatient } = require('../page-test/hiu-page');
var originalTimeout;

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
        browser.sleep(2000);
        var url = await browser.getCurrentUrl();
        expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.HIU}`);
        done();
    });

    describe('Achives and Information Retrieval Tab',  () => {

        it('Patient Dashboard', async (done) => {
            await hiuPage.getAchivesAndInfoRetrieval().click();
            browser.sleep(1000);
            await hiuPage.getAchives_PatientDatabase().click();
            browser.sleep(2000);
            var url = await browser.getCurrentUrl();
            expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.PatientDashboard}`);
            browser.sleep(3000);
            done();
        })
        it('Patient Records', async (done) => {
            await hiuPage.getAchivesAndInfoRetrieval().click();
            browser.sleep(1000);
            await hiuPage.getAchives_PatientRecords().click();
            browser.sleep(2000);
            var url = await browser.getCurrentUrl();
            expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.PatientRecords}`);
            browser.sleep(3000);
            done();
        })
        it('Patient Repositories', async (done) => {
            await hiuPage.getAchivesAndInfoRetrieval().click();
            browser.sleep(1000);
            await hiuPage.getAchives_PatientRepositories().click();
            browser.sleep(2000);
            var url = await browser.getCurrentUrl();
            expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.PatientReepositories}`);
            browser.sleep(3000);
            done();
        })
        it('HMO Dashboard', async (done) => {
            await hiuPage.getAchivesAndInfoRetrieval().click();
            browser.sleep(1000);
            await hiuPage.getAchives_HMODashboard().click();
            browser.sleep(2000);
            var url = await browser.getCurrentUrl();
            expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.HMODashboard}`);
            browser.sleep(3000);
            done();
        })
    });

    it('Manage In Patient', async (done) => {
        await hiuPage.getManageInPatient().click();
        browser.sleep(2000);
        await hiuPage.getManage_ViewAdmittedPatient().click();
        browser.sleep(2000);
        var url = await browser.getCurrentUrl();
        expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.AdmittedPatients}`);
        browser.sleep(1000);
        done();
    })

})


describe('Side Dashboard Modules Test', () => {

    let firstName = 'Adeola';
    let lastName = 'Moses Adebayo';
    let patientID;

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
    
    it('Patient Registration ModalToggleClose and Close Button', async (done) => {
        await hiuPage.getPatientRegistration().click();
        browser.sleep(2000);
        expect(hiuPage.getPatientRegistrationModal().getCssValue('display')).toBe('block') ;
        await hiuPage.getPatientRegistrationModalToggleClose().click();
        browser.sleep(1000);
        expect(hiuPage.getPatientRegistrationModal().getCssValue('display')).toBe('none') ;

        await hiuPage.getPatientRegistration().click();
        browser.sleep(2000);
        expect(hiuPage.getPatientRegistrationModal().getCssValue('display')).toBe('block') ;
        await hiuPage.getPatientRegistrationModalToggleCloseButton().click();
        browser.sleep(1000);
        expect(hiuPage.getPatientRegistrationModal().getCssValue('display')).toBe('none') ;
        done();
    })

    it('Patient Registration', async (done) => {
        await hiuPage.getPatientRegistration().click();
        browser.sleep(1000);
        expect(hiuPage.getPatientRegistrationModal().getCssValue('display')).toBe('block') ;
        browser.sleep(1000);
        
        // Patient Category
        await hiuPage.getNPR_PatientCategorySelect().click();
        browser.sleep(1000);
        let patientCategory = hiuPage.getNPR_PatientCategorySelectDropDown().getText();
        await hiuPage.getNPR_PatientCategorySelectDropDown().click();
        browser.sleep(1000);
        expect(hiuPage.getNPR_PatientCategorySelectValue().getText()).toEqual(patientCategory);

        // Patient Type
        await hiuPage.getNPR_PatientTypeSelect().click();
        browser.sleep(1000);
        let patientTest = hiuPage.getNPR_PatientTypeSelectDropdown().getText();
        await hiuPage.getNPR_PatientTypeSelectDropdown().click();
        browser.sleep(1000);
        expect(hiuPage.getNPR_PatientTypeSelectValue().getText()).toEqual(patientTest);

        // HMO Number
        await hiuPage.getNPR_HMONumber().sendKeys('21232321');

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
        browser.sleep(1000);
        let stateOfOrigin = hiuPage.getNPR_StateOfOriginSelectDropDown().getText();
        await hiuPage.getNPR_StateOfOriginSelectDropDown().click();
        browser.sleep(2000);
        expect(hiuPage.getNPR_StateOfOriginValue().getText()).toEqual(stateOfOrigin);

        // LGA
        await hiuPage.getNPR_LGASelect().click();
        browser.sleep(1000);
        let lga = hiuPage.getNPR_LGASelectDropdown().getText();
        await hiuPage.getNPR_LGASelectDropdown().click();
        browser.sleep(2000);
        expect(hiuPage.getNPR_LGASelectValue().getText()).toEqual(lga);

        // SOR
        await hiuPage.getNPR_SORSelect().click();
        browser.sleep(1000);
        let sor = hiuPage.getNPR_SORSelectDropdown().getText();
        await hiuPage.getNPR_SORSelectDropdown().click();
        browser.sleep(1000);
        expect(hiuPage.getNPR_SORSelectValue().getText()).toEqual(sor);

        // Religion
        await hiuPage.getNPR_ReligionSelect().click();
        browser.sleep(1000);
        let religion = hiuPage.getNPR_ReligionSelectDropdown().getText();
        await hiuPage.getNPR_ReligionSelectDropdown().click();
        browser.sleep(1000);
        expect(hiuPage.getNPR_ReligionValue().getText()).toEqual(religion);

        // Occupation, Tribe, Email, NextOfKin
        await hiuPage.getNPR_Occupation().sendKeys('Doctor Reps');
        await hiuPage.getNPR_Tribe().sendKeys('Adesugba Aderunke');
        await hiuPage.getNPR_Email().sendKeys('adesholaremi@myclinic.ng');
        await hiuPage.getNPR_NextOfKin().sendKeys('Boluwatife Aderunke');

        // Registration Submit
        await hiuPage.getPatientRegistrationSubmit().click();
        browser.sleep(2000);


        await expect(hiuPage.getPatientRegistrationSuccess().getCssValue('display')).toBe('block');
        await hiuPage.getPatientRegistrationConfirm().click();
        browser.sleep(2000);

        await expect(hiuPage.getPatientRegistrationSuccess().getCssValue('display')).toBe('none');

        browser.sleep(6000);
        expect(hiuPage.getPatientCard().getCssValue('display')).toBe('block');
        expect(hiuPage.getPatientRegSuccessName().getText()).toEqual(`${firstName} ${lastName}`);
        patientID = await hiuPage.getPatientId().getText();

        console.log(patientID);
        done();
    }) 

    // it('Patient Search and Unlock', () => { 
        
    //     await hiuPage.getSearchPatient().sendText(`${firstName} ${lastName}`);

    // })
})

