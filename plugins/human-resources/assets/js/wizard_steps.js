/* ------------------------------------------------------------------------------
*
*  # Steps wizard
*
*
*  Version: 1.0
*  Latest update: Aug 1, 2015
*
* ---------------------------------------------------------------------------- */

$(function() {

    // Wizard examples
    // ------------------------------

    // Basic wizard setup
    $(".steps-wizard").steps({
        headerTag: "h6",
        bodyTag: "fieldset",
        transitionEffect: "fade",
        titleTemplate: '<span class="number">#index#</span> #title#',
        labels: {
            finish: 'Submit'
        },
        onFinished: function (event, currentIndex) {
            alert("Form submitted.");
        }
    });


    // Initialize plugins
    // ------------------------------

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
