import { populateSeasonsSelect, fetchTeamSuggestions, populatePhasesSelect } from "../utils.js";

$(document).ready(function () {
    populateSeasonsSelect("phaseSeasons");
    let selectedTeamId

   
    // Event listener for team input to fetch suggestions
    $('#team').on('input', function () {
        const query = $(this).val();

        if (query.length > 0) {
            fetchTeamSuggestions(query).then(teams => {
                $('#team-suggestions').empty().show(); // Clear previous suggestions
                if (teams.length > 0) {
                    teams.forEach(team => {
                        $('#team-suggestions').append(`<div class="suggestion" id="${team.id}">${team.club}</div>`);
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
        selectedTeamId = Number($(this).attr("id"));
        $('#team').val(selectedTeam); // Set the team input value
        $('#team-suggestions').hide(); // Hide suggestions
    });

    // Event handler for saving a new phase
    $('#savePhase').on('click', function (event) {
        event.preventDefault(); // Prevent default form submission

        const team = $('#team').val();
        const season = $('#seasons').val();

        // Ensure required fields are filled
        if (!team || !season) {
            $('#phaseMsg').show().addClass('error').text('Please fill in all fields.');
            return;
        }

        // Show loading spinner
        $('#spinner').show();
        $('#savePhase').prop('disabled', true);

        // AJAX request to save the new phase
        $.ajax({
            url: '/dashboard/phases',
            type: 'POST',
            data: JSON.stringify({ season, selectedTeamId }), // Send data as JSON
            contentType: 'application/json',
            success: function (data) {
                // Show success message
                $('#phaseMsg').show().addClass('success').text('Phase saved successfully');

                // Clear the input fields
                $('#team').val('');
                $('#season').val('');

                // Repopulate the select dropdown if necessary
                populatePhasesSelect("seasons");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Show error message
                $('#phaseMsg').show().addClass('error').text('An error occurred while saving the phase.');
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
