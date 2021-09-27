
let loginpage = require('../page-test/login-page');
let loginDetails = require('../../../env-const');
const globalPage = require('../page-test/global-page');
const dispensoryPage = require('../page-test/dispensory-page');



// Global variables
var originalTimeout;


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

async function navigateToDispensory() {
    globalPage.getSwitchDept().click();
    browser.sleep(loginDetails.waitSeconds.sleep01);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getDispensory()), 2000);

    await globalPage.getDispensory().click();
    browser.sleep(loginDetails.waitSeconds.sleep05);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.Dispensory}`);
}

describe('Dispensory Module Tests', () => {
    // add this in your test
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
        login();
        navigateToDispensory()
    });
    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    beforeAll(function (){
        browser.driver.manage().window().maximize();
    })


    it('Dispensation log', async function(done){
        let patientID = 'Adeola Moses Adebayo';

        await dispensoryPage.getDispensationButton().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await dispensoryPage.getNewDispensation().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);

        await dispensoryPage.getSelectPatientId().sendKeys(patientID);
        browser.sleep(loginDetails.waitSeconds.sleep01);
        await dispensoryPage.getButtonSearch().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await dispensoryPage.getDispensorySelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        await dispensoryPage.getDispensoryDropdown().click();
        browser.sleep(loginDetails.waitSeconds.sleep03);
        await dispensoryPage.getSelectDispensoryStore().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        await dispensoryPage.getDispensoryStoreSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await dispensoryPage.getFirstItemList().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await dispensoryPage.getFirstItemListSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);


        await dispensoryPage.getGeneratPayment().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await browser.refresh();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await dispensoryPage.getDispensationButton().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        expect(await dispensoryPage.getPaymentListConfirm().getText()).toBe(patientID)

        done();
    })
})
