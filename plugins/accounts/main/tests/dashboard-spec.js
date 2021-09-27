describe('emmetblue accounts/main/dashboard', function(){
	var appPath = "http://localhost:9898/";
	var originalTimeout;

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL*10;
    });

    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    
	it('should not allow anon users', async function(){
		await browser.get(appPath+'user/404');

    browser.sleep(10000);
		var url = browser.getCurrentUrl();
		expect(url).toEqual(appPath+'user/login');
	})
})

