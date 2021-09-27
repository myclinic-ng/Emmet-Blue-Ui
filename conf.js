exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',

  /* Run all tests by using this query
  */
  // specs: ['./plugins/**/tests/**-spec.js'],

  /* Run individual tests by uncommenting the desired text
  */
 
  // specs: ['./plugins/**/tests/login-spec.js'],
  // specs: ['./plugins/**/tests/global-spec.js'],
  // specs: ['./plugins/**/tests/hiu-spec.js'],
  // specs: ['./plugins/**/tests/pharmacy-spec.js'],
  // specs: ['./plugins/**/tests/dispensory-spec.js'],
  specs: ['./plugins/**/tests/out-patient-spec.js'],

  jasmineNodeOpts: { defaultTimeoutInterval: 120000 },

  allScriptsTimeout: 40000,

};
