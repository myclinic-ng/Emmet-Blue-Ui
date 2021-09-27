
const login = function() {
  const username = element(by.model('login.username'));
  const password =  element(by.model('login.password'));
  const elm = element(by.css('[ng-click="processLogin()"]'));

  const modal = element(by.css('.sweet-alert'));
  const modalHeader = element.all(by.css('.sweet-alert h2'));
  const modalParagraph = element.all(by.css('.sweet-alert p'));
  const modalButton = element(by.css('.sweet-alert button.confirm'));

  const togglePassSlider = element(by.css('[ng-click="togglePassword()"]'));
  const togglePassText = element.all(by.css('[ng-click="togglePassword()"] span.ng-scope'));

  const redirecting = element(by.css('.blockUI.blockMsg'));

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
