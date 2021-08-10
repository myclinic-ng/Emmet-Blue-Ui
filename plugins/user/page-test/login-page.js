
let login = function() {
  let username = element(by.model('login.username'));
  let password =  element(by.model('login.password'));
  let elm = element(by.css('[ng-click="processLogin()"]'));

  let modal = element(by.css('.sweet-alert'));
  let modalHeader = element.all(by.css('.sweet-alert h2'));
  let modalParagraph = element.all(by.css('.sweet-alert p'));
  let modalButton = element(by.css('.sweet-alert button.confirm'));

  let togglePassSlider = element(by.css('[ng-click="togglePassword()"]'));
  let togglePassText = element.all(by.css('[ng-click="togglePassword()"] small'));

  let togglePassWarnTextHeader = element(by.xpath('/html/body/div[2]/div/div/div/div[2]/div/span/center/small/span'));
  let togglePassWarnTextTitle = element(by.xpath('/html/body/div[2]/div/div/div/div[2]/div/span/center/small'));

  let redirecting = element(by.css('.blockUI.blockMsg'));

  this.getElm = () => elm;
  this.getModalButton = () =>  modalButton.get(0);

  this.get = async (val) => await browser.get(val);

  this.setUsername = (val) => username.sendKeys(val);
  this.setPassword = (val) => password.sendKeys(val);

  this.clickGo = (urllink, time) => {
    elm.click();
    browser.sleep(time);
    var url = browser.getCurrentUrl();
    expect(url).toEqual(urllink);
  }

  this.clickLoginGo = (urllink, time) => {
    elm.click();
    browser.sleep(2000);
    browser.ignoreSynchronization = true;
    expect(redirecting.getText()).toBe('redirecting');
    browser.sleep(20000);

    var url = browser.getCurrentUrl();
    expect(url).toEqual(urllink);
  }

  this.modalPopup = () => {
    expect(modal.getCssValue('display')).toBe('block');
  }

  this.modalPopdown = () => {
    modalButton.click();
    browser.sleep(2000);
    expect(modal.getCssValue('display')).toBe('none');
  }

  this.modalResultForWrongDetails = (textHeader, textParagraph) => {
    expect(modalHeader.get(0).getText()).toBe(textHeader);
    expect(modalParagraph.get(0).getText()).toBe(textParagraph);
  }

  this.modalResultForNoDetails = (textHeader, textParagraph) => {
    expect(modalHeader.get(0).getText()).toBe(textHeader);
    expect(modalParagraph.get(0).getText()).toBe(textParagraph);
  }

  this.expectPasswordText = (text) =>
    expect(togglePassText.get(0).getText()).toBe(text.trim().toUpperCase());


  this.togglePassAction = (text) => {
    togglePassSlider.click();
    expect(togglePassText.get(0).getText()).toBe(text.trim().toUpperCase());
  }

  this.togglePassWarning = (warningHeader, warningTitle) => {
    expect(togglePassWarnTextHeader.getText()).toBe(warningHeader.trim());
    expect(togglePassWarnTextTitle.getText()).toBe(warningTitle.trim());
  }
}

module.exports = new login();
