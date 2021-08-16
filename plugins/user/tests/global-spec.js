let globalPage = require('../page-test/global-page');
let loginpage = require('../page-test/login-page');
let loginDetails = require('../../../env-const');
const { getToggleBillingDismiss } = require('../page-test/global-page');

describe('Global Spec Tests page tests', ()=> {
  var appPath = "http://localhost:9898/";
	var originalTimeout;
 
   // add this in your test
  beforeEach(function() {
       originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
       jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
       loginpage.get(`${appPath}user/login`);

       // Logging-in
        let EC = protractor.ExpectedConditions;
        browser.wait(EC.elementToBeClickable(loginpage.getElm()), 10000);

        loginpage.setUsername(loginDetails.username);
        loginpage.setPassword(loginDetails.password);

        loginpage.getElm().click();
        browser.ignoreSynchronization = true;
        browser.sleep(10000);
   });

   afterEach(function() {
     jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
   });

    it('Toggle Billing Tests',  async (done) => {
      await globalPage.getToggleBilling().click();
      browser.sleep(2000);
      expect(globalPage.getToggleBillingContainer().isPresent()).toBe(true);
      globalPage.getToggleBillingDismiss().click();
      expect(globalPage.getToggleBillingContainer().isPresent()).toBe(false);       
      done();
    });


    it('Dashboard Home Button',  async (done) => {
    
        await globalPage.getHomeButton().click();
        browser.sleep(2000);
        var url = await browser.getCurrentUrl();
        expect(url).toEqual(`${appPath}${loginDetails.departments.HIU}`);
        done();
      });


       it('User logout test',  async (done) => {

        await globalPage.getDropDown().click();
        browser.sleep(2000);

        let MC = protractor.ExpectedConditions;
        browser.wait(MC.elementToBeClickable(globalPage.getLogoutButton()), 100000);

        var url = await globalPage.clickLogout(5000);
        expect(url).toEqual(`${appPath}user/login`);

        done();
        });


})
