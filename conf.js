exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },
  specs: ['./plugins/**/tests/**-spec.js']
   // specs: ['./plugins/**/tests/login-spec.js'],

   allScriptsTimeout: 30000,

};
