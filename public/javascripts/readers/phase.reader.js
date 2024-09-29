import { populatePhasesSelect, renderPhases } from "../utils.js";

$(document).ready( function () {
    // Bind the change event on the #seasons select element
    $(document).on("change", "#seasons", async function () {
        let id = $(this).val();
        let phase = renderPhases(id)
        console.log("phase", phase)
    });

   
});


/**
 * Fetches all phases by making an AJAX GET request to the /dashboard/phases route.
 * The fetched data is displayed dynamically in the UI by populating a list element with phase details.
 */
export function fetchPhases() {
    $.get('/dashboard/phases', function (data) {
        // Handle success - log the phases data to the console

        // Clear any existing data in the phase list
        $('#phaseList').empty();

        // Append each phase's details to the list element
        $.each(data, function (index, phase) {
            $('#phaseList').append(
                `<li>${phase.id} - ${phase.club} - ${phase.team_name}</li>`
            );
        });

    }).fail(function (jqXHR, textStatus, errorThrown) {
        // Handle error
        console.error('Error fetching phases:', textStatus, errorThrown);
        alert('Failed to fetch phases. Please try again later.');
    });
}



/**
 * Function to fetch a specific phase by ID and display its details, including multiple teams.
 * @param {number} phaseId - The ID of the phase to fetch.
 */
export function fetchPhaseById(phaseId) {
    // Construct the URL with the phase ID
    const url = `/dashboard/phases/${phaseId}`;

    // Make an AJAX GET request to fetch the phase by ID
    $.get(url, function (data) {
        // Handle success - log the phase data to the console

        // Clear the existing list of phases
        $('#phaseList').empty();

        // If there are multiple teams, iterate and display each
        if (data.teams && data.teams.length > 0) {
            $.each(data.teams, function (index, team) {
                $('#phaseList').append(`<li>${data.phase_id} - Team: ${team.team_name} (Club: ${team.club_name})</li>`);
            });
        } else {
            // Handle case when no teams are returned
            $('#phaseList').append('<li>No teams found for this phase.</li>');
        }
        
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // Handle error
        console.error('Error fetching phase:', textStatus, errorThrown);
        alert('Failed to fetch the phase. Please try again later.');
    });
}
