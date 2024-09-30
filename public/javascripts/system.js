$(document).ready(function () {
            // Handle button clicks
            $('[menu-ui]').on('click', function (e) {
                e.stopPropagation(); // Prevent event from propagating to document

                const targetSelector = $(this).attr('menu-ui'); // Get the value of menu-ui
                // const $dropdown = $(targetSelector); // Find the related dropdown
                var $dropdown  = $('[menu-data="' + targetSelector.substring(1) + '"]');

                // Close all dropdowns first
                $('[menu-data]').hide();

                // Toggle visibility of the clicked dropdown
                if ($dropdown.is(':visible')) {
                    $dropdown.hide(); // Close if already open
                } else {
                    // Position dropdown below the button
                    const buttonOffset = $(this).offset();
                    const buttonHeight = $(this).outerHeight();

                    $dropdown.css({
                        top: buttonOffset.top + buttonHeight,
                        left: buttonOffset.left,
                        position: 'absolute'
                    }).show(); // Show the dropdown
                }
            });

            // Close dropdown if clicking outside
            $(document).on('click', function () {
                $('[menu-data]').hide(); // Hide all dropdowns
            });
        });