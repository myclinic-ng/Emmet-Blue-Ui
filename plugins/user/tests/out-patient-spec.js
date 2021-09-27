
let loginpage = require('../page-test/login-page');
let loginDetails = require('../../../env-const');
const globalPage = require('../page-test/global-page');
const outPatientPage = require('../page-test/out-patient-page');
const hiuPage = require('../page-test/hiu-page');



// Global variables
var originalTimeout;

let patientID;
let HMO = '21232321';

let firstName = 'Adeola';
let lastName = 'Moses Adebayo';

let editedHMO = "091291ADG";
let editedFirstName = 'moshood';
let editedLastName = 'Moses philip';
let assignedTo = 'General Practitioner';
let assignedNumber = [];
let initNumber;




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

async function navigateToOutPatient() {
    globalPage.getSwitchDept().click();
    browser.sleep(loginDetails.waitSeconds.sleep01);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getOutPatient()), 2000);

    await globalPage.getOutPatient().click();
    browser.sleep(loginDetails.waitSeconds.sleep05);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.OutPatient}`);
}

describe('Out Patient Module Tests', () => {
    // add this in your test
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
        login();
    });
    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    beforeAll(function () {
        browser.driver.manage().window().maximize();
    })

    // it('Unlocking Patient Profifle', async (done) => {

    //     /* PositionOfAssigned
    //     * Always toggle this value between 0 and 1 after every test run . Also ensure that there exist
    //     * atleast more than one postions for the value of assignedTo (in this case, 'General Practitioner' ).
    //     * This will throw error if it cannot find a second member to assign variable to.
    //     * This is so because you cannot assign the same patient to the same doctor on the same day more than once.
    //     */

    //     let positionOfAssigned = 1;

    //     patientSearch('611D04E127E58');
    //     browser.sleep(loginDetails.waitSeconds.sleep02);
    //     hiuPage.getUnlockPatient().click();
    //     browser.sleep(loginDetails.waitSeconds.sleep02);

    //     await hiuPage.getDoctorList().map((elem, ind) => {
    //         elem.getText().then(text => {
    //             if (text === 'General Practitioner') {
    //                 expect(elem.getText()).toBe(assignedTo);
    //                 assignedNumber.push(ind);
    //             }
    //         })
    //     })

    //     browser.sleep(loginDetails.waitSeconds.sleep04);
    //     hiuPage.getDoctorListNumber().get(assignedNumber[positionOfAssigned]).getText().then(text => {
    //         initNumber = parseInt(text);
    //     })
    //     await hiuPage.getDoctorListSelector().get(assignedNumber[positionOfAssigned]).click();
    //     browser.sleep(loginDetails.waitSeconds.sleep01);

    //     await hiuPage.getAssignPatient().click();
    //     browser.sleep(loginDetails.waitSeconds.sleep06);
    //     await browser.refresh();
    //     browser.sleep(loginDetails.waitSeconds.sleep06);

    //     await hiuPage.getPatientQueueButton().click();
    //     browser.sleep(loginDetails.waitSeconds.sleep06);
    //     expect(hiuPage.getPatientQueueList().get(assignedNumber[positionOfAssigned]).getText()).toBe((initNumber + 1).toString());

    //     await hiuPage.getPatientQueueViewButton().get(assignedNumber[positionOfAssigned]).click();
    //     browser.sleep(loginDetails.waitSeconds.sleep03);

    //     expect(hiuPage.getPatientQueueViewName().getText()).toBe(`${editedFirstName} ${editedLastName}`)

    //     done();
    // })


    // it('Checking Patient Queue', async (done) => {

    //     let assignedNumber = [];
    //     let initNumber;
    //     let assignedTo = 'General Practitioner';
        

    //     /* PositionOfAssigned
    //    * Always toggle this value between 0 and 1. Also ensure that there exist
    //    * atleast more than one postions for the value of assignedTo (in this case, 'General Practitioner' ).
    //    * This will throw error if it cannot find a second member to assign variable to.
    //    * This is so because you cannot assign the same patient to the same doctor on the same day more than once.
    //    */
    //     let positionOfAssigned = 1;

    //     navigateToOutPatient();
    //     browser.sleep(loginDetails.waitSeconds.sleep03);

    //     await outPatientPage.getProcessPatient().click();
    //     browser.sleep(loginDetails.waitSeconds.sleep03);
    //     await outPatientPage.getSelectOption().click();
    //     browser.sleep(loginDetails.waitSeconds.sleep03);
    //     await outPatientPage.getSelectOptionDropdown().click();
    //     browser.sleep(loginDetails.waitSeconds.sleep03);
    //     await outPatientPage.getTemperatureInput().sendKeys('40');
    //     browser.sleep(loginDetails.waitSeconds.sleep01);
    //     await outPatientPage.getPulseRate().sendKeys('50/243');
    //     browser.sleep(loginDetails.waitSeconds.sleep01);
    //     await outPatientPage.getRespirationRate().sendKeys('34');
    //     browser.sleep(loginDetails.waitSeconds.sleep01);
    //     await outPatientPage.getBloodPressure().sendKeys('72/34');
    //     browser.sleep(loginDetails.waitSeconds.sleep01);

    //     await outPatientPage.getSubmitObservation().click();
    //     browser.sleep(loginDetails.waitSeconds.sleep03);

    //     await outPatientPage.getDoctorList().map((elem, ind) => {
    //         elem.getText().then(text => {
    //             if (text === 'General Practitioner') {
    //                 expect(elem.getText()).toBe(assignedTo);
    //                 assignedNumber.push(ind);
    //             }
    //         })
    //     })

    //     browser.sleep(loginDetails.waitSeconds.sleep04);
    //     outPatientPage.getDoctorListNumber().get(assignedNumber[positionOfAssigned]).getText().then(text => {
    //         initNumber = parseInt(text);
    //     })
    //     await outPatientPage.getDoctorListSelector().get(assignedNumber[positionOfAssigned]).click();
    //     browser.sleep(loginDetails.waitSeconds.sleep01);

    //     await outPatientPage.getQueuePatientButton().click();
    //     browser.sleep(loginDetails.waitSeconds.sleep02);
    //     done();
    // })

    it('Checking Patient Queue', async (done) => {
        navigateToOutPatient();
        browser.sleep(loginDetails.waitSeconds.sleep03);

        outPatientPage.getCreatePharmacy().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        outPatientPage.getCreateNewRequest().sendKeys(`${firstName} ${lastName}`);
        browser.sleep(loginDetails.waitSeconds.sleep01);
        outPatientPage.getSearchButton().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        expect(outPatientPage.getNameConfirm().getText()).toBe(`${firstName} ${lastName}`);

        outPatientPage.getPrescriptionItem().sendKeys('Malaria');
        browser.sleep(loginDetails.waitSeconds.sleep01);
        outPatientPage.getAddPrescriptionItem().click()
        browser.sleep(loginDetails.waitSeconds.sleep01);

        outPatientPage.getAddPrescriptionDesc().sendKeys('Grade 3 Malaria form');
        outPatientPage.getSendPresciption().click();
        done();

    })

})
