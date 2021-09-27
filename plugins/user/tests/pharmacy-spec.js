
let loginpage = require('../page-test/login-page');
let loginDetails = require('../../../env-const');
const globalPage = require('../page-test/global-page');
const pharmacyPage = require('../page-test/pharmacy-page');
const { getManagebillingItems } = require('../page-test/pharmacy-page');



// Global variables
var originalTimeout;
let addInventoryItem;
let newBillingTypeName = 'Test Billing Type Name';
let newBillingTypeDesc = 'Test Billing Type Description';

let newBillingTypeNameEdit = 'Test Billing Type Name Edit';
let newBillingTypeDescEdit = 'Test Billing Type Description Edit';


let newInventoryText;
let itemBrand = 'Extol';
let itemManufacturer = 'Genesis';
let titleTag = '2 spaces';
let tagValue = 40;


// Global Functions
function login() {
    // Logging-in
    loginpage.get(`${loginDetails.appPath}user/login`);

    let EC = protractor.ExpectedConditions;
    browser.wait(EC.elementToBeClickable(loginpage.getElm()), 10000);

    loginpage.setUsername(loginDetails.username);
    loginpage.setPassword(loginDetails.password);

    loginpage.getElm().click();
    browser.ignoreSynchronization = true;
    browser.sleep(10000);
}

async function navigateToPharmacy() {
    globalPage.getSwitchDept().click();
    browser.sleep(loginDetails.waitSeconds.sleep01);

    let MC = protractor.ExpectedConditions;
    browser.wait(MC.elementToBeClickable(globalPage.getPharmacy()), 2000);

    await globalPage.getPharmacy().click();
    browser.sleep(loginDetails.waitSeconds.sleep05);

    var url = await browser.getCurrentUrl();
    expect(url).toEqual(`${loginDetails.appPath}${loginDetails.departments.Pharmacy}`);
}

describe('Pharmacy Module Tests', () => {
    // add this in your test
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
        login();
        navigateToPharmacy()
    });
    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    beforeAll(function (){
        browser.driver.manage().window().maximize();
    })

    it('Manage Inventories Tests', async function(done){

        browser.sleep(loginDetails.waitSeconds.sleep01);
        await pharmacyPage.getManageInventory().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getManageInventoryNewItem().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        addInventoryItem = await pharmacyPage.getAddInventoryFirstItemText().getText();
        console.log(addInventoryItem);
        await pharmacyPage.getAddInventoryFirstItemCheckbox().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        await pharmacyPage.getAddInventoryFirstItemButton().click();

        browser.sleep(loginDetails.waitSeconds.sleep04);
        done();
    })

    it('Manage Billing Items', async function (done) {

        // // Creating new billing type
        await pharmacyPage.getManagebillingItems().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getNewBillingType().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        await pharmacyPage.getBillingTypeName().sendKeys(newBillingTypeName);
        await pharmacyPage.getBillingTypeDescription().sendKeys(newBillingTypeDesc);

        await pharmacyPage.getBillingButtonSave().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        // testing new billing type appears in list dropdown
        expect(pharmacyPage.getBillingtypeItemInputNameCheck().getText()).toBe(newBillingTypeName);
        expect(pharmacyPage.getBillingtypeItemInputDescCheck().getText()).toBe(newBillingTypeDesc);

        done();

        // await pharmacyPage.getBillingtypeItemButtonSelect().click();
        // browser.sleep(loginDetails.waitSeconds.sleep02);

        // await pharmacyPage.getBillingtypeItemInputEdit().click();
        // browser.sleep(loginDetails.waitSeconds.sleep02);



        // await pharmacyPage.getBillingTypeNameEdit().clear().then(() => {
        //     pharmacyPage.getBillingTypeNameEdit().sendKeys(newBillingTypeNameEdit);
        // })
        // await pharmacyPage.getBillingTypeDescEdit().clear().then(() => {
        //     pharmacyPage.getBillingTypeDescEdit().sendKeys(newBillingTypeDescEdit);
        // });

        // await pharmacyPage.getBillingButtonSave().click();
        // browser.sleep(loginDetails.waitSeconds.sleep02);

        // // Editing billing type created in prev test
        // browser.sleep(loginDetails.waitSeconds.sleep02);
        // expect(pharmacyPage.getBillingtypeItemInputNameCheck().getText()).toBe(newBillingTypeNameEdit);
        // expect(pharmacyPage.getBillingtypeItemInputDescCheck().getText()).toBe(newBillingTypeDescEdit);

        // await pharmacyPage.getBillingTypeEditSave().click();
        // browser.sleep(loginDetails.waitSeconds.sleep02);

        // await pharmacyPage.getBillingTypeItemButtonSelect().click();
        // browser.sleep(loginDetails.waitSeconds.sleep02);
        // await pharmacyPage.getBillingTypeItemDelete().click();
        // browser.sleep(loginDetails.waitSeconds.sleep01);
        // await pharmacyPage.getBillingTypeDelete().click();

        // expect(pharmacyPage.getBillingtypeItemInputNameCheck().getText()).not.toBe(!newBillingTypeNameEdit);
        // expect(pharmacyPage.getBillingtypeItemInputDescCheck().getText()).not.toBe(!newBillingTypeDescEdit);


        // done();
    });



    it('Manage Inventory Items', async function (done) {

        await pharmacyPage.getInventoryManagement().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getNewInventoryButton().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getNewInventorySelectDropDown().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getNewInventoryFirstChild().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getNewInventoryChosen().getText().then((text)=>{
            newInventoryText = text;
        });
        console.log(newInventoryText);
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getNewInventoryItemBrand().sendKeys(itemBrand);
        await pharmacyPage.getNewInventoryItemManufacturer().sendKeys(itemManufacturer);
        await pharmacyPage.getNewInventoryTagTitle().sendKeys(titleTag);
        await pharmacyPage.getNewInventoryTagValue().sendKeys(tagValue);
        await pharmacyPage.getNewInventoryAddToList().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        expect(pharmacyPage.getNewInventoryTagList().getText()).toBe(titleTag)

        await pharmacyPage.getNewInventorySaveNewItem().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await pharmacyPage.getSearchInterval().sendKeys(newInventoryText);
        await pharmacyPage.getSearchInterval().sendKeys(protractor.Key.ENTER);

        browser.sleep(loginDetails.waitSeconds.sleep02);
        expect(await pharmacyPage.getItemSavedSuccess().getText()).toBe(`${newInventoryText}\n${itemBrand}, ${itemManufacturer}`);
        done();
    })


    it('Store Management Component', async function(done){
        let totalItemsInstore;
        await pharmacyPage.getStoreManagementButton().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getSelectStore().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getSelectFirstDropDown().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        
        await pharmacyPage.getSelectItemOption().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await pharmacyPage.getFirstItemSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getSetItemQuantity().sendKeys('1');
        await pharmacyPage.getTotalItemsInStore().getText().then((text) => {
            totalItemsInstore = parseInt(text);
        });
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await pharmacyPage.getAddButtonSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await pharmacyPage.getUpdateButtonClick().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await pharmacyPage.getTotalItemsInStore().getText().then((text) => {
            expect(parseInt(text)).toEqual((totalItemsInstore + 1));
        });
        await pharmacyPage.getItemConfirmed().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);


        await pharmacyPage.getTransferItems().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);

        await pharmacyPage.getSelectReceivingStore().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);

        await pharmacyPage.getSecondItemSelect().click()
        browser.sleep(loginDetails.waitSeconds.sleep01);
        await pharmacyPage.getSelectTransferDropDown().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        await pharmacyPage.getSelectFirstTransferItem().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);

        await pharmacyPage.getTransferQuantity().sendKeys('1');
        browser.sleep(loginDetails.waitSeconds.sleep01);

        await pharmacyPage.getAddTransferItem().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);

        await pharmacyPage.getTotalItemsInStore().getText().then((text) => {
            totalItemsInstore = parseInt(text);
        });
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getTransferButton().click()
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await pharmacyPage.getTotalItemsInStore().getText().then((text) => {
            expect(parseInt(text)).toEqual((totalItemsInstore - 1));
        });

        done();
    })



    it('Dispensation log', async function(done){
        let patientID = 'Adeola Moses Adebayo';

        await pharmacyPage.getDispensationButton().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getNewDispensation().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);

        await pharmacyPage.getSelectPatientId().sendKeys(patientID);
        browser.sleep(loginDetails.waitSeconds.sleep01);
        await pharmacyPage.getButtonSearch().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await pharmacyPage.getDispensorySelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        await pharmacyPage.getDispensoryDropdown().click();
        browser.sleep(loginDetails.waitSeconds.sleep03);
        await pharmacyPage.getSelectDispensoryStore().click();
        browser.sleep(loginDetails.waitSeconds.sleep01);
        await pharmacyPage.getDispensoryStoreSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await pharmacyPage.getFirstItemList().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await pharmacyPage.getFirstItemListSelect().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);


        await pharmacyPage.getGeneratPayment().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);

        await browser.refresh();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        await pharmacyPage.getDispensationButton().click();
        browser.sleep(loginDetails.waitSeconds.sleep02);
        expect(await pharmacyPage.getPaymentListConfirm().getText()).toBe(patientID)

        done();
    })
})
