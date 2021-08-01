angular.module("EmmetBlue")

.controller("virtualMeetController", function($rootScope, $scope, utils, $location){
	const domain = 'meet.emmetblue.ng';
	const options = {
	    roomName: 'Telemedicine Room',
	    width: 700,
	    height: 700,
	    parentNode: document.querySelector('#meetElement'),
	    interfaceConfigOverwrite: {
			DEFAULT_LOGO_URL: "/assets/images/logo-white.png",
			SHOW_JITSI_WATERMARK: false,
			HIDE_INVITE_MORE_HEADER: true,
			HIDE_DEEP_LINKING_LOGO: true,
			DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
			DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
			DISABLE_FOCUS_INDICATOR: false,
			DEFAULT_BACKGROUND: "#fff",
			DEFAULT_WELCOME_PAGE_LOGO_URL: "/assets/images/logo-white.png",
			//TOOLBAR_BUTTONS: [‘microphone’, ‘camera’, ‘hangup’, ‘mute-everyone’]
		}
	};
	const api = new JitsiMeetExternalAPI(domain, options);
})