
let global = function() {

  let logoutButton = element(by.css('[ng-click="logout()"]'));
  let dropdown = element(by.css('.dropdown-user'));

  let homeButton = element(by.css('[ng-click="returnToPrimaryDept()"]'));
  let toggleBilling = element(by.css('[ng-click="toggleBillingMenu()"]'));
  let toggleBillingDismiss = element(by.linkText('DISMISS'));
  let toggleBillingDashboard = element(by.linkText('Go To Billing Dashboard'));
  let toggleBillingContainer = element(by.css('#navbar-first'));
  let switchDept = element(by.css('[ng-click="loadSwitchableDepts()"]'));
  let hiu = element(by.css('ul.dropdown-menu-right li:nth-child(3) a'));
  let dispensory = element(by.css('ul.dropdown-menu-right li:nth-child(4) a'));
  let pharmacy = element(by.css('ul.dropdown-menu-right li:nth-child(5) a'));
  let billing = element(by.css('ul.dropdown-menu-right li:nth-child(6) a'));
  let financialAccounting = element(by.css('ul.dropdown-menu-right li:nth-child(7) a'));
  let transactionAuditing = element(by.css('ul.dropdown-menu-right li:nth-child(8) a'));
  let medicalDoctor = element(by.css('ul.dropdown-menu-right li:nth-child(9) a'));
  let outPatient = element(by.css('ul.dropdown-menu-right li:nth-child(10) a'));
  let inPatient = element(by.css('ul.dropdown-menu-right li:nth-child(11) a'));
  let combinedLab = element(by.css('ul.dropdown-menu-right li:nth-child(12) a'));

  

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
