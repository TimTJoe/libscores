import { populateSeasonsSelect, fetchTeamSuggestions, populatePhasesSelect, populateSeasonsSelectors } from "../utils.js";
import {populateCountriesSelect} from "../clubs.dash.js";


$(document).ready(function () {
    populateCountriesSelect('countries');
    
    // Cache DOM elements
    let team;
    let $teamInput = $('#team');
    let $fullname = $('#fullname');
    let $DOB = $('#DOB').val('');
    let $team =  $('#team').val('');
    let $countries = $('#countries').val('');
    let $status = $('#status').val('');
    let $market_value = $('#market_value').val('');
    let $photo = $('#photo').val('');
    let $position = $('#position').val('');
    let $suggestionsContainer = $('#team-suggestions');
    let $savePlayerButton = $('#savePlayer');
    const $playerMsg = $('#playerMsg');
    const $playerDialog = $('#playerDialog');
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
    const displayMsg = (message, isError = false) => {
        $playerMsg.show().removeClass('success error').addClass(isError ? 'error' : 'success').text(message);
    };

    $savePlayerButton.on('click', function (e) {
        e.preventDefault();

        // Gather form data
        const formData = new FormData();
        formData.append('fullname', $fullname.val());
        formData.append('DOB', $DOB.val());
        formData.append('team', team);
        formData.append('country', $countries.val());
        formData.append('status', $status.val());
        formData.append('market_value', $market_value.val());
        formData.append('position', $position.val());
        formData.append('photo', $('#photo')[0].files[0]); // Get file from input

        // Show loading spinner
        $('#spinner').show();
        $savePlayerButton.prop('disabled', true);

        // Submit form data via AJAX
        $.ajax({
            url: '/dashboard/players', // Updated URL to reflect new route
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                displayMsg('Player saved successfully');

                // console.log("new player", data.player)

                // Hide spinner and re-enable button
                $('#spinner').hide();
                $savePlayerButton.prop('disabled', false);

                // Clear form fields
                $fullname.val('');
                $DOB.val('');
                $team.val('');
                $countries.val('');
                $status.val('');
                $market_value.val('');
                $photo.val('');

                setTimeout(() => {
                    $playerMsg.fadeOut();
                }, 3000);

                // Dynamically append the new league data to the table
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Hide spinner and re-enable button
                $('#spinner').hide();
                $savePlayerButton.prop('disabled', false);

                // Show error message
                displayMsg('An error occurred while saving the league.');
                console.error('Error saving league:', textStatus, errorThrown);
            }
        });
    });

    // Optional: Close dialog on clicking close button
    $closeDialog.on('click', function () {
        $playerDialog.hide(); // Close dialog
        toggleSuggestions(false); // Hide suggestions
        $playerMsg.hide(); 
    });
});
