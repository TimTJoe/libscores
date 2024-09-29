$(document).ready(function () {
    const $editButton = $('#editteam');
    const $teamInfo = $('.teaminfo');
    const $message = $('#message');

    $editButton.click(function () {
        const isEditable = $teamInfo.attr('contenteditable') === 'true';

        if (!isEditable) {
            // Enter edit mode
            enterEditMode();
        } else {
            // Show spinner while saving data
            showSavingState();

            // Collect content from teaminfo elements and store in an object
            const teamData = collectTeamData();

            // Send the collected data to the server via AJAX
            saveTeamData(teamData);
        }
    });

    function enterEditMode() {
        $teamInfo.attr('contenteditable', 'true').addClass('editable');
        $editButton.html('<i class="fa fa-save"></i> Save Info');
    }

    function showSavingState() {
        $editButton.html('<i class="fa fa-spinner fa-spin"></i> Saving...');
    }

    function collectTeamData() {
        const teamData = {};
        $teamInfo.each(function () {
            const key = $(this).attr('id');   // Use the element's ID as the key
            const value = $(this).text().trim();  // Get the text content and trim whitespace

            if (value) { // Use truthy check
                teamData[key] = value;
            }
        });
        return teamData;
    }

    function saveTeamData(teamData) {
        $.ajax({
            url: '/dashboard/clubs',  // Replace with your server route
            method: 'PUT',
            data: teamData,
            success: handleSuccessResponse,
            error: handleErrorResponse
        });
    }

    function handleSuccessResponse(response) {
        // Update teaminfo spans with the new values from the response
        $.each(response.club, function (key, value) {
            $('#' + key).text(value); // Update the content of each teaminfo span
        });

        // Show success message
        showMessage('Info saved successfully', 'green');

        // Revert button to "Update Info" and exit edit mode
        exitEditMode();
    }

    function handleErrorResponse(err) {
        // Show error message
        showMessage('Error saving info, please try again!', 'red');

        // Revert button to "Update Info" in case of failure
        $editButton.html('<i class="fa fa-pen"></i> Update Info');
    }

    function exitEditMode() {
        $editButton.html('<i class="fa fa-pen"></i> Update Info');
        $teamInfo.attr('contenteditable', 'false').removeClass('editable');
    }

    function showMessage(message, color) {
        $message.text(message).css('color', color).show();
        // Hide the message after 3 seconds
        setTimeout(() => $message.fadeOut(), 3000);
    }
});
