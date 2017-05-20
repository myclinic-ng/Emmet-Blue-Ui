var controllersLocation = "plugins/nursing/ward/assets/controllers/";

head.load(controllersLocation+'settings/manage-observation-type-controller.js');
head.load(controllersLocation+'settings/manage-observation-type-fields-controller.js');
head.load(controllersLocation+'settings/link-consultant-departments-controller.js');
head.load(controllersLocation+'settings/manage-wards-controller.js');
head.load(controllersLocation+'settings/admission-billing-items-controller.js');
head.load(controllersLocation+'settings/link-nursing-stations-controller.js');

head.load(controllersLocation+'nursing-patient-workspace-controller.js');
head.load(controllersLocation+'nursing-patient-admission-controller.js');
head.load(controllersLocation+'nursing-patient-discharge-controller.js');
head.load(controllersLocation+'manage-beds-controller.js');
head.load(controllersLocation+'ward-management-controller.js');

head.load(controllersLocation+'treatment-chart-directive.js');
head.load(controllersLocation+'services-rendered-directive.js');
head.load(controllersLocation+'ward-transfer-directive.js');
head.load(controllersLocation+'lab-request-form-directive.js');
head.load(controllersLocation+'pharmacy-request-form-directive.js');