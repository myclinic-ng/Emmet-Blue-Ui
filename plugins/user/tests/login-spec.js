let loginpage = require('../page-test/login-page');
let loginDetails = require('../page-test/env-const');

describe('Login page tests', ()=> {
  var appPath = "http://localhost:9898/";
	var originalTimeout;

   // add this in your test
  beforeEach(function() {
       originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
       jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;

       loginpage.get(`${appPath}user/login`);
       let EC = protractor.ExpectedConditions;
       browser.wait(EC.elementToBeClickable(loginpage.getElm()), 15000);
   });

   afterEach(function() {
     jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
   });

    it('User login details fail test', (done) => {

      loginpage.setUsername("3");
      loginpage.setPassword("4");
      loginpage.clickGo(appPath+'user/login', 0);
      loginpage.modalPopup();
      loginpage.modalResultForWrongDetails('Invalid login data', 'We were unable to sign you into your account because we could not link the login data you supplied to any account. Please try again with a valid login data');
      loginpage.modalPopdown();
      done();
    })

  it('User login no details Inputed fail test', (done) => {
     loginpage.setUsername("");
    loginpage.setPassword("");
    loginpage.clickGo(appPath+'user/login', 0);
    loginpage.modalPopup();
    loginpage.modalResultForNoDetails('All fields are required', 'Please enter both your username and password to continue' );
    loginpage.modalPopdown();
    done();
  })

  it('Hide Show Password', (done) => {
    loginpage.expectPasswordText("show plain text");
    loginpage.togglePassAction("hide password");

    loginpage.togglePassWarning("Security Risk:", "Your password is visible to the general public");

    done();
  })

  it('User login details correct',  (done) => {
    loginpage.setUsername(loginDetails.username);
    loginpage.setPassword(loginDetails.password);
    loginpage.clickLoginGo(appPath+'records/patient/dashboard', 0);
    browser.sleep(2000);
    done();
   })
})
