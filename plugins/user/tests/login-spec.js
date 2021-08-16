let loginpage = require('../page-test/login-page');
let loginDetails = require('../../../env-const');

describe('Login page tests', ()=> {
  var appPath = "http://localhost:9898/";
	var originalTimeout;

   // add this in your test
  beforeEach(function() {
       originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
       jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;

       loginpage.get(`${appPath}user/login`);
       // let EC = protractor.ExpectedConditions;
       // browser.wait(EC.elementToBeClickable(loginpage.getElm()), 150000);
   });

   afterEach(function() {
     jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
   });
  //
  // it('User login details fail test', (done) => {
  //   loginpage.setUsername("a");
  //   loginpage.setPassword("b");
  //   let url = loginpage.clickGo(1000);
  //   expect(url).toEqual(appPath+'user/login');
  //
  //   expect(loginpage.getModal().getCssValue('display')).toBe('block');
  //
  //   expect(loginpage.getModalHeader().get(0).getText()).toBe('Invalid login data');
  //   expect(loginpage.getModalParagraph().get(0).getText()).toBe('We were unable to sign you into your account because we could not link the login data you supplied to any account. Please try again with a valid login data');
  //
  //   loginpage.getModalButton().click();
  //   browser.sleep(2000);
  //   expect(loginpage.getModal().getCssValue('display')).toBe('none');
  //   done();
  // })
  //
  //
  // it('User login no details Inputed fail test', (done) => {
  //   loginpage.setUsername("");
  //   loginpage.setPassword("");
  //
  //   let url = loginpage.clickGo(1000);
  //   expect(url).toEqual(appPath+'user/login');
  //
  //   expect(loginpage.getModal().getCssValue('display')).toBe('block');
  //
  //   expect(loginpage.getModalHeader().get(0).getText()).toBe('All fields are required');
  //   expect(loginpage.getModalParagraph().get(0).getText()).toBe('Please enter both your username and password to continue');
  //
  //   loginpage.getModalButton().click();
  //   browser.sleep(1000);
  //   expect(loginpage.getModal().getCssValue('display')).toBe('none');
  //   done();
  // })

  it('Hide Show Password', (done) => {
    expect(loginpage.getTogglePassText.get(0).getText()).toBe("show plain text".trim().toUpperCase());
    loginpage.getTogglePassSlider.click();
    expect(loginpage.getTogglePassText.get(0).getText()).toBe("hide password".trim().toUpperCase());

    // loginpage.togglePassWarning("Security Risk:", "Your password is visible to the general public");
    done();
  })
  //
  // it('User login details correct',  async (done) => {
  //   loginpage.setUsername(loginDetails.username);
  //   loginpage.setPassword(loginDetails.password);
  //
  //   loginpage.getElm.click();
  //   browser.sleep(2000);
  //   browser.ignoreSynchronization = true;
  //   expect(loginpage.getRedirecting.getText()).toBe('redirecting');
  //   browser.sleep(2000);
  //
  //   var url = await browser.getCurrentUrl();
  //   expect(url).toEqual(appPath+'records/patient/dashboard');
  //
  //   done();
  //  })
})
