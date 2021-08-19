let globalPage = require('../page-test/global-page');
let loginpage = require('../page-test/login-page');
let loginDetails = require('../../../env-const');
const { getToggleBillingDismiss } = require('../page-test/global-page');
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

describe('Global Spec Tests page tests', () => {

  // add this in your test
  beforeEach(function () {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
    login();
  });

  afterEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('Toggle Billing Tests', async (done) => {
    await globalPage.getToggleBilling().click();
    browser.sleep(2000);
    expect(globalPage.getToggleBillingContainer().isPresent()).toBe(true);
    globalPage.getToggleBillingDismiss().click();
    expect(globalPage.getToggleBillingContainer().isPresent()).toBe(false);
    done();
  });


  it('Dashboard Home Button', async (done) => {

    await globalPage.getHomeButton().click();
    browser.sleep(2000);
    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.HIU}`);
    done();
  });


  it('User logout test', async (done) => {
    await globalPage.getDropDown().click();
    browser.sleep(2000);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getLogoutButton()), 100000);

    var url = await globalPage.clickLogout(5000);
    expect(url).toEqual(`${loginDetails.appPath}user/login`);

    done();
  });

})


describe('Global Spec For Switch Depts', () => {

  beforeAll(function () {
    login();
  });

  beforeEach(function () {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
    browser.sleep(5000);
  })
  afterEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    browser.sleep(5000);

  })


  it('Health Information Unit', async (done) => {
    await globalPage.getSwitchDept().click();
    browser.sleep(1000);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getHIU()), 2000);

    globalPage.getHIU().click();
    browser.sleep(5000);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.HIU}`);
    done();
  });

  it('Dispensory', async (done) => {
    await globalPage.getSwitchDept().click();
    browser.sleep(1000);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getDispensory()), 2000);

    globalPage.getDispensory().click();
    browser.sleep(5000);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.Dispensory}`);
    done();
  });

  it('Pharmacy', async (done) => {
    await globalPage.getSwitchDept().click();
    browser.sleep(1000);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getPharmacy()), 2000);

    globalPage.getPharmacy().click();
    browser.sleep(5000);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.Pharmacy}`);
    done();
  });

  it('Billing', async (done) => {
    await globalPage.getSwitchDept().click();
    browser.sleep(1000);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getBilling()), 2000);

    globalPage.getBilling().click();
    browser.sleep(5000);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.Billing}`);
    done();
  });

  it('Financial Accounting', async (done) => {
    await globalPage.getSwitchDept().click();
    browser.sleep(1000);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getFinancialAccounting()), 2000);

    globalPage.getFinancialAccounting().click();
    browser.sleep(5000);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.FinancialAccounting}`);
    done();
  });


  it('Transaction Auditing', async (done) => {
    await globalPage.getSwitchDept().click();
    browser.sleep(1000);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getTransactionAuditing()), 2000);

    globalPage.getTransactionAuditing().click();
    browser.sleep(5000);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.TransactionAuditing}`);
    done();
  });

  it('Medical Doctor/Consultation', async (done) => {
    await globalPage.getSwitchDept().click();
    browser.sleep(1000);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getMedicalDoctor()), 2000);

    globalPage.getMedicalDoctor().click();
    browser.sleep(5000);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.MedicalDoctor}`);
    done();
  });

  it('Out-Patient Nursing Unit', async (done) => {
    await globalPage.getSwitchDept().click();
    browser.sleep(1000);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getOutPatient()), 2000);

    globalPage.getOutPatient().click();
    browser.sleep(5000);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.OutPatient}`);
    done();
  });

  it('In-Patient Nursing Unit', async (done) => {
    await globalPage.getSwitchDept().click();
    browser.sleep(1000);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getInpatient()), 2000);

    globalPage.getInpatient().click();
    browser.sleep(5000);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.Inpatient}`);
    done();
  });

  it('Combined Lab', async (done) => {
    await globalPage.getSwitchDept().click();
    browser.sleep(1000);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getCombinedLab()), 2000);

    globalPage.getCombinedLab().click();
    browser.sleep(5000);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.CombinedLab}`);
    done();
  });
})


