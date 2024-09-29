$(document).ready(function () {
    // Cache DOM elements
    const $saveButton = $('#saveClub');
    const $dialog = $('dialog[data-ui="clubDialog"]');
    const $message = $('#message');
    const $spinner = $('#spinner');
    const $clubTable = $('#clubs');
    
    // Throttle function to prevent quick successive calls (button spam prevention)
    let isSaving = false;
    
    // Utility function to show a loading spinner and disable the button
    function showLoadingState() {
        $spinner.show();
        $saveButton.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Saving...');
    }

    // Utility function to reset button and spinner
    function hideLoadingState() {
        $spinner.hide();
        $saveButton.prop('disabled', false).html('Save Club');
    }

    // Utility function to show a success or error message
    function showMessage(message, type = 'success') {
        const color = type === 'success' ? 'green' : 'red';
        $message.text(message).css('color', color).fadeIn();
        setTimeout(() => $message.fadeOut(), 3000); // Auto-hide after 3 seconds
    }

    // Utility function to append new club data to the table
    function appendNewClub(data) {
        const clubRow = `
            <tr class="tr" id="${data.id}">
                <td class="td">
                    <img src="/images/${data.badge}" class="tiny-logo">
                </td>
                <td class="first wide td row">
                    <a href="/dashboard/clubs/${data.id}">${data.club}</a>
                </td>
                <td class="td">${data.squad || '0'}</td>
                <td class="td">${data.country_id == 1 ? 'Liberia' : data.country_id}</td>
                <td class="td">${data.market_value}</td>
                <td class="td">${data.stadium}</td>
                <td class="td">${data.founded}</td>
                <td class="td">
                    <button class="icon-button small round">
                        <i class="fa fa-pen"></i>
                    </button>
                </td>
            </tr>`;
        $clubTable.prepend(clubRow); // Append at the top of the table
    }

    // Handle form submission via AJAX
    function handleFormSubmission(formData) {
        if (isSaving) return; // Prevent multiple submissions

        isSaving = true;
        showLoadingState();

        $.ajax({
            url: '/dashboard/clubs',  // Replace with your server route
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                appendNewClub(data); // Append new club data to the table

                showMessage('Club saved successfully!', 'success'); // Success message
                setTimeout(() => {
                    hideLoadingState();
                    $dialog[0].close(); // Close dialog after a small delay
                }, 500);
            },
            error: function () {
                showMessage('Error saving club, please try again!', 'error');
                hideLoadingState();
            },
            complete: function () {
                isSaving = false; // Reset saving state after completion
            }
        });
    }

    // Handle Save button click
    $saveButton.click(function (e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('club', $('#club').val());
        formData.append('founded', $('#founded').val());
        formData.append('country', $('#countries').val());
        formData.append('stadium', $('#stadium').val());
        formData.append('value', $('#value').val());
        formData.append('badge', $('#badge')[0].files[0]);

        handleFormSubmission(formData);
    });

    // Function to handle closing the dialog (optional)
    function closeDialog() {
        $dialog[0].close();
        hideLoadingState();  // Reset UI elements on close
    }

    // Optionally bind closing events or buttons
    $dialog.find('.fa-close').click(closeDialog);
});
