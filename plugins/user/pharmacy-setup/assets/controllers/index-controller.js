angular.module("EmmetBlue")

.controller('userPharmacySetupIndexController', function($scope, $http, utils, $location){
	$scope.showLargeBusinessOpts = false;
	$scope.processing = false;

	$scope.formData = {
		empNo: 0,
		hroAvailable: false,
		accountantAvailable: false
	};

	$scope.proceed = function(){
		$scope.deptId = {};
		$scope.listeners = {
			departments:{},
			cpanel:{}
		};

		if (typeof $scope.formData.empNo !== "undefined"){
			if ($scope.formData.empNo > 2 && !$scope.showLargeBusinessOpts){
				$scope.showLargeBusinessOpts = true;
			}
			else {
				$scope.processing = true;
				$scope.createDefaults();
			}
		}
	}

	$scope.$watch("listeners", function(nv){
		var globalTrue = false;
		if (typeof nv !== "undefined"){
			window.setTimeout(function(){
				if (typeof nv.departments !== "undefined"){
					var val = nv.departments;
					if (typeof val.accounts !== "undefined") { globalTrue = val.accounts; }
					if (typeof val.dispensary !== "undefined") { globalTrue = val.dispensary; }
					if (typeof val.hr !== "undefined") { globalTrue = val.hr; }
					if (typeof val.pharmacy !== "undefined") { globalTrue = val.pharmacy; }
				}

				if (typeof nv.cpanel !== "undefined"){
					var val = nv.cpanel;
					if (typeof val.billingStatus !== "undefined") { globalTrue = val.billingStatus; }
					if (typeof val.patient !== "undefined") { globalTrue = val.patient; }
					if (typeof val.accounts !== "undefined") { globalTrue = val.accounts; }
					if (typeof val.paymentMethod !== "undefined") { globalTrue = val.paymentMethod; }
					if (typeof val.store !== "undefined") { globalTrue = val.store; }
				}

				if (globalTrue){
					//setup complete, assign secondary departments and reset primary department
					$scope.assigns = {};
					$scope.assigns.pharmacy = false;

					$scope.redirectMessage = "Initializing Pharmacy Dashboard...";
					_requests.assignPrimaryDepartment($scope.deptId.pharmacy, utils.userSession.getID())
					.then(function(response){
						$scope.assigns.pharmacy = true;
					}, function(error){
						utils.errorHandler(error);
					})

					if (typeof nv.departments.dispensary !== "undefined"){
						$scope.assigns.dispensary = false;

						$scope.redirectMessage = "Initializing dispensary dashboard...";
						_requests.assignSecondaryDepartment($scope.deptId.dispensary, utils.userSession.getID())
						.then(function(response){
							$scope.assigns.dispensary = true;
						}, function(error){
							utils.errorHandler(error);
						})
					}

					if (typeof nv.departments.accounts !== "undefined"){
						$scope.assigns.accounts = false;
						$scope.redirectMessage = "Initializing accounts dashboard...";

						_requests.assignSecondaryDepartment($scope.deptId.accounts, utils.userSession.getID())
						.then(function(response){
							$scope.assigns.accounts = true;
						}, function(error){
							utils.errorHandler(error);
						})
					}

					if (typeof nv.departments.hr !== "undefined"){
						$scope.assigns.hr = false;
						$scope.redirectMessage = "Initializing human resources dashboard...";

						_requests.assignSecondaryDepartment($scope.deptId.hr, utils.userSession.getID())
						.then(function(response){
							$scope.assigns.hr = true;
						}, function(error){
							utils.errorHandler(error);
						})
					}
				}
			}, 10000);
		}
	});

	$scope.$watch("assigns", function(nv){
		var globalTrue = false;
		if (typeof nv !== "undefined"){
			window.setTimeout(function(){
				if (typeof nv.pharmacy !=="undefined"){ globalTrue = nv.pharmacy; }
				if (typeof nv.dispensary !=="undefined"){ globalTrue = nv.dispensary; }
				if (typeof nv.accounts !=="undefined"){ globalTrue = nv.accounts; }
				if (typeof nv.hr !=="undefined"){ globalTrue = nv.hr; }

				if (globalTrue){
					$scope.redirectMessage = "Redirecting to inventory setup area...";
					utils.notify("Default Accounts Created & Initialized", "Congratulations, Your EmmetBlue deployment is ready", "success");

					window.location.assign('user/activate-profile');
				}
			}, 10000)
		}
	})

	$scope.createDefaults = function(){
		createDepartments();
		createCpanelDefaults();
	}
	var createDepartments = function(){
		//create pharmacy dashboard
		$scope.listeners.departments.pharmacy = false;
		$scope.redirectMessage = "Creating pharmacy department ...";
		_requests.createDepartment('Pharmacy')
		.then(function(response){
			$scope.deptId.pharmacy = response.lastInsertId;
			$scope.redirectMessage = "Enabling pharmacy department ...";

			_requests.createDepartmentUrl($scope.deptId.pharmacy, 'pharmacy/dashboard')
			.then(function(response){
				$scope.redirectMessage = "Creating Pharmacist Role ...";

				_requests.createDepartmentRole($scope.deptId.pharmacy, 'Pharmacist')
				.then(function(response){
					$scope.listeners.departments.pharmacy = true;
				}, function(error){ utils.errorHandler(error) });

			}, function(error){ utils.errorHandler(error) });

		}, function(error){
			utils.errorHandler(error);
		});

		if ($scope.formData.empNo > 1){
			//create dispensary dashboard
			$scope.listeners.departments.dispensary = false;
			$scope.redirectMessage = "Creating dispensary department ...";
			_requests.createDepartment('Dispensary')
			.then(function(response){
				$scope.deptId.dispensary = response.lastInsertId;
				$scope.redirectMessage = "Enabling dispensary department ...";

				_requests.createDepartmentUrl($scope.deptId.dispensary, 'pharmacy/standalone-dispensory/dashboard')
				.then(function(response){
					$scope.redirectMessage = "Creating dispensary roles ...";

					_requests.createDepartmentRole($scope.deptId.dispensary, 'Pharmacist')
					.then(function(response){

						_requests.createDepartmentRole($scope.deptId.dispensary, 'Sales Admin')
						.then(function(response){
							$scope.listeners.departments.dispensary = true;
						}, function(error){ utils.errorHandler(error) });

					}, function(error){ utils.errorHandler(error) });

				}, function(error){ utils.errorHandler(error) });

			}, function(error){
				utils.errorHandler(error);
			});
		}

		if ($scope.formData.hroAvailable == true){
			$scope.listeners.departments.hr = false;
			$scope.redirectMessage = "Creating human resources department ...";
			_requests.createDepartment('Human Resources')
			.then(function(response){
				$scope.deptId.hr = response.lastInsertId;
				$scope.redirectMessage = "Enabling human resources department ...";

				_requests.createDepartmentUrl($scope.deptId.hr, 'human-resources/dashboard')
				.then(function(response){
					$scope.redirectMessage = "Creating HR role ...";

					_requests.createDepartmentRole($scope.deptId.hr, 'HR Officer')
					.then(function(response){
						$scope.listeners.departments.hr = true;
					}, function(error){ utils.errorHandler(error) });

				}, function(error){ utils.errorHandler(error) });

			}, function(error){
				utils.errorHandler(error);
			});
		}

		if ($scope.formData.accountantAvailable == true){
			$scope.listeners.departments.accounts = false;
			$scope.redirectMessage = "Creating accounts department ...";
			_requests.createDepartment('Billing Unit')
			.then(function(response){
				$scope.deptId.accounts = response.lastInsertId;
				$scope.redirectMessage = "Enabling accounts department ...";

				_requests.createDepartmentUrl($scope.deptId.accounts, 'accounts/billing/dashboard')
				.then(function(response){
					$scope.redirectMessage = "Creating accounts role ...";

					_requests.createDepartmentRole($scope.deptId.accounts, 'Cashier')
					.then(function(response){
						$scope.listeners.departments.accounts = true;
					}, function(error){ utils.errorHandler(error) });

				}, function(error){ utils.errorHandler(error) });

			}, function(error){
				utils.errorHandler(error);
			});
		}
	}

	var createCpanelDefaults = function(){
		//patient groups
		$scope.listeners.cpanel.patient = false;
		$scope.redirectMessage = "Creating customer category ...";
		_requests.createPatientCategory('General')
		.then(function(response){
			$scope.deptId.patientCategory = response.lastInsertId;
			$scope.redirectMessage = "Creating customer types ...";

			_requests.createPatientType('General', 'Customer')
			.then(function(response){
				$scope.listeners.cpanel.patient = true;
			}, function(error){ utils.errorHandler(error) });

		}, function(error){
			utils.errorHandler(error);
		});

		//billing statuses
		$scope.listeners.cpanel.billingStatus = false;
		$scope.redirectMessage = "Creating billing statuses ...";
		_requests.createBillingStatus('Payment Request')
		.then(function(response){
			_requests.createBillingStatus('Payment Complete')
			.then(function(response){
				$scope.listeners.cpanel.billingStatus = true;
			}, function(error){
				utils.errorHandler(error);
			});
		}, function(error){
			utils.errorHandler(error);
		});

		$scope.listeners.cpanel.paymentMethod = false;
		$scope.redirectMessage = "Creating payment methods ...";
		_requests.createPaymentMethod('Cash')
		.then(function(response){
			_requests.createPaymentMethod('POS')
			.then(function(response){
				_requests.createPaymentMethod('Online Transfer')
				.then(function(response){
					$scope.listeners.cpanel.paymentMethod = true;
				}, function(error){
					utils.errorHandler(error);
				});
			}, function(error){
				utils.errorHandler(error);
			});
		}, function(error){
			utils.errorHandler(error);
		});

		$scope.listeners.cpanel.store = false;
		$scope.redirectMessage = "Creating drug store ...";
		_requests.createStore('Drug Store')
		.then(function(response){
			$scope.deptId.storeId = response.lastInsertId;
			$scope.redirectMessage = "Creating dispensary ...";

			_requests.createDispensary('Sales Dispensary')
			.then(function(response){
				$scope.deptId.dispId = response.lastInsertId;
				$scope.redirectMessage = "Linking Dispensary &amp; Store ...";

				_requests.linkDispensaryToStore($scope.deptId.dispId, $scope.deptId.storeId)
				.then(function(response){
					$scope.listeners.cpanel.store = true;
				}, function(error){
					utils.errorHandler(error);
				});
			}, function(error){
				utils.errorHandler(error);
			});
		}, function(error){
			utils.errorHandler(error);
		});
	}

	var _requests = {
		createDepartment: function(name){
			return utils.serverRequest("/human-resources/department/new", "POST", {
				name: name,
				groupId: 1
			});
		},
		createDepartmentUrl: function(id, url){
			return utils.serverRequest("/human-resources/department/new-root-url", "POST", {
				url: url,
				department: id
			});
		},
		createDepartmentRole: function(id, name){
			return utils.serverRequest("/human-resources/role/new", "POST", {
				name: name,
				department: id
			});
		},
		createPatientCategory: function(name){
			return utils.serverRequest("/patients/patient-type-category/new", "POST", {
				categoryName: name
			});
		},
		createPatientType: function(category, name){
			return utils.serverRequest("/patients/patient-type/new", "POST", {
				patientTypeName: name,
				patientTypeCategory: category
			});
		},
		createBillingStatus: function(name){
			return utils.serverRequest("/accounts-biller/transaction-status/new", "POST", {
				name: name
			});
		},
		createPaymentMethod: function(name){
			return utils.serverRequest("/accounts-biller/payment-method/new", "POST", {
				name: name
			});
		},
		createStore: function(name){
			return utils.serverRequest("/pharmacy/store/new", "POST", {
				name: name
			});
		},
		createDispensary: function(name){
			return utils.serverRequest("/pharmacy/eligible-dispensory/new", "POST", {
				name: name
			});
		},
		linkDispensaryToStore: function(disp, store){
			return utils.serverRequest("/pharmacy/dispensory-store-link/new", "POST", {
				dispensory: disp,
				store: store
			});
		},
		assignSecondaryDepartment: function(dept, staff){
			return utils.serverRequest("/human-resources/staff-department/assign-secondary", "POST", {
				staff: staff,
				department: dept
			});
		},
		assignPrimaryDepartment: function(dept, staff){
			return utils.serverRequest("/human-resources/staff-department/edit", "POST", {
				resourceId: staff,
				DepartmentID: dept
			});
		},
		switchDepartment: function(dept, staff){
			return utils.serverRequest("/user/account/get-switch-data", "POST", {
				staff: staff,
				department: dept
			});
		}
	}
});