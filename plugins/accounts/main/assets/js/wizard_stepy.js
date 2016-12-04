/* ------------------------------------------------------------------------------
*
*  # Stepy wizard
*
*  Specific JS code additions for wizard_stepy.html page
*
*  Version: 1.0
*  Latest update: Aug 1, 2015
*
* ---------------------------------------------------------------------------- */

$(function() {
    
    // Override defaults
    $.fn.stepy.defaults.legend = false;
    $.fn.stepy.defaults.transition = 'fade';
    $.fn.stepy.defaults.duration = 150; 
    $.fn.stepy.defaults.backLabel = '<i class="icon-arrow-left13 position-left"></i> Back';
    $.fn.stepy.defaults.nextLabel = 'Next <i class="icon-arrow-right14 position-right"></i>';



    // Wizard examples
    // ------------------------------

    // Basic wizard setup
    $(".stepy-wizard").stepy({
        "finishButton":true
    });

    // Initialize plugins
    // ------------------------------

    // Apply "Back" and "Next" button styling
    $('.stepy-step').find('.button-next').addClass('btn btn-primary');
    $('.stepy-step').find('.button-back').addClass('btn btn-default');


    // Select2 selects
    $('.select').select2();

    // Styled checkboxes and radios
    $('.styled').uniform({
        radioClass: 'choice'
    });


    // Styled file input
    $('.file-styled').uniform({
        wrapperClass: 'bg-warning',
        fileButtonHtml: '<i class="icon-googleplus5"></i>'
    });
    
});
