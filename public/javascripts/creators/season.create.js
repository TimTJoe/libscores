import { populateSeasonsSelect, fetchTeamSuggestions, populatePhasesSelect } from "../utils.js";

$(document).ready(function () {
    populatePhasesSelect("seasons");

    // Function to update the status based on start and end dates
    function updateStatus() {
        const startDate = new Date($('#start').val());
        const endDate = new Date($('#end').val());
        const currentDate = new Date();
        let status = '';

        if (!isNaN(startDate) && !isNaN(endDate)) { // Check if both dates are valid
            if (currentDate < startDate) {
                status = 'Pending';
            } else if (currentDate >= startDate && currentDate <= endDate) {
                status = 'Started';
            } else if (currentDate > endDate) {
                status = 'Ended';
            } 
        } else {
            status = ''; // Clear status if dates are not set
        }

        $('#status').val(status); // Update the status field
    }

    // Event listeners to update status when start or end date changes
    $('#start').on('change', updateStatus);
    $('#end').on('change', updateStatus);

    // Event listener for team input to fetch suggestions
    $('#team').on('input', function () {
        const query = $(this).val();

        if (query.length > 0) {
            fetchTeamSuggestions(query).then(teams => {
                $('#team-suggestions').empty().show(); // Clear previous suggestions
                if (teams.length > 0) {
                    teams.forEach(team => {
                        $('#team-suggestions').append(`<div class="suggestion">${team.name}</div>`);
                    });
                } else {
                    $('#team-suggestions').hide(); // Hide if no suggestions
                }
            }).catch(err => {
                console.error('Error fetching team suggestions:', err);
            });
        } else {
            $('#team-suggestions').hide(); // Hide suggestions if input is empty
        }
    });

    // Event listener for selecting a team from suggestions
    $(document).on('click', '.suggestion', function () {
        const selectedTeam = $(this).text();
        $('#team').val(selectedTeam); // Set the team input value
        $('#team-suggestions').hide(); // Hide suggestions
    });

    // Event handler for saving a new phase
    $('#savePhase').on('click', function (event) {
        event.preventDefault(); // Prevent default form submission
        const url = window.location.pathname; // e.g., '/competition/5'
        const competitionId = url.split('/').pop(); // Get the last part of the URL

        const competition_id = $('#competition_id').val() || competitionId; // Hidden field for competition_id
        const start = $('#start').val();
        const end = $('#end').val();
        const games = $('#games').val();
        const status = $('#status').val();
        const teams = 0; // Initialize teams (modify as needed)

        // Ensure required fields are filled
        if (!start || !end || !competition_id) {
            $('#dialogMsg').show().addClass('error').text('Please fill in all fields.');
            return;
        }

        // Show loading spinner
        $('#spinner').show();
        $('#savePhase').prop('disabled', true);

        // AJAX request to save the new phase
        $.ajax({
            url: '/dashboard/phases',
            type: 'POST',
            data: JSON.stringify({ competition_id, start, end, games, status, teams }), // Send data as JSON
            contentType: 'application/json',
            success: function (data) {
                // Show success message
                $('#dialogMsg').show().addClass('success').text('Phase saved successfully');

                // Clear the input fields
                $('#start').val('');
                $('#end').val('');
                $('#games').val('');
                $('#status').val('');

                // Repopulate the select dropdown if necessary
                populateSeasonsSelect("seasons");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Show error message
                $('#dialogMsg').show().addClass('error').text('An error occurred while saving the phase.');
                console.error('Error saving phase:', textStatus, errorThrown);
            }
        });
    });

    // Optional: Close dialog on clicking close button
    $('#closeDialog').on('click', function () {
        $('#phaseDialog').hide(); // Close dialog
        $('#team-suggestions').hide(); // Hide suggestions when dialog closes
    });
});
