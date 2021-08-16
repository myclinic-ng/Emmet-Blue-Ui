let globalPage = require('../page-test/global-page');
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

   });

   afterEach(function() {
     jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
   });

   it('User login details correct',  (done) => {
     loginpage.setUsername(loginDetails.username);
     loginpage.setPassword(loginDetails.password);
     loginpage.clickLoginGo(appPath+'records/patient/dashboard', 0);
     browser.sleep(2000);
     done();
    })
})
