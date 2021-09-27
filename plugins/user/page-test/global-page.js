
const global = function() {

  const logoutButton = element(by.css('[ng-click="logout()"]'));
  const dropdown = element(by.css('.dropdown-user'));

  const homeButton = element(by.css('[ng-click="returnToPrimaryDept()"]'));
  const toggleBilling = element(by.css('[ng-click="toggleBillingMenu()"]'));
  const toggleBillingDismiss = element(by.linkText('DISMISS'));
  const toggleBillingDashboard = element(by.linkText('Go To Billing Dashboard'));
  const toggleBillingContainer = element(by.css('#navbar-first'));
  const switchDept = element(by.css('[ng-click="loadSwitchableDepts()"]'));
  const hiu = element(by.css('ul.dropdown-menu-right li:nth-child(3) a'));
  const dispensory = element(by.css('ul.dropdown-menu-right li:nth-child(4) a'));
  const pharmacy = element(by.css('ul.dropdown-menu-right li:nth-child(5) a'));
  const billing = element(by.css('ul.dropdown-menu-right li:nth-child(6) a'));
  const financialAccounting = element(by.css('ul.dropdown-menu-right li:nth-child(7) a'));
  const transactionAuditing = element(by.css('ul.dropdown-menu-right li:nth-child(8) a'));
  const medicalDoctor = element(by.css('ul.dropdown-menu-right li:nth-child(9) a'));
  const outPatient = element(by.css('ul.dropdown-menu-right li:nth-child(10) a'));
  const inPatient = element(by.css('ul.dropdown-menu-right li:nth-child(11) a'));
  const combinedLab = element(by.css('ul.dropdown-menu-right li:nth-child(12) a'));

  

  this.getDropDown = () => dropdown;
  this.getLogoutButton = () => logoutButton;
  this.getHomeButton = () => homeButton;
  this.getToggleBilling = () => toggleBilling;
  this.getToggleBillingDismiss = () => toggleBillingDismiss;
  this.getToggleBillingDashboard = () => toggleBillingDashboard;
  this.getToggleBillingContainer = () => toggleBillingContainer;
  this.getSwitchDept = () => switchDept;
  this.getHIU = () => hiu;
  this.getDispensory = () => dispensory;
  this.getPharmacy = () => pharmacy;
  this.getBilling = () => billing;
  this.getFinancialAccounting = () => financialAccounting;
  this.getTransactionAuditing = () => transactionAuditing;
  this.getMedicalDoctor = () => medicalDoctor;
  this.getOutPatient = () => outPatient;
  this.getInpatient = () => inPatient;
  this.getCombinedLab = () => combinedLab;

  this.clickLogout = async (time) => {
    logoutButton.click();
    browser.sleep(time);
    var url = await browser.getCurrentUrl();
    return url
  }
}

module.exports = new global();
