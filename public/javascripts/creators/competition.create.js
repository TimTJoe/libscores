
import {populateCountriesSelect} from "../clubs.dash.js";

$(document).ready(function () {
    // Fetch countries to populate the country select dropdown
    populateCountriesSelect('countries');
    // Form submission handler for saving the league
    $('#saveLeague').on('click', function (e) {
        e.preventDefault();

        // Gather form data
        const formData = new FormData();
        formData.append('league', $('#league').val());
        formData.append('founded', $('#founded').val());
        formData.append('continent', $('#continent').val());
        formData.append('country', $('#countries').val());
        formData.append('market_value', $('#value').val());
        formData.append('type', $('#type').val());
        formData.append('logo', $('#logo')[0].files[0]); // Get file from input

        // Show loading spinner
        $('#spinner').show();
        $('#saveLeague').prop('disabled', true);

        // Submit form data via AJAX
        $.ajax({
            url: '/dashboard/competitions', // Updated URL to reflect new route
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                // Hide spinner and re-enable button
                $('#spinner').hide();
                $('#saveLeague').prop('disabled', false);

                // Show success message
                $('#message').show().addClass('success').text('League saved successfully');

                // Clear form fields
                $('#league').val('');
                $('#founded').val('');
                $('#value').val('');
                $('#logo').val('');

                // Dynamically append the new league data to the table
                appendNewLeagueToTable(data.league[0]);
                
                // Close the dialog
                closeDialog();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Hide spinner and re-enable button
                $('#spinner').hide();
                $('#saveLeague').prop('disabled', false);

                // Show error message
                $('#message').show().addClass('error').text('An error occurred while saving the league.');
                console.error('Error saving league:', textStatus, errorThrown);
            }
        });
    });
});

/**
 * Function to close the dialog
 */
function closeDialog() {
    const dialog = document.querySelector('dialog[data-ui="competitonDialog"]');
    if (dialog) {
        dialog.close();
    }
}

/**
 * Function to dynamically append the newly saved league to the table
 * @param {Object} league - The newly created league object returned from the backend
 */
function appendNewLeagueToTable(league) {
    const newRow = `
        <tr id="${league.id}">
            <td><img src="/images/${league.logo}" class="tiny-logo"></td>
            <td><a href="/dashboard/${league.id}">${league.competition}</a>
            <td>${league.founded}</td>
            <td>${league.country}</td>
            <td>${league.market_value}</td>
            <td>${league.continent}</td>
        </tr>`;
    
    // Prepend the new row to the league table
    $('#leagueTable').prepend(newRow);
}
