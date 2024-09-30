import { populateSeasonsSelect, fetchTeamSuggestions, populatePhasesSelect, populateSeasonsSelectors } from "../utils.js";

$(document).ready(function () {
    let team;

    // Cache DOM elements
    const $teamInput = $('#team');
    const $suggestionsContainer = $('#team-suggestions');
    const $phaseSeasons = $('#phaseSeasons');
    const $savePhaseButton = $('#savePhase');
    const $phaseMsg = $('#phaseMsg');
    const $phaseDialog = $('#phaseDialog');
    const $closeDialog = $('#closeDialog');

    // Function to show or hide suggestions
    const toggleSuggestions = (show) => {
        if (show) {
            $suggestionsContainer.show();
        } else {
            $suggestionsContainer.hide();
        }
    };

    // Event listener for team input to fetch suggestions
    $teamInput.on('input', function () {
        const query = $(this).val();

        toggleSuggestions(query.length > 0); // Show or hide suggestions

        if (query.length === 0) return;

        // Fetch suggestions if the input has a query
        fetchTeamSuggestions(query)
            .then(teams => {
                $suggestionsContainer.empty(); // Clear previous suggestions

                if (teams.length > 0) {
                    const suggestions = teams.map(team => 
                        `<div class="suggestion" id="${team.id}">${team.club}</div>`
                    ).join(''); // Create suggestions as a single string
                    
                    $suggestionsContainer.html(suggestions); // Append all suggestions at once
                } else {
                    toggleSuggestions(false); // Hide if no suggestions
                }
            })
            .catch(err => {
                console.error('Error fetching team suggestions:', err);
                toggleSuggestions(false); // Hide suggestions on error
            });
    });

    // Event listener for selecting a team from suggestions
    $(document).on('click', '.suggestion', function () {
        const selectedTeam = $(this).text();
        team = Number($(this).attr("id"));
        $teamInput.val(selectedTeam); // Set the team input value
        toggleSuggestions(false); // Hide suggestions
    });

    // Function to display phase messages
    const displayPhaseMsg = (message, isError = false) => {
        $phaseMsg.show().removeClass('success error').addClass(isError ? 'error' : 'success').text(message);
    };

    // Event handler for saving a new phase
    $savePhaseButton.on('click', function (event) {
        event.preventDefault(); // Prevent default form submission

        const season = $phaseSeasons.val();

        // Ensure required fields are filled
        if (!team || !season) {
            return displayPhaseMsg('Please fill in all fields.', true);
        }

        // Show loading spinner
        $savePhaseButton.prop('disabled', true);
        
        // AJAX request to save the new phase
        $.ajax({
            url: '/dashboard/phases',
            type: 'POST',
            data: JSON.stringify({ season, team }), // Send data as JSON
            contentType: 'application/json',
            success: function () {
                displayPhaseMsg('Phase saved successfully');

                // Clear the input fields
                $teamInput.val('');
                $phaseSeasons.val('');
                $savePhaseButton.prop('disabled', false);
                
                setTimeout(() => {
                    $phaseMsg.fadeOut();
                }, 3000);

                // Repopulate the select dropdown if necessary
                populateSeasonsSelectors();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                displayPhaseMsg('An error occurred while saving the phase.', true);
                console.error('Error saving phase:', textStatus, errorThrown);
            }
        });
    });

    // Optional: Close dialog on clicking close button
    $closeDialog.on('click', function () {
        $phaseDialog.hide(); // Close dialog
        toggleSuggestions(false); // Hide suggestions
        $phaseMsg.hide(); 
    });
});
