import { fetchCountySuggestions } from "../utils.js";

$(document).ready(function () {
    let team;
    const $nameInput = $('#name');
    const $message = $('#teamMsg');
    const $saveTeam = $('#saveTeam');
    const $suggestionsContainer = $('#county-suggestions');
    const $tournamentId = $('#tournament_id').text()

    function showMessage(message, type = 'success') {
        const color = type === 'success' ? 'green' : 'red';
        $message.text(message).css('color', color).fadeIn();
        setTimeout(() => $message.fadeOut(), 3000); // Auto-hide after 3 seconds
    }
    

    // Function to show or hide suggestions
    const toggleSuggestions = (show) => {
        if (show) {
            $suggestionsContainer.show();
        } else {
            $suggestionsContainer.hide();
        }
    };


    $nameInput.on('input', function () {
        const query = $(this).val();

        toggleSuggestions(query.length > 0); // Show or hide suggestions

        if (query.length === 0) return;

           fetchCountySuggestions(query)
            .then(teams => {
                $suggestionsContainer.empty(); // Clear previous suggestions

                if (teams.length > 0) {
                    const suggestions = teams.map(team => 
                        `<div class="suggestion" id="${team.id}">${team.name}</div>`
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
    })

    // Event listener for selecting a team from suggestions
    $(document).on('click', '.suggestion', function () {
        const selectedTeam = $(this).text();
        team = Number($(this).attr("id"));
        $nameInput.val(selectedTeam); // Set the team input value
        toggleSuggestions(false); // Hide suggestions
    });

   
    // Event handler for saving a new phase
    $saveTeam.on('click', function (event) {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData();
        formData.append('name', $('#name').val());
        formData.append('group', $('#group').val());
        formData.append('tournamentId', $tournamentId);
        formData.append('badge', $('#badge')[0].files[0]);
    

        // Ensure required fields are filled
        if (!formData) {
            return showMessage('Please fill in all fields.', 'red');
        }

        // Show loading spinner
        $('.teamSpinner').show();
        $saveTeam.prop('disabled', true);
        
        // AJAX request to save the new phase
        $.ajax({
            url: '/dashboard/tournaments/teams',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                showMessage('Team added successfully', 'success');
                console.log(data)
                // Clear the input fields
                $nameInput.val('');
                $('.teamSpinner').hide();
                $saveTeam.prop('disabled', false);
                
                setTimeout(() => {
                    $message.fadeOut();
                }, 3000);

            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('.teamSpinner').hide();
                $saveTeam.prop('disabled', false);
                showMessage('An error occurred while saving the phase.', 'red');
                console.error('Error saving phase:', textStatus, errorThrown);
            }
        });
    });

    // Optional: Close dialog on clicking close button
    $('#closeDialog').on('click', function () {
        // $('.dialog').hide(); // Close dialog
        toggleSuggestions(false); // Hide suggestions
        $message.hide(); 
    });

    
});

