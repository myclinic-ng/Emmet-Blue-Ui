
let global = function() {
  let logoutButton = element(by.css('[ng-click="logout()"]'));

  this.getElm = () => elm;


    this.clickLogout = async (urllink, time) => {
      elm.click();
      browser.sleep(time);
      var url = await browser.getCurrentUrl();
      expect(url).toEqual(urllink);
    }

}

module.exports = new global();
