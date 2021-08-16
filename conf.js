exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // specs: ['./plugins/**/tests/**-spec.js'],
   specs: ['./plugins/**/tests/login-spec.js'],

   jasmineNodeOpts: {defaultTimeoutInterval: 120000},

   allScriptsTimeout: 40000,

};
