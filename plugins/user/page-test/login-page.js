
let login = function() {
  let username = element(by.model('login.username'));
  let password =  element(by.model('login.password'));
  let elm = element(by.css('[ng-click="processLogin()"]'));

  let modal = element(by.css('.sweet-alert'));
  let modalHeader = element.all(by.css('.sweet-alert h2'));
  let modalParagraph = element.all(by.css('.sweet-alert p'));
  let modalButton = element(by.css('.sweet-alert button.confirm'));

  let togglePassSlider = element(by.css('[ng-click="togglePassword()"]'));
  let togglePassText = element.all(by.css('[ng-click="togglePassword()"] span.ng-scope'));

  let redirecting = element(by.css('.blockUI.blockMsg'));

  this.getElm = () => elm;
  this.getModalButton = () =>  modalButton.get(0);
  this.get = async (val) => await browser.get(val);
  this.getModal = () => modal
  this.getModalHeader = () => modalHeader
  this.getModalParagraph = () => modalParagraph
  this.getModalButton = () => modalButton

  this.getTogglePassSlider = () => togglePassSlider
  this.getTogglePassText = () => togglePassText

  this.getRedirecting = () => redirecting

  this.setUsername = (val) => username.sendKeys(val);
  this.setPassword = (val) => password.sendKeys(val);

  this.clickGo = async (time) => {
    elm.click();
    browser.sleep(time);
    var url = await browser.getCurrentUrl();
    return url
  }

}

module.exports = new login();
