function getConstants(){
	var server = "http://localhost:700/";
	var file_server = "http://localhost:7005/";
	var ws_server = "wss://emmetblue.org.ng/echobot";
	var client = {
		short_name: "Emmetblue",
		name: "Emmetblue",
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
		"USER_CLIENT":client,
		"WEB_SOCKET_SERVER":ws_server,
		"EMMETBLUE_FILE_SERVER":file_server
	};
}