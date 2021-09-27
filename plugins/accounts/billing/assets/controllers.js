var controllersLocation = "plugins/accounts/billing/assets/controllers/";

head.load(controllersLocation+"dashboard-controller.js");
head.load(controllersLocation+"menu-controller.js");
head.load(controllersLocation+"new-billing-controller.js");
head.load(controllersLocation+"new-payment-controller.js");

head.load(controllersLocation+"transactions-controller.js");
head.load(controllersLocation+"transactions/receipts-controller.js");
head.load(controllersLocation+"transactions/part-payments-controller.js");

head.load(controllersLocation+"invoice-template-directive.js");
head.load(controllersLocation+"receipt-template-directive.js");
head.load(controllersLocation+"account-payment-request-controller.js");
head.load(controllersLocation+"deposits-workspace-controller.js");
head.load(controllersLocation+"patient-type-deposits-workspace-controller.js");
head.load(controllersLocation+"deposits-account-controller.js");
head.load(controllersLocation+"patient-type-deposits-account-controller.js");
head.load(controllersLocation+"preview-invoice-template-directive.js");
head.load(controllersLocation+"preview-invoice-template-with-data-directive.js");