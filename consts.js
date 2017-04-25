function getConstants(){
	var server = "https://sglt:700/";
	var client = {
		short_name: "St. Gerard's Catholic Hospital",
		name: "St. Gerard's Catholic Hospital, Kaduna",
		_style:{
			accounts:{
				billing:{
					receipt_template:{
						"logo_width":"30%"
					}
				}
			},
			user:{
				login:{
					"logo_width":"30%"
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