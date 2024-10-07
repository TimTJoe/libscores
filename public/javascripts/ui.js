$(document).ready(function() {
    // When any button with data-modal is clicked
    $('button[data-modal]').on('click', function() {
        // Get the value of data-modal from the clicked button
        const modalSelector = $(this).attr('data-modal');

        // Find the element whose data-modal matches the value without the hash (#)
        const targetModal = $(`[data-modal="${modalSelector.replace('#', '')}"]`);

        // Toggle the visibility of the target modal element
        targetModal.toggle();
    });

     // On button click, toggle the 'show-on-small' class for the element with the matching data-modal value
    //  $('[data-modal]').on('click', function() {
    //     const modalTarget = $(this).data('modal');
    //     $(`[data-modal="${modalTarget}"]`).toggleClass('show-on-small');
    // });
});
