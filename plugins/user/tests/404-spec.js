describe('emmetblue user/404', function(){
	var appPath = "http://localhost:9898/";
	var originalTimeout;

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = jasmine.DEFAULT_TIMEOUT_INTERVAL*10;
    });

    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

	it('should not allow anon users', function(){
		browser.get(appPath+'user/404');

		var url = browser.getCurrentUrl();
		console.log(url);
		expect(url).toEqual(appPath+'user/login');
	})
})
