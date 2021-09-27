
const dispensory = function() {

    // Dispensation Log
    const dispensationButton = element(by.xpath("//a[contains(.,'Dispensing Workspace')]"))
    const newDispensation = element(by.css(".dt-buttons > a:nth-of-type(1)"));
    const selectPatientId = element(by.css("[ng-model='patientNumber']"));
    const buttonSearch = element(by.css("[ng-click='loadPatientProfile()']"));
    const dispensorySelect = element(by.css(".col-md-3.content-group .select2-choice"))
    const dispensoryDropdown = element(by.xpath("//div[.='Main Dispensary']"))
    const selectDispensoryStore = element(by.css(".col-md-4.content-group .select2-choice"));
    const dispensoryStoreSelect = element(by.css(".select2-results-dept-0"));
    
    const firstItemList = element(by.css("[dt-options='ddtOptions'] tbody tr:first-child td:last-child div button"))
    const firstItemListSelect = element(by.css("[ng-click='addItemToList()']"));
    const generatPayment = element(by.css("[ng-click='generatePaymentRequest()']"));

    const getPaymentListConfirm = element(by.css("[dt-options='dtOptions'] tbody tr:last-child td:nth-child(2) div.media-left div:first-child a"))
    const reloadDispensation = element(by.css("[data-action='reload']"));



    this.getDispensationButton = () => dispensationButton;
    this.getNewDispensation = () => newDispensation;
    this.getSelectPatientId = () => selectPatientId;
    this.getButtonSearch = () => buttonSearch;
    this.getDispensorySelect = () => dispensorySelect;
    this.getDispensoryDropdown = () => dispensoryDropdown;
    this.getSelectDispensoryStore = () => selectDispensoryStore;
    this.getDispensoryStoreSelect = () => dispensoryStoreSelect;

    this.getFirstItemList = () => firstItemList;
    this.getFirstItemListSelect = () => firstItemListSelect;
    this.getGeneratPayment = () => generatPayment;
    this.getPaymentListConfirm = () => getPaymentListConfirm;

    this.getPaymentListConfirm = () => getPaymentListConfirm;
    this.getReloadDispensation = () => reloadDispensation;

}
module.exports = new dispensory();

