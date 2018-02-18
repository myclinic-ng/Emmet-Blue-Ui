angular.module("EmmetBlue")

.directive("ngCurrency", function(){
	return {
		template: '&#8358'
	}
})

.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
              if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
                lastspace = lastspace - 1;
              }
              value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
})

.factory("utils", function(
	$rootScope,
	$location,
	$parse,
	CONSTANTS,
	$q,
	$http,
	$httpParamSerializer,
	$compile,
	DTOptionsBuilder,
	DTColumnBuilder,
	$compile,
	$cookies,
	$localStorage
){
	var services = {};

	services.enableDefaultFormValues = function(){
		var parameters = $location.search();
		for (var key in parameters){
			$parse(key).assign($rootScope, parameters[key]);
		}
		$location.url($location.path());
	};
	
	services.loadNigeriaData = function(){
		var defer = $q.defer();
		var data = $http.get("assets/angular/core/data/nigerian-states-lgas.json").then(function(response){
			defer.resolve(response.data);
			return defer.promise;
		}, function(response){
			defer.reject(response);
			return defer.promise;
		});

		return data;
	}

	services.notify = function(title, text, type){
		PNotify.desktop.permission();
	    new PNotify({
            title: title,
            text: text,
            addclass: 'alert-styled-left alert-arrow-left text-sky-royal',
            type: type,
            mouse_reset: true,
            insert_brs: true,
            nonblock: {
            	nonblock: true
            },
            desktop: {
            	desktop: false
            },
            history: {
            	menu: false
            },
            mobile: {
            	swipe_dismiss: true,
            	styling: true
            }
        });
	};

	services.swal = function(title, text, type){
		sweetAlert({
			title: title,
			text: text,
			type: type,
			html: true
		});
	};

	services.alert = function(title, text, type, notyType=""){
		if (notyType == 'both'){
			services.swal(title, text, type);
			services.notify(title, text, type);
		}
		else if (notyType == 'notify'){
			services.notify(title, text, type);
		}
		else{
			services.swal(title, text, type);
		}
	}

	services.confirm = function(title, text, closeOnConfirm, callback, type="", btnText="Ok"){
		sweetAlert({
			title: title,
			text: text,
			html: true,
			type: type,
			showCancelButton: true,
			confirmButtonText: btnText,
			closeOnConfirm: closeOnConfirm
		}, callback);
	}

	services.serverRequest = function(url, requestType, data={}){
		var deferred = $q.defer();

		var _req = {
			"url":services.restServer+url,
			"method":requestType,
			"data":data
		}

		if (typeof $cookies.getObject(CONSTANTS.USER_COOKIE_IDENTIFIER) !== "undefined"){
			_req.headers = {
				"Authorization":$cookies.getObject(CONSTANTS.USER_COOKIE_IDENTIFIER).token
			}
		}

		return $http(_req).then(function(result){
			deferred.resolve(result.data.contentData);
			return deferred.promise;
		}, function(result){
			deferred.reject(result);
			return deferred.promise;
		});
	}

	services.serverUpload = function(url, requestType, data={}){
		var deferred = $q.defer();

		var _req = {
			url: url,
			method: requestType,
			data: data,
			transformRequest: angular.identity,
       		headers: {'Content-Type': undefined}
		}

		if (typeof $cookies.getObject(CONSTANTS.USER_COOKIE_IDENTIFIER) !== "undefined"){
			_req.headers.Authorization = $cookies.getObject(CONSTANTS.USER_COOKIE_IDENTIFIER).token;
		}

		return $http(_req).then(function(result){
			deferred.resolve(result.data.contentData);
			return deferred.promise;
		}, function(result){
			deferred.reject(result);
			return deferred.promise;
		});
	}

	services.errorHandler = function(errorObject, showSwal=false){
		var alertType = (showSwal) ? "both" : "notify";
		switch(errorObject.status){
			case 404:{
				services.notify('Invalid Resource Requested', 'The requested resource was not found on this server, please contact an administrator if this error persists', 'warning');
				break;
			}
			case 500:
			case 501:
			case 400:{
				services.notify('Unable To Process Request', 'This is usually due to making request for a missing resource or sending improperly formatted data to the server. Please contact an administrator if this error persists. Error Code: AB0'+errorObject.status+' Server Message: '+errorObject.data.errorMessage, "error");
				break;
			}
			case 503:{
				services.notify('The Server Refused To Process Your Request', 'This is usally due to the creation of duplicate data. This resource does not allow you to create data of the same exact type, please contact an administrator if this error persists. Error Code: AB0'+errorObject.status, 'warning');
				break;
			}
			case 401:{
				console.log("Request Denied");
				break;
			}
			default:
			{
				if (typeof errorObject.data != "undefined" && errorObject.data != null){
					services.alert(errorObject.status+': '+errorObject.statusText, errorObject.data.errorMessage, 'error');
				}
				else{
					if (errorObject.status == -1){
						services.notify('Unable to reach server', "Please check your network connectivity to confirm the server is still accessible from this computer. Contact an administrator if this error persists. Error Code: AB0"+errorObject.status, "warning");
					}
					else {
						services.notify("Unknown error", "A general error has occurred, please contact an administrator", 'error');
					}
				}
			}
		}
	};


	services.loadImage = function(image){
		if (typeof image == "undefined"){
			return null;
		}
		return CONSTANTS.EMMETBLUE_SERVER+image
	}

	services.dateObject = function(dateString){
		var date = new Date(dateString);

		return date;
	}

	services.getAge = function(dateString) {
	    if (dateString !== null){
	    	var today = new Date();
		    var birthDate = new Date(dateString);
		    var age = today.getFullYear() - birthDate.getFullYear();
		    var m = today.getMonth() - birthDate.getMonth();
		    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		        age--;
		    }
		    return age;
	    }
	}

	services.dateDiff = function(dateOne, dateTwo){
		dateOne = new Date(dateOne);
		dateTwo = new Date(dateTwo);

		var utc1 = Date.UTC(dateOne.getFullYear(), dateOne.getMonth(), dateOne.getDate());
	  	var utc2 = Date.UTC(dateTwo.getFullYear(), dateTwo.getMonth(), dateTwo.getDate());

	  	return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
	}

	services.today = function(){
		var date = new Date();
		return date.toLocaleDateString();
	}

	services.getStaffFullName = function(id){
		return services.serverRequest('/human-resources/staff-profile/view-staff-full-name?resourceId='+id, 'GET');
	}

	services.userSession = {
		cookie: function(){
			if (typeof $cookies.getObject(CONSTANTS.USER_COOKIE_IDENTIFIER) == "undefined"){
				$location.path('user/login');
			}
			return $cookies.getObject(CONSTANTS.USER_COOKIE_IDENTIFIER)
		},
		getUUID: function(){
			return services.userSession.cookie().uuid;
		},
		getDashboard: function(){
			if (typeof services.userSession.cookie() != "undefined"){
				return services.userSession.cookie().dashboard;
			}
		},
		getID: function(){
			if (typeof services.userSession.cookie() != "undefined"){
				return services.userSession.cookie().staffid;
			}
		},
		getUsername: function(){
			return services.userSession.cookie().username;
		},
		clear: function(){
			services.serverRequest("/user/session/deactivate?resourceId="+services.userSession.getID(), "GET").then(function(response){
				$cookies.remove(CONSTANTS.USER_COOKIE_IDENTIFIER);
				$location.path('user/login');
			}, function(error){
				services.errorHandler(error);
			})
		}
	}

	services.newWebSocket = function(){
		return new WebSocket(CONSTANTS.WEB_SOCKET_SERVER);
	}

	services.substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function(i, str) {
                if (substrRegex.test(str)) {

                    // the typeahead jQuery plugin expects suggestions to a
                    // JavaScript object, refer to typeahead docs for more info
                    matches.push({ value: str });
                }
            });
            cb(matches);
        };
    };

    services.generateQrCode = function(content, type="label"){
    	var data  = {type: type, content: content};
    	return generateQrCode(JSON.stringify(data));
    }

	services.globalConstants = CONSTANTS;

	services.serializeParams = $httpParamSerializer;

	services.compile = $compile;

	services.storage = $localStorage;

	services.restServer = CONSTANTS.EMMETBLUE_SERVER+CONSTANTS.EMMETBLUE_SERVER_VERSION;

	services.DT = {
		optionsBuilder: DTOptionsBuilder,
		columnBuilder: DTColumnBuilder,
	}

	return services;
})

.factory("patientEventLogger", function(utils){
	var events = {
		records: {},
		lab:{},
		pharmacy:{},
		accounts:{}
	};

	var eventLogger = function(eventObject){
		var dateObject = new Date();
		eventObject.eventDate = dateObject.toLocaleDateString();
		eventObject.eventTime = dateObject.getHours()+":"+dateObject.getMinutes();

		var eventReq = utils.serverRequest("/patients/patient-event/new", "POST", eventObject);

		return eventReq;
	}

	events.records.newPatientRegisteredEvent = function(patientId, linkId){
		var eventObject = {
			patient: patientId,
			eventActor: "Records",
			eventLinkId: linkId,
			eventLink: "patients/patient",
			eventText: "completed registration",
			eventIcon: "fa fa-user-plus"
		};

		return eventLogger(eventObject);
	}

	events.records.newRepositoryCreatedEvent = function(patientId, linkId){
		var eventObject = {
			patient: patientId,
			eventActor: "Records",
			eventLinkId: linkId,
			eventLink: "patients/repository",
			eventText: "created repository",
			eventIcon: "icon-database-upload"
		};

		return eventLogger(eventObject);
	}

	events.lab.newPatientRegisteredEvent = function(patientId, investigationType, linkId){
		var eventObject = {
			patient: patientId,
			eventActor: "Laboratory",
			eventLinkId: linkId,
			eventLink: "lab/registration",
			eventText: "assigned lab number ("+investigationType+" investigation)",
			eventIcon: "icon-lab"
		};

		return eventLogger(eventObject);
	}

	events.pharmacy.newDispensationEvent = function(patientId, linkId){
		var eventObject = {
			patient: patientId,
			eventActor: "Pharmacy",
			eventLinkId: linkId,
			eventLink: "pharmacy/dispensation",
			eventText: "dispensed items",
			eventIcon: "icon-aid-kit"
		};

		return eventLogger(eventObject);
	}

	events.accounts.newPaymentRequestEvent = function(patientId, department, linkId){
		var eventObject = {
			patient: patientId,
			eventActor: department,
			eventLinkId: linkId,
			eventLink: "accounts/paymentRequest",
			eventText: "created a payment request",
			eventIcon: "icon-credit-card"
		};

		return eventLogger(eventObject);
	}

	events.accounts.paymentRequestFulfilledEvent = function(patientId, linkId){
		var eventObject = {
			patient: patientId,
			eventActor: "Accounts",
			eventLinkId: linkId,
			eventLink: "accounts/paymentRequestFulfilled",
			eventText: "fulfilled payment request",
			eventIcon: "icon-checkmark4"
		};

		return eventLogger(eventObject);
	}

	return events;
})