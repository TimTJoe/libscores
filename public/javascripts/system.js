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

$(document).ready(function() {
    // By default, hide all dropdowns that don't have a '#' in their data-menu
    $('[data-menu]').each(function() {
        if (!$(this).attr('data-menu').startsWith('#')) {
            $(this).hide(); // Hide them initially
        }
    });

    // Click event for any element with data-menu starting with '#'
    $('[data-menu^="#"]').click(function(e) {
        const menuId = $(this).attr('data-menu'); // Get the clicked element's data-menu value
        const $dropdown = $(`[data-menu="${menuId.slice(1)}"]`); // Find corresponding dropdown with same data-menu (without #)

        // Hide all other dropdowns
        $('[data-menu]').not($dropdown).each(function() {
            if (!$(this).attr('data-menu').startsWith('#')) {
                $(this).slideUp(); // Use slideUp to hide with animation
            }
        });

        // Position the dropdown before toggling visibility
        const triggerPosition = $(this).offset();
        const dropdownWidth = $dropdown.outerWidth();
        const viewportWidth = $(window).width();
        const offsetLeft = triggerPosition.left;

        // Adjust dropdown position to prevent overflow
        if (offsetLeft + dropdownWidth > viewportWidth) {
            $dropdown.css({
                position: 'absolute',
                top: triggerPosition.top + $(this).outerHeight(),
                left: viewportWidth - dropdownWidth // Position it to the far right of the viewport
            });
        } else {
            $dropdown.css({
                position: 'absolute',
                top: triggerPosition.top + $(this).outerHeight(),
                left: offsetLeft // Position it normally
            });
        }

        // Toggle the corresponding dropdown's visibility with slideDown or slideUp
        if ($dropdown.is(':visible')) {
            $dropdown.slideUp(); // If already visible, slide it up
        } else {
            $dropdown.slideDown(); // If hidden, slide it down
        }

        // Prevent the event from propagating to the document
        e.stopPropagation();
    });

    // Hide dropdowns when clicking outside
    $(document).click(function() {
        $('[data-menu]').each(function() {
            if (!$(this).attr('data-menu').startsWith('#')) {
                $(this).slideUp(); // Ensure all dropdowns hide with slideUp
            }
        });
    });
});

