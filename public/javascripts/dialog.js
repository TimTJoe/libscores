$(document).ready(function() {
    
    $('[data-ui]').on('click', function() {
      var targetSelector = $(this).attr('data-ui');
      
      if (targetSelector) {
        var dialog = $('[data-ui="' + targetSelector.substring(1) + '"]');
        toggleDialog(dialog);
      }
    });
  
    function toggleDialog(dialog) {
      $('[menu-data]').hide();
      if (!dialog.length) return;
  
      var isActive = dialog.hasClass('active');
  
      // Close all dialogs
      $('.dialog').removeClass('active');
      $('body').removeClass('dialog-active');
  
      // If not active, show the dialog
      if (!isActive) {
        dialog.addClass('active');
        $('body').addClass('dialog-active');
      }
    }
  });
  