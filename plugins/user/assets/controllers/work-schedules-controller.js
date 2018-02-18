angular.module("EmmetBlue")

.controller('workSchedulesController', function($scope, utils, $cookies, $location, $timeout, moment){
	// var req = utils.serverRequest("/human-resources/work-schedule/new", "POST", {
	// 	"staffId":1,
	// 	"startDate": new Date(),
	// 	"startTime":[08, 00],
	// 	"endTime":[16, 30],
	// 	"daysCount":30
	// });

	// req.then(function(response){
	// 	console.log(response);
	// }, function(error){
	// 	console.log(error);
	// });

	var start = moment(new Date()).subtract(2, 'months').format('YYYY-MM-DD');
	var end = moment(new Date()).add(2, 'months').format('YYYY-MM-DD');

	$scope.calendarView = 'month';
    $scope.viewDate = new Date();

    var actions = [];

    var timetables = [
    	{
    		"id":1234,
    		"name":"Samuel Adeshina",
    		"image":"assets/images/image.jpg",
    		"role":"Nurse",
    		"colors":{
    			primary: "#4CAF50",
    			secondary: "#4BAF6D"
    		},
    		"starts":new Date("2018-02-11 08:00:00 AM"),
    		"ends":new Date("2018-02-11 03:59:00 PM")
    	}
    ]

   $scope.formatName = function(name, img, role){
   		var html = ""+
			"<div class='media'>"+
				"<div class='media-left'>"+
					"<a href='#' data-popup='lightbox'>"+
						"<img src='"+img+"' style='width: 50px; height: 50px;' class='img-square' alt=''>"+
					"</a>"+
				"</div>"+
				""+
				"<div class='media-body'>"+
					"<h6 class='media-heading text-capitalize'>"+name+"</h6>"+
					"<p class='text-muted'>"+role+"</p>"+
				"</div>"+
			"</div>";

		return html;
   }

    $scope.events = [];

	var req = utils.serverRequest("/human-resources/work-schedule/view?start="+start+"&end="+end+"&resourceId=0", "GET");

	req.then(function(response){
		var timetables = response;
		angular.forEach(timetables, function(timetable){
		    $scope.events.push({
		    	title: $scope.formatName(timetable.name, utils.loadImage(timetable.image), timetable.role),
		    	color: {
		    		primary: timetable.PrimaryColor,
		    		secondary: timetable.SecondaryColor
		    	},
		    	startsAt: new Date(timetable.StartDate),
		    	endsAt: new Date(timetable.EndDate),
		    	actions: actions
		    });
	    });
	}, function(error){
		console.log(error);
	});
})