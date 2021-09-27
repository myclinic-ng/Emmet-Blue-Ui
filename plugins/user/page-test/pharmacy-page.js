
const pharmacy = function() {

    const manageInventory = element(by.css(".bg-teal-400"));
    const manageInventoryNewItem = element(by.xpath("//a[contains(.,'New Item')]"));
    const addInventoryFirstItemText = element(by.css(".col-md-12.table-responsive tbody tr:first-child td:nth-child(2)"));
    const addInventoryFirstItemCheckbox = element(by.css(".col-md-12.table-responsive tbody tr:first-child td:last-child div.checkbox"));
    const addInventoryFirstItemButton = element(by.css("[ng-click='saveNewItem()']"));

    const managebillingItems = element(by.css("[href='pharmacy/billing-types']"));
    const newBillingType = element(by.xpath("//a[contains(.,'New billing type')]"));
    const billingTypeName = element(by.css("[ng-model='newBillingType.billingTypeName']"));
    const billingTypeDescription = element(by.css("[ng-model='newBillingType.billingTypeDescription']"));
    const billingButtonSave = element(by.css("[ng-click='saveNewBillingType()']"));
    const billingButtonCancel = element(by.css("[ng-click='newBillingType = {}']"));
        
    const billingtypeItemInputNameCheck = element(by.css("[dt-options='dtOptions'] tbody tr:last-child td:nth-child(2)"));
    const billingtypeItemInputDescCheck = element(by.css("[dt-options='dtOptions'] tbody tr:last-child td:nth-child(3)"));

    const billingtypeItemButtonSelect = element(by.css("table tbody tr:last-child td:last-child div button:last-child"))


    const billingtypeItemInputEdit = element(by.css("[dt-options='dtOptions'] tbody tr:last-child td:nth-child(4) div ul li a:first-child"));
    
    
    const billingTypeItemButtonSelect = element(by.css("[dt-options='dtOptions'] tbody tr:last-child td:last-child div button:nth-child(2)"));
    const billingTypeItemDeconste = element(by.css("[dt-options='dtOptions'] tbody tr:last-child td:last-child div ul li:nth-child(2) a:first-child"))
    const billingTypeDeconste = element(by.css(".confirm"));

    const billingTypeNameEdit = element(by.css("[ng-model='tempHolder.billingTypeName']"));
    const billingTypeDescEdit = element(by.css("[ng-model='tempHolder.billingTypeDescription']"));
    const billingTypeEditSave = element(by.css("[ng-click='saveEditBillingType()']"));

    const InventoryManagement = element(by.css("[href='pharmacy/inventory-items']"));
    const newInventoryButton = element(by.css(".btn[tabindex='0']"))
    const newInventorySelectDropDown = element(by.css("[href='javascript:void(0)']"));
    const newInventoryFirstChild  = element(by.css(".select2-result-sub li:first-child"))
    const newInventoryChosen = element(by.css(".select2-chosen"));
    const newInventoryItemBrand = element(by.css("[ng-model='newItem.brand']"));
    const newInventoryItemManufacturer = element(by.css("[ng-model='newItem.manufacturer']"));
    const newInventoryTagTitle = element(by.css("#new_inventory_item [ng-model='itemTag.title']"));
    const newInventoryTagValue = element(by.css("#new_inventory_item [ng-model='itemTag.name']"));
    const newInventoryAddToList = element(by.css("[ng-click='addTagToList()']"));
    const newInventoryTagList = element(by.css("#new_inventory_item tbody tr:first-child th:nth-child(2)"));
    const newInventorySaveNewItem = element(by.css("[ng-click='saveNewItem()']"));
    const searchInterval = element(by.css("[type='search']"));

    const ItemSearchedList = element(by.css(".table-striped > tbody tr:last-child td:last-child div button"));
    const ItemSavedSuccess = element(by.css(".table-striped > tbody tr:last-child td:nth-child(2) p"));
    const ItemSearchedDeconste = element(by.css(".table-striped > tbody tr:last-child td:last-child div ul li:last-child a"));
    

    // Store management DOM fetch
    const storeManagementButton = element(by.css(`[ng-click="loadPageSegment('store-management')"]`));
    const selectStore = element(by.css(".heading-form .select2-choice"));
    const selectFirstDropDown = element(by.xpath("//div[.='Main Store']"))
    const selectItemOption = element(by.css("[ng-controller='pharmacyStoreRestockController'] .select2-search-field"))

    const firstItemSelect = element(by.css("div:nth-of-type(8) > .select2-results li:first-child"))
    const setItemQuantity = element(by.css("[ng-controller='pharmacyStoreRestockController'] > .row .form-control"))
    const addButtonSelect = element(by.css("[ng-controller='pharmacyStoreRestockController'] > .row .btn"))
    const updateButtonClick = element(by.css("[ng-click='save()']"));
    const totalItemsInStore = element(by.css("[ng-bind-html='statistics.itemLeftInStore']"));
    const confirmed = element(by.css(".confirm"));

    const transferItems = element(by.css("[href='#store_transfer_to_store'] > .text-size-small"));
    const selectReceivingStore = element(by.css(".col-md-offset-3 > .select2-container"));

    const secondItemSelect = element(by.xpath("//div[.='Jambutu Campus Store']"));
    const selectTransferDropDown = element(by.css("[ng-controller='pharmacyStoreTransferController'] .select2-choices"))
    const selectFirstTransferItem = element(by.css(".select2-highlighted > .select2-result-label"));
    const transferQuantity = element(by.css("[ng-controller='pharmacyStoreTransferController'] > .row .form-control"));
    
    const addTransferItem = element(by.css("[ng-controller='pharmacyStoreTransferController'] > .row .btn"));
    const transferButton = element(by.css("[ng-click='storeTransfer()']"));





    // Inventory Management
    this.getInventoryManagement = () => InventoryManagement
    this.getNewInventoryButton = () => newInventoryButton
    this.getNewInventorySelectDropDown = () => newInventorySelectDropDown
    this.getNewInventoryFirstChild = () => newInventoryFirstChild 
    this.getNewInventoryChosen = () => newInventoryChosen
    this.getNewInventoryItemBrand = () => newInventoryItemBrand
    this.getNewInventoryItemManufacturer = () => newInventoryItemManufacturer
    this.getNewInventoryTagTitle = () => newInventoryTagTitle
    this.getNewInventoryTagValue = () => newInventoryTagValue
    this.getNewInventoryAddToList = () => newInventoryAddToList
    this.getNewInventoryTagList = () => newInventoryTagList
    this.getNewInventorySaveNewItem = () => newInventorySaveNewItem
    this.getSearchInterval = () => searchInterval
    this.getItemSearchedList = () => ItemSearchedList
    this.getItemSavedSuccess = () => ItemSavedSuccess
    this.getItemSearchedDeconste = () => ItemSearchedDeconste

    // Manage Inventory
    this.getManageInventory = () => manageInventory;
    this.getManageInventoryNewItem = () => manageInventoryNewItem;
    this.getAddInventoryFirstItemText = () => addInventoryFirstItemText;
    this.getAddInventoryFirstItemCheckbox = () => addInventoryFirstItemCheckbox;
    this.getAddInventoryFirstItemButton = () => addInventoryFirstItemButton;
    this.getManagebillingItems = () => managebillingItems;
    this.getNewBillingType = () => newBillingType;
    this.getManagebillingItems = () => managebillingItems;
    this.getBillingTypeName = () => billingTypeName;
    this.getBillingTypeDescription = () => billingTypeDescription;
    this.getBillingButtonSave = () => billingButtonSave;
    this.getBillingButtonCancel = () => billingButtonCancel;
    this.getBillingtypeItemInputNameCheck = () => billingtypeItemInputNameCheck;
    this.getBillingtypeItemInputDescCheck = () => billingtypeItemInputDescCheck;
    this.getBillingtypeItemButtonSelect = () => billingtypeItemButtonSelect;
    this.getBillingtypeItemInputEdit = () => billingtypeItemInputEdit;

    this.getBillingTypeNameEdit = () => billingTypeNameEdit;
    this.getBillingTypeDescEdit = () => billingTypeDescEdit;
    this.getBillingTypeEditSave = () => billingTypeEditSave;
    this.getBillingTypeItemDeconste = () => billingTypeItemDeconste;
    this.getBillingTypeItemButtonSelect = () => billingTypeItemButtonSelect;
    this.getBillingTypeDeconste = () => billingTypeDeconste;



    // Store Management
    this.getStoreManagementButton = () => storeManagementButton
    this.getSelectStore = () => selectStore
    this.getSelectFirstDropDown = () => selectFirstDropDown
    this.getSelectItemOption = () => selectItemOption;
    this.getFirstItemSelect = () => firstItemSelect;
    this.getSetItemQuantity = () => setItemQuantity;
    this.getAddButtonSelect = () => addButtonSelect;
    this.getUpdateButtonClick = () => updateButtonClick;
    this.getTotalItemsInStore = () => totalItemsInStore;
    this.getItemConfirmed = () => confirmed;
    this.getTransferItems = () => transferItems;

    this.getSelectReceivingStore = () => selectReceivingStore;
    this.getSecondItemSelect = () => secondItemSelect;
    this.getSelectTransferDropDown = () => selectTransferDropDown;
    this.getSelectFirstTransferItem = () => selectFirstTransferItem;

    this.getTransferQuantity = () => transferQuantity;
    this.getAddTransferItem = () => addTransferItem;
    this.getTransferButton = () => transferButton;


    // Dispensation Log
    const dispensationButton = element(by.xpath("//div[@class='row row-condensed']//a[contains(.,'Dispensation Log')]"))
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
}
module.exports = new pharmacy();

