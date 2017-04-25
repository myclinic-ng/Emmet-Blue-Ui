function getConstants(){
	var server = "https://sglt:700/";
	var client = {
		short_name: "Harmony Hospital",
		name: "Harmony Hospital & Specialists Clinic",
		_style:{
			accounts:{
				billing:{
					receipt_template:{
						"logo_width":"100%"
					}
				}
			},
			user:{
				login:{
					"logo_width":"100%"
				}
			}
		}
	};

	return {
		"TEMPLATE_DIR":"plugins/",
		"MODULE_MENU_LOCATION":"assets/includes/menu.html",
		"MODULE_HEADER_LOCATION":"assets/includes/header.html",
		"EMMETBLUE_SERVER":server,
		"EMMETBLUE_SERVER_VERSION":"v1",
		"USER_COOKIE_IDENTIFIER":"_______",
		"USER_CLIENT":client
	};
}