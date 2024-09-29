// editableModule.js

/**
 * Makes elements editable and handles saving their data via AJAX.
 *
 * @param {string} editButtonSelector - The selector for the edit/save button.
 * @param {string} teamInfoSelector - The selector for the elements containing the team info.
 * @param {string} messageSelector - The selector for the message display element.
 * @param {string} url - The server route to send the data to when saving.
 */
export function makeEditable(editButtonSelector, teamInfoSelector, messageSelector, url) {
    const $editButton = $(editButtonSelector);
    const $teamInfo = $(teamInfoSelector);
    const $message = $(messageSelector);

    $editButton.click(function () {
        const isEditable = $teamInfo.attr('contenteditable') === 'true';

        if (!isEditable) {
            // Enter edit mode
            enterEditMode();
        } else {
            // Show spinner while saving data
            showSavingState();

            // Collect content from teaminfo elements and store in an object
            const data = collectData();

            // Send the collected data to the server via AJAX
            saveData(data);
        }
    });

    /**
     * Enters edit mode by making the info elements contenteditable.
     */
    function enterEditMode() {
        $teamInfo.attr('contenteditable', 'true').addClass('editable');
        $editButton.html('<i class="fa fa-save"></i> Save Info');
    }

    /**
     * Updates the edit button to show a saving state.
     */
    function showSavingState() {
        $editButton.html('<i class="fa fa-spinner fa-spin"></i> Saving...');
    }

    /**
     * Collects data from the team info elements.
     *
     * @returns {Object} An object containing key-value pairs of team info.
     */
    function collectData() {
        const data = {};
        $teamInfo.each(function () {
            const key = $(this).attr('id'); // Use the element's ID as the key
            const value = $(this).text().trim(); // Get the text content and trim whitespace

            if (value) { // Use truthy check
                data[key] = value;
            }
        });
        return data;
    }

    /**
     * Sends the collected data to the server via AJAX.
     *
     * @param {Object} data - The data to be sent to the server.
     */
    function saveData(data) {
        $.ajax({
            url: url, // Server route passed as parameter
            method: 'PUT',
            data: data,
            success: handleSuccessResponse,
            error: handleErrorResponse
        });
    }

    /**
     * Handles the successful response from the server.
     *
     * @param {Object} response - The response from the server.
     */
    function handleSuccessResponse(response) {
        // Update teaminfo spans with the new values from the response
        console.log(response)
        $.each(response[0], function (key, value) {
            $('#' + key).text(value); // Update the content of each teaminfo span
        });

        // Show success message
        showMessage('Info saved successfully', 'green');

        // Revert button to "Update Info" and exit edit mode
        exitEditMode();
    }

    /**
     * Handles error responses from the server.
     *
     * @param {Object} err - The error object from the AJAX request.
     */
    function handleErrorResponse(err) {
        // Show error message
        showMessage('Error saving info, please try again!', 'red');
        console.error(err)

        // Revert button to "Update Info" in case of failure
        $editButton.html('<i class="fa fa-pen"></i> Update Info');
    }

    /**
     * Exits edit mode and resets the edit button.
     */
    function exitEditMode() {
        $editButton.html('<i class="fa fa-pen"></i> Update Info');
        $teamInfo.attr('contenteditable', 'false').removeClass('editable');
    }

    /**
     * Displays a message in the designated message area.
     *
     * @param {string} message - The message to display.
     * @param {string} color - The color of the message (e.g., 'green' or 'red').
     */
    function showMessage(message, color) {
        $message.text(message).css('color', color).show();
        // Hide the message after 3 seconds
        setTimeout(() => $message.fadeOut(), 3000);
    }
}
