Webcam.set({
	// live preview size
	width: 800,
	height: 450,
	
	// device capture size
	dest_width: 1280,
	dest_height: 720,
	
	// final cropped size
	crop_width: 480,
	crop_height: 480,
	
	// format and quality
	image_format: 'jpeg',
	jpeg_quality: 100,
	
	// flip horizontal (mirror mode)
	// flip_horiz: true
});

function enableCamera(){
	Webcam.attach("#camera");
}

function takeSnapshot() {
	// freeze camera so user can preview current frame
	// Webcam.freeze();
	
	Webcam.snap( function(data_uri) {
		// display results in page
		var img = '<img src="'+data_uri+'" class="col-md-12 img img-responsive" id="passport" style="width:100% !important; height: 100% !important;"/>';

		$("#camera").html(img);
		$("#patient-passport").val(data_uri);
	} );
}

function retakeSnapshot() {
	Webcam.reset();
	enableCamera();
}