
let global = function() {

  let logoutButton = element(by.css('[ng-click="logout()"]'));
  let dropdown = element(by.css('.dropdown-user'));

  let homeButton = element(by.css('[ng-click="returnToPrimaryDept()"]'));
  let toggleBilling = element(by.css('[ng-click="toggleBillingMenu()"]'));
  let toggleBillingDismiss = element(by.linkText('DISMISS'));
  let toggleBillingDashboard = element(by.linkText('Go To Billing Dashboard'));
  let toggleBillingContainer = element(by.css('#navbar-first'));
  
  this.getDropDown = () => dropdown;
  this.getLogoutButton = () => logoutButton;
  this.getHIU = () => HIU;
  this.getElementByText = () => HIU;
  this.getHomeButton = () => homeButton;
  this.getToggleBilling = () => toggleBilling;
  this.getToggleBillingDismiss = () => toggleBillingDismiss;
  this.getToggleBillingDashboard = () => toggleBillingDashboard;
  this.getToggleBillingContainer = () => toggleBillingContainer;

  this.clickLogout = async (time) => {
    logoutButton.click();
    browser.sleep(time);
    var url = await browser.getCurrentUrl();
    return url
  }
}

module.exports = new global();
